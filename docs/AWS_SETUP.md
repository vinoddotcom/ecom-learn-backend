# AWS Resources Setup for ECS Deployment

This document provides step-by-step instructions for setting up the required AWS resources for deploying the ecom-learn-backend application to Amazon ECS Fargate.

## Prerequisites

- AWS CLI installed and configured
- AWS Account with appropriate permissions
- Basic understanding of AWS services (ECR, ECS, IAM)

## 1. Set Up Amazon ECR Repository

```bash
# Create a new ECR repository
aws ecr create-repository \
    --repository-name ecom-learn-backend \
    --image-scanning-configuration scanOnPush=true \
    --region <your-aws-region>
```

## 2. Set Up Amazon ECS Cluster

```bash
# Create a new ECS cluster
aws ecs create-cluster \
    --cluster-name ecom-backend-cluster \
    --capacity-providers FARGATE \
    --region <your-aws-region>
```

## 3. Create a Task Execution Role

First, create a trust policy JSON file (task-execution-trust-policy.json):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Then create the role:

```bash
# Create the task execution role
aws iam create-role \
    --role-name ecom-backend-execution-role \
    --assume-role-policy-document file://task-execution-trust-policy.json

# Attach the necessary policy
aws iam attach-role-policy \
    --role-name ecom-backend-execution-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# If you need to access AWS secrets for environment variables, also attach:
aws iam attach-role-policy \
    --role-name ecom-backend-execution-role \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

## 4. Register a Task Definition

Create a task definition JSON file (task-definition.json):

```json
{
  "family": "ecom-backend-task",
  "executionRoleArn": "arn:aws:iam::<your-account-id>:role/ecom-backend-execution-role",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "ecom-backend-container",
      "image": "<your-account-id>.dkr.ecr.<your-region>.amazonaws.com/ecom-learn-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "8000" }
      ],
      "secrets": [
        {
          "name": "MONGODB_USER_NAME",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:MONGODB_USER_NAME::"
        },
        {
          "name": "MONGODB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:MONGODB_PASSWORD::"
        },
        {
          "name": "MONGODB_CLUSTER",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:MONGODB_CLUSTER::"
        },
        {
          "name": "MONGODB_DATABASE",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:MONGODB_DATABASE::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:JWT_SECRET::"
        },
        {
          "name": "JWT_EXPIRE",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:JWT_EXPIRE::"
        },
        {
          "name": "CLOUDINARY_NAME",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:CLOUDINARY_NAME::"
        },
        {
          "name": "CLOUDINARY_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:CLOUDINARY_API_KEY::"
        },
        {
          "name": "CLOUDINARY_API_SECRET",
          "valueFrom": "arn:aws:secretsmanager:<your-region>:<your-account-id>:secret:ecom-backend-secrets:CLOUDINARY_API_SECRET::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecom-backend",
          "awslogs-region": "<your-region>",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 5
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024"
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

## 5. Create Secrets in AWS Secrets Manager

```bash
# Create a secret with all environment variables
aws secretsmanager create-secret \
    --name ecom-backend-secrets \
    --description "Environment variables for ecom-learn-backend" \
    --secret-string '{
        "MONGODB_USER_NAME": "your_mongo_username",
        "MONGODB_PASSWORD": "your_mongo_password",
        "MONGODB_CLUSTER": "your_mongo_cluster",
        "MONGODB_DATABASE": "your_mongo_database",
        "JWT_SECRET": "your_jwt_secret",
        "JWT_EXPIRE": "your_jwt_expiry",
        "CLOUDINARY_NAME": "your_cloudinary_name",
        "CLOUDINARY_API_KEY": "your_cloudinary_api_key",
        "CLOUDINARY_API_SECRET": "your_cloudinary_api_secret"
    }'
```

## 6. Create a Security Group

```bash
# Create security group
aws ec2 create-security-group \
    --group-name ecom-backend-sg \
    --description "Security group for ecom-backend ECS service" \
    --vpc-id <your-vpc-id>

# Add inbound rule for port 8000
aws ec2 authorize-security-group-ingress \
    --group-id <security-group-id> \
    --protocol tcp \
    --port 8000 \
    --cidr 0.0.0.0/0
```

## 7. Create an ECS Service

```bash
aws ecs create-service \
    --cluster ecom-backend-cluster \
    --service-name ecom-backend-service \
    --task-definition ecom-backend-task:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-id-1>,<subnet-id-2>],securityGroups=[<security-group-id>],assignPublicIp=ENABLED}" \
    --platform-version LATEST
```

## 8. Create CloudWatch Log Group

```bash
aws logs create-log-group \
    --log-group-name /ecs/ecom-backend
```

## 9. Create a Load Balancer (Optional)

For production environments, you should consider adding an Application Load Balancer in front of your ECS service for improved reliability and HTTPS support:

```bash
# Create a load balancer
aws elbv2 create-load-balancer \
    --name ecom-backend-alb \
    --subnets <subnet-id-1> <subnet-id-2> \
    --security-groups <security-group-id> \
    --scheme internet-facing \
    --type application

# Create a target group
aws elbv2 create-target-group \
    --name ecom-backend-tg \
    --protocol HTTP \
    --port 8000 \
    --vpc-id <your-vpc-id> \
    --target-type ip \
    --health-check-path /health

# Create a listener
aws elbv2 create-listener \
    --load-balancer-arn <load-balancer-arn> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

Then update your ECS service to use the load balancer:

```bash
aws ecs update-service \
    --cluster ecom-backend-cluster \
    --service ecom-backend-service \
    --load-balancers targetGroupArn=<target-group-arn>,containerName=ecom-backend-container,containerPort=8000
```

## 10. Final Step - Verify Deployment

After setting up all the above resources and running the GitHub Actions workflow, verify that your application is deployed and running:

```bash
aws ecs describe-services \
    --cluster ecom-backend-cluster \
    --services ecom-backend-service

# Check running tasks
aws ecs list-tasks \
    --cluster ecom-backend-cluster \
    --service-name ecom-backend-service
```

If you've set up a load balancer, you can access your application via the load balancer DNS name.
