#!/bin/bash

echo "⚠  This will delete the EKS cluster and all AWS resources."
read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "[1/4] Deleting Kubernetes resources..."
kubectl delete namespace mergeguard --ignore-not-found
kubectl delete -f k8s/infra.yaml --ignore-not-found 2>/dev/null
echo "✔ Kubernetes resources deleted"

echo ""
echo "[2/4] Deleting EKS cluster (takes ~15 min)..."
eksctl delete cluster --name mergeguard --region us-east-1
echo "✔ EKS cluster deleted"

echo ""
echo "[3/4] Deleting ECR repositories..."
for svc in api-gateway auth-service review-service notification-service web-dashboard ai-orchestrator; do
  aws ecr delete-repository \
    --repository-name mergeguard-$svc \
    --region us-east-1 \
    --force 2>/dev/null && echo "  ✔ Deleted: mergeguard-$svc"
done

echo ""
echo "[4/4] Deleting IAM policy..."
aws iam delete-policy \
  --policy-arn arn:aws:iam::221045608158:policy/AWSLoadBalancerControllerIAMPolicy 2>/dev/null && echo "  ✔ IAM policy deleted"

echo ""
echo "✔ All done — billing stopped."
echo "  To redeploy later: kubectl apply -f k8s/"
