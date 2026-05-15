## Phase 15: Production Deployment & AWS/EKS Setup

### Phase Overview
This final phase takes the locally developed microservices and deploys them to a production-ready cloud environment on AWS using Kubernetes (EKS). It establishes the CI/CD pipeline, container orchestration, and cloud infrastructure required to reliably run and scale the multi-agent AI system.

### Detailed Implementation Guide
1. **Production Dockerfiles**: Finalize multi-stage production `Dockerfile`s for all services (Next.js, Express APIs, Python Orchestrator) to optimize image size and security.
2. **CI/CD Pipeline**: Set up GitHub Actions workflows to run tests, build Docker images, and push them to AWS Elastic Container Registry (ECR) on merges to the main branch.
3. **AWS Infrastructure (IaC)**: Use Terraform or AWS CDK to provision the underlying AWS infrastructure: VPC, EKS Cluster, RDS for PostgreSQL, ElastiCache for Redis, Amazon MQ for RabbitMQ, S3 for report storage, and an Application Load Balancer (ALB).
4. **Kubernetes Manifests**: Define Kubernetes manifests (`Deployments`, `Services`, `ConfigMaps`, `Secrets`) for all components, including the Ingress Controller and a monitoring stack (Prometheus/Grafana).
5. **Deployment & Routing**: Deploy the Kubernetes manifests to EKS. Configure the ALB Ingress to route traffic to the Next.js frontend and the API Gateway. Set up Route53 DNS records and a CloudFront distribution for the frontend assets.

### Tasks to complete
- Finalize Dockerfiles and set up GitHub Actions CI/CD to push images to AWS ECR.
- Define Kubernetes manifests (or Helm charts) for all services, Ingress Controller, and monitoring stack.
- Provision the AWS infrastructure (VPC, EKS, RDS PostgreSQL, ElastiCache Redis, Amazon MQ RabbitMQ, ALB) using Terraform or similar.
- Deploy the application and configure Route53 and CloudFront.

### Completion check
- [ ] The platform is accessible via a public domain.
- [ ] Both the CLI and Web Dashboard can successfully execute a full review pipeline against the deployed Kubernetes cluster.
