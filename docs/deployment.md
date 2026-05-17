# MergeGuard — Full Deployment Guide

This document covers three parts:
1. **AWS/EKS Production Deployment** (platform backend + frontend)
2. **Node.js CLI → npm/pnpm** (so users can `pnpm add -g mergeguard`)
3. **Python CLI → PyPI** (so users can `pip install mergeguard-cli`)

---

## Overview

```
                        ┌─────────────────────────────────┐
                        │          GitHub Repo             │
                        │  push to main → GitHub Actions  │
                        └────────────┬────────────────────┘
                                     │ builds Docker images
                                     ▼
                        ┌─────────────────────────────────┐
                        │       AWS ECR (image registry)  │
                        └────────────┬────────────────────┘
                                     │ pulls images
                                     ▼
Route53 → CloudFront → ALB → EKS Cluster (pods running your services)
                                     │
                        RDS + Redis + RabbitMQ + S3
```

Once the platform is live at `api.mergeguard.io`, users install the CLI once and point it at that URL.

---

## Part 1 — AWS/EKS Production Deployment

### Prerequisites

- AWS account with IAM user that has EKS, ECR, RDS, ElastiCache, MQ, S3, VPC permissions
- Tools installed: `aws-cli`, `kubectl`, `eksctl`, `terraform`, `docker`, `helm`
- A domain name (e.g. `mergeguard.io`) registered in Route53

```bash
# Verify tools
aws --version
kubectl version --client
eksctl version
terraform --version
docker --version
```

---

### Step 1 — Dockerfiles

Create a production Dockerfile for each service. Use multi-stage builds to keep images small.

**`packages/web-dashboard/Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**`services/api-gateway/Dockerfile`** (same pattern for auth, review, notification services)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**`services/ai-orchestrator/Dockerfile`**
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Step 2 — GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS \
            --password-stdin ${{ env.ECR_REGISTRY }}

      - name: Build & push all images
        run: |
          services=(api-gateway auth-service review-service notification-service ai-orchestrator web-dashboard)
          for svc in "${services[@]}"; do
            docker build -t $ECR_REGISTRY/mergeguard-$svc:${{ github.sha }} \
              -f services/$svc/Dockerfile services/$svc
            docker push $ECR_REGISTRY/mergeguard-$svc:${{ github.sha }}
          done

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Configure kubectl
        run: aws eks update-kubeconfig --name mergeguard-cluster --region ${{ env.AWS_REGION }}

      - name: Roll out new images
        run: |
          services=(api-gateway auth-service review-service notification-service ai-orchestrator web-dashboard)
          for svc in "${services[@]}"; do
            kubectl set image deployment/$svc \
              $svc=$ECR_REGISTRY/mergeguard-$svc:${{ github.sha }} -n mergeguard
          done
```

**GitHub Secrets to add** (`Settings → Secrets → Actions`):
| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |

---

### Step 3 — Terraform Infrastructure

Create `infra/main.tf`:

```hcl
provider "aws" {
  region = "us-east-1"
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "mergeguard-vpc"
  cidr    = "10.0.0.0/16"
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
}

# EKS Cluster
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "~> 20.0"
  cluster_name    = "mergeguard-cluster"
  cluster_version = "1.30"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 5
      desired_size   = 2
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier        = "mergeguard-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  db_name           = "mergeguard"
  username          = var.db_username
  password          = var.db_password
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  skip_final_snapshot    = false
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "mergeguard-redis"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
  subnet_group_name = aws_elasticache_subnet_group.main.name
}

# Amazon MQ (RabbitMQ)
resource "aws_mq_broker" "rabbitmq" {
  broker_name    = "mergeguard-mq"
  engine_type    = "RabbitMQ"
  engine_version = "3.13"
  host_instance_type = "mq.t3.micro"
  user {
    username = var.mq_username
    password = var.mq_password
  }
}

# S3 Report Storage
resource "aws_s3_bucket" "reports" {
  bucket = "mergeguard-reports-${var.environment}"
}

# ECR Repositories
resource "aws_ecr_repository" "services" {
  for_each = toset([
    "api-gateway", "auth-service", "review-service",
    "notification-service", "ai-orchestrator", "web-dashboard"
  ])
  name = "mergeguard-${each.key}"
}
```

```bash
# Provision everything
cd infra
terraform init
terraform plan
terraform apply
```

---

### Step 4 — Kubernetes Manifests

Create one `Deployment` + `Service` per microservice. Example for `review-service`:

```yaml
# k8s/review-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: review-service
  namespace: mergeguard
spec:
  replicas: 2
  selector:
    matchLabels:
      app: review-service
  template:
    metadata:
      labels:
        app: review-service
    spec:
      containers:
        - name: review-service
          image: <ECR_REGISTRY>/mergeguard-review-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: mergeguard-secrets
                  key: database-url
            - name: RABBITMQ_URL
              valueFrom:
                secretKeyRef:
                  name: mergeguard-secrets
                  key: rabbitmq-url
---
apiVersion: v1
kind: Service
metadata:
  name: review-service
  namespace: mergeguard
spec:
  selector:
    app: review-service
  ports:
    - port: 3000
      targetPort: 3000
```

**Ingress (routes traffic to the right pod):**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mergeguard-ingress
  namespace: mergeguard
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
spec:
  rules:
    - host: api.mergeguard.io
      http:
        paths:
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 3000
    - host: app.mergeguard.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-dashboard
                port:
                  number: 3000
```

```bash
# Deploy everything
kubectl create namespace mergeguard
kubectl apply -f k8s/
```

---

### Step 5 — Route53 + CloudFront

1. **ALB** is created automatically by the Ingress Controller — grab its DNS from:
   ```bash
   kubectl get ingress -n mergeguard
   ```

2. **Route53** — create A records (alias):
   - `api.mergeguard.io` → ALB DNS
   - `app.mergeguard.io` → CloudFront distribution

3. **CloudFront** — create a distribution:
   - Origin: ALB DNS for `app.mergeguard.io`
   - Cache behavior: cache static assets (`_next/static/*`), bypass cache for API routes

---

### Step 6 — Verify Deployment

```bash
# Check all pods are Running
kubectl get pods -n mergeguard

# Check ingress has an address
kubectl get ingress -n mergeguard

# Test the API
curl https://api.mergeguard.io/health

# Test the frontend
open https://app.mergeguard.io
```

---

## Part 2 — Publish Node.js CLI to npm

Users will install with `pnpm add -g mergeguard` or `npm install -g mergeguard`.

### Prerequisites

- npm account at [npmjs.com](https://npmjs.com)
- Logged in: `npm login`

### One-time setup — update `package.json`

```json
{
  "name": "mergeguard",
  "version": "1.0.0",
  "description": "MergeGuard AI Code Review CLI",
  "bin": { "mergeguard": "./bin/index.js" },
  "files": ["dist", "bin"],
  "publishConfig": { "access": "public" }
}
```

### Publish

```bash
cd packages/cli

# Build TypeScript
pnpm run build

# Dry run — check what will be published
npm pack --dry-run

# Publish to npm
npm publish
```

### Automate with GitHub Actions

Add to `.github/workflows/publish-cli.yml`:

```yaml
name: Publish CLI to npm

on:
  push:
    tags:
      - "cli-v*"   # trigger on: git tag cli-v1.0.1

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: pnpm install
      - run: pnpm run build
        working-directory: packages/cli
      - run: npm publish
        working-directory: packages/cli
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Secret to add:** `NPM_TOKEN` — generate at npmjs.com → Account → Access Tokens → Automation token.

### Users install with

```bash
# pnpm (recommended)
pnpm add -g mergeguard

# npm
npm install -g mergeguard

# one-time without installing
npx mergeguard review
```

### Bump version for future releases

```bash
cd packages/cli
npm version patch   # 1.0.0 → 1.0.1
git push --tags     # triggers GitHub Actions → auto-publishes
```

---

## Part 3 — Publish Python CLI to PyPI

Users will install with `pip install mergeguard-cli`.

### Prerequisites

- PyPI account at [pypi.org](https://pypi.org)
- Tools: `pip install build twine`

### One-time setup — update `pyproject.toml`

Create `cli/pyproject.toml`:

```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "mergeguard-cli"
version = "1.0.0"
description = "MergeGuard AI Code Review CLI"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "typer>=0.9.0",
    "rich>=13.0.0",
    "requests>=2.31.0",
    "sseclient-py>=1.8.0",
]

[project.scripts]
mergeguard = "mergeguard_cli.main:app"

[tool.setuptools.packages.find]
where = ["src"]
```

### Publish

```bash
cd cli

# Build the package
python -m build
# creates: dist/mergeguard_cli-1.0.0.tar.gz
#          dist/mergeguard_cli-1.0.0-py3-none-any.whl

# Test on TestPyPI first (optional but recommended)
twine upload --repository testpypi dist/*
pip install --index-url https://test.pypi.org/simple/ mergeguard-cli

# Publish to real PyPI
twine upload dist/*
```

### Automate with GitHub Actions

Add to `.github/workflows/publish-python-cli.yml`:

```yaml
name: Publish Python CLI to PyPI

on:
  push:
    tags:
      - "pycli-v*"   # trigger on: git tag pycli-v1.0.1

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install build twine
      - run: python -m build
        working-directory: cli
      - run: twine upload dist/*
        working-directory: cli
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_TOKEN }}
```

**Secret to add:** `PYPI_TOKEN` — generate at pypi.org → Account Settings → API Tokens.

### Users install with

```bash
pip install mergeguard-cli
```

### Bump version for future releases

```bash
# Update version in cli/pyproject.toml → "1.0.1"
git tag pycli-v1.0.1
git push --tags    # triggers GitHub Actions → auto-publishes
```

---

## Full Release Checklist

### Platform deployment
- [ ] Dockerfiles written for all services
- [ ] GitHub Actions CI/CD set up (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID` secrets added)
- [ ] Terraform provisioned: VPC, EKS, RDS, Redis, RabbitMQ, S3, ECR
- [ ] Kubernetes manifests deployed (`kubectl apply -f k8s/`)
- [ ] Ingress has public ALB address
- [ ] Route53 A records pointing to ALB and CloudFront
- [ ] `https://api.mergeguard.io/health` returns 200
- [ ] `https://app.mergeguard.io` loads the dashboard

### Node.js CLI
- [ ] `npm login` done
- [ ] `pnpm run build` succeeds
- [ ] `npm publish` succeeds
- [ ] `pnpm add -g mergeguard` works on a clean machine
- [ ] `NPM_TOKEN` secret added to GitHub

### Python CLI
- [ ] `pyproject.toml` created with correct metadata
- [ ] `python -m build` succeeds
- [ ] `twine upload dist/*` succeeds
- [ ] `pip install mergeguard-cli` works on a clean machine
- [ ] `PYPI_TOKEN` secret added to GitHub

---

## After Deployment — User Flow

```bash
# Install (once)
pnpm add -g mergeguard        # Node.js CLI
pip install mergeguard-cli    # Python CLI

# Login (once) — point at your real deployed API
mergeguard auth login
#  > API key:  ●●●●●●●●●●●●
#  > API URL:  https://api.mergeguard.io

# Review any PR — fully interactive, no flags
mergeguard review
#  [1/4] Fetching your account…     ✔ Signed in as Saswat
#  [2/4] Loading your repositories… (pick from list)
#  [3/4] Pull request details        PR number: 42
#  [4/4] GitHub access token         ✔ Token already saved
#  ──────────────────────────────────────────────
#  Queueing review for owner/repo PR #42…
#  [discovery] analyzing diff…
#  [security]  scanning for vulnerabilities…
#  [summary]   synthesizing report…
#  ──────────────────────────────────────────────
#  ✔ Review complete!
#  Recommendation: APPROVE
```
