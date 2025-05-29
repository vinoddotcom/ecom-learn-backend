# AWS Resources Setup for ECS Deployment

This document provides step-by-step instructions for setting up the required AWS resources for deploying the ecom-learn-backend application to Amazon ECS Fargate. Instructions are provided for both the AWS Management Console and AWS CLI approaches.

## Prerequisites

- AWS Account with appropriate permissions
- Basic understanding of AWS services (ECR, ECS, IAM)
- For CLI approach: AWS CLI installed and configured

## 1. Set Up Amazon ECR Repository

### Console Approach

1. Sign in to the AWS Management Console
2. Navigate to Amazon ECR service
3. Click "Create repository"
4. Enter repository name: `ecom-learn/backend`
5. Under "Image scan settings", enable "Scan on push"
6. Click "Create repository"

### CLI Approach

```bash
# Create a new ECR repository
aws ecr create-repository \
    --repository-name ecom-learn/backend \
    --image-scanning-configuration scanOnPush=true \
    --region ap-south-1
```

## 2. Set Up Amazon ECS Cluster

### Console Approach

1. Navigate to Amazon ECS service
2. Click "Clusters" in the left navigation
3. Click "Create cluster"
4. Enter cluster name: `test-ecom-learn`
5. For "Infrastructure", select "AWS Fargate (serverless)"
6. Click "Create"

### CLI Approach

```bash
# Create a new ECS cluster
aws ecs create-cluster \
    --cluster-name test-ecom-learn \
    --capacity-providers FARGATE \
    --region ap-south-1
```

## 3. Create a Task Execution Role

### Console Approach

1. Navigate to IAM service
2. Click "Roles" in the left navigation
3. Click "Create role"
4. Select "AWS Service" as the trusted entity type
5. For use case, choose "Elastic Container Service" and then "Elastic Container Service Task"
6. Click "Next"
7. Search for and attach these policies:
   - `AmazonECSTaskExecutionRolePolicy`
   - `SecretsManagerReadWrite` (if you need to access secrets)
8. Click "Next"
9. Enter role name: `ecsTaskExecutionRole`
10. Click "Create role"

### CLI Approach

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
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://task-execution-trust-policy.json

# Attach the necessary policy
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# If you need to access AWS secrets for environment variables, also attach:
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

## 4. Register a Task Definition

### Console Approach

1. Navigate to ECS service
2. Click "Task Definitions" in the left navigation
3. Click "Create new task definition"
4. Choose "Fargate" for launch type
5. Enter task definition name: `ecom-learn-backend-server-1`
6. Select task execution role: `ecsTaskExecutionRole`
7. Set task memory to 1GB and CPU to 0.5 vCPU
8. Add container:
   - Container name: `ecom-learn-backend-container`
   - Image URI: `587294124303.dkr.ecr.ap-south-1.amazonaws.com/ecom-learn/backend:latest`
   - Port mappings: `8000`
   - Environment variables:
     - `NODE_ENV=production`
     - `PORT=8000`
   - For secrets, add from Secrets Manager (with the appropriate ARNs)
   - Set health check command: `CMD-SHELL, wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1`
9. Click "Create"

### CLI Approach

Create a task definition JSON file (task-definition.json):

```json
{
  "family": "ecom-learn-backend-server-1",
  "executionRoleArn": "arn:aws:iam::587294124303:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "ecom-learn-backend-container",
      "image": "587294124303.dkr.ecr.ap-south-1.amazonaws.com/ecom-learn/backend:latest",
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
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:MONGODB_USER_NAME::"
        },
        {
          "name": "MONGODB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:MONGODB_PASSWORD::"
        },
        {
          "name": "MONGODB_CLUSTER",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:MONGODB_CLUSTER::"
        },
        {
          "name": "MONGODB_DATABASE",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:MONGODB_DATABASE::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:JWT_SECRET::"
        },
        {
          "name": "JWT_EXPIRE",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:JWT_EXPIRE::"
        },
        {
          "name": "CLOUDINARY_NAME",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:587294124303:secret:ecom-learn/backend/env-jkiq7K:CLOUDINARY_NAME::"
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

### Console Approach

1. Navigate to AWS Secrets Manager
2. Click "Store a new secret"
3. Choose "Other type of secrets"
4. Add key-value pairs for each environment variable:
   - `MONGODB_USER_NAME`: your_mongo_username
   - `MONGODB_PASSWORD`: your_mongo_password
   - `MONGODB_CLUSTER`: your_mongo_cluster
   - `MONGODB_DATABASE`: your_mongo_database
   - `JWT_SECRET`: your_jwt_secret
   - `JWT_EXPIRE`: your_jwt_expiry
   - `CLOUDINARY_NAME`: your_cloudinary_name
   - `CLOUDINARY_API_KEY`: your_cloudinary_api_key
   - `CLOUDINARY_API_SECRET`: your_cloudinary_api_secret
5. Click "Next"
6. Enter secret name: `ecom-learn/backend/env`
7. Add description: "Environment variables for ecom-learn-backend"
8. Click "Next", then "Next" again
9. Click "Store" to create the secret

### CLI Approach

```bash
# Create a secret with all environment variables
aws secretsmanager create-secret \
    --name ecom-learn/backend/env \
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

### Console Approach

1. Navigate to VPC service
2. Click "Security Groups" in the left navigation
3. Click "Create security group"
4. Enter security group name: `ecom-backend-sg`
5. Add description: "Security group for ecom-backend ECS service"
6. Select your VPC from the dropdown
7. Under "Inbound rules", click "Add rule":
   - Type: Custom TCP
   - Port range: 8000
   - Source: Anywhere-IPv4 (0.0.0.0/0)
   - Description: Allow access to application port
8. Click "Create security group"

### CLI Approach

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

### Console Approach

1. Navigate to ECS service
2. Click on your cluster: `test-ecom-learn`
3. Click "Services" tab, then "Create"
4. Configure service:
   - Launch type: `FARGATE`
   - Task definition: `ecom-learn-backend-server-1`
   - Revision: latest
   - Service name: `ecom-learn-backend-server-1-service-tws6nx5s`
   - Number of tasks: 1
5. Click "Next"
6. Configure networking:
   - VPC: Select your VPC
   - Subnets: Select at least two subnets
   - Security groups: Select the security group created earlier
   - Auto-assign public IP: ENABLED
7. Click "Next", then "Next" again
8. Review and click "Create Service"

### CLI Approach

```bash
aws ecs create-service \
    --cluster test-ecom-learn \
    --service-name ecom-learn-backend-server-1-service-tws6nx5s \
    --task-definition ecom-learn-backend-server-1:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-11111111111111111,subnet-22222222222222222],securityGroups=[sg-33333333333333333],assignPublicIp=ENABLED}" \
    --platform-version LATEST
```

## 8. Create CloudWatch Log Group

### Console Approach

1. Navigate to CloudWatch service
2. Click "Log groups" in the left navigation
3. Click "Create log group"
4. Enter log group name: `/aws/ecs/ecom-learn-backend`
5. Configure retention setting if desired
6. Click "Create"

### CLI Approach

```bash
aws logs create-log-group \
    --log-group-name /aws/ecs/ecom-learn-backend
```

## 9. Create a Load Balancer (Optional)

For production environments, you should consider adding an Application Load Balancer in front of your ECS service for improved reliability and HTTPS support.

### Console Approach

1. Navigate to EC2 service
2. Click "Load Balancers" in the left navigation
3. Click "Create Load Balancer"
4. Choose "Application Load Balancer"
5. Configure load balancer:
   - Name: `ecom-backend-alb`
   - Scheme: internet-facing
   - IP address type: ipv4
   - VPC: Select your VPC
   - Mappings: Select at least two subnets
   - Security groups: Select or create a security group allowing HTTP/HTTPS
6. Configure listeners and routing:
   - Add listener on port 80
   - Create a target group:
     - Target type: IP addresses
     - Name: `ecom-backend-tg`
     - Protocol: HTTP, Port: 8000
     - VPC: Select your VPC
     - Health check path: `/health`
7. Review and create

### CLI Approach

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

After setting up all the above resources and running the GitHub Actions workflow, verify that your application is deployed and running.

### Console Approach

1. Navigate to ECS service
2. Click on your cluster: `test-ecom-learn`
3. Click on the "Services" tab
4. Click on your service: `ecom-learn-backend-server-1-service-tws6nx5s`
5. Check the "Tasks" tab to ensure tasks are running (status should be RUNNING)
6. To view logs:
   - Navigate to CloudWatch
   - Click "Log groups"
   - Select the log group you created
   - Click on the log stream for your running task

If you've set up a load balancer, you can access your application via the load balancer DNS name, which can be found in the EC2 > Load Balancers section.

### CLI Approach

```bash
aws ecs describe-services \
    --cluster test-ecom-learn \
    --services ecom-learn-backend-server-1-service-tws6nx5s

# Check running tasks
aws ecs list-tasks \
    --cluster test-ecom-learn \
    --service-name ecom-learn-backend-server-1-service-tws6nx5s
```
