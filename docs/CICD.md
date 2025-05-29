# CI/CD with GitHub Actions, AWS ECR, and ECS Fargate

This document outlines how to set up the CI/CD pipeline for deploying this application to AWS ECS Fargate using GitHub Actions and OpenID Connect (OIDC) for authentication.

## Pipeline Overview

The CI/CD pipeline:

1. Tests the application
2. Builds a Docker image
3. Pushes the image to Amazon ECR
4. Deploys the image to Amazon ECS Fargate

## Setup Instructions

### 1. Create an ECR Repository

```bash
aws ecr create-repository --repository-name ecom-learn-backend --region <your-region>
```

### 2. Set Up ECS Resources

Create the following ECS resources:

- ECS Cluster
- Task Definition
- ECS Service (using Fargate launch type)

Detailed instructions for setting up all the required AWS resources can be found in [AWS Setup Guide](./AWS_SETUP.md)

### 3. Set Up OIDC Authentication

For detailed instructions on setting up OIDC authentication with AWS, see the [OIDC Setup Guide](./OIDC_SETUP.md).

#### 3.1 Create an Identity Provider in AWS IAM

1. Go to AWS IAM Console
2. Navigate to Identity providers
3. Choose "Add provider"
4. Choose "OpenID Connect"
5. Enter:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
6. Choose "Add provider"

#### 3.2 Create IAM Role for GitHub Actions

1. Go to AWS IAM Console
2. Navigate to Roles
3. Create a new role
4. Choose "Web identity" as the trusted entity type
5. Choose:
   - Identity provider: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - GitHub repo: `<your-github-org-or-username>/<your-github-repo>`
6. Choose "Next"
7. Create a custom policy with the specific permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "ECRAuthToken",
         "Effect": "Allow",
         "Action": "ecr:GetAuthorizationToken",
         "Resource": "*"
       },
       {
         "Sid": "ECRAccess",
         "Effect": "Allow",
         "Action": [
           "ecr:BatchCheckLayerAvailability",
           "ecr:GetDownloadUrlForLayer",
           "ecr:BatchGetImage",
           "ecr:PutImage",
           "ecr:InitiateLayerUpload",
           "ecr:UploadLayerPart",
           "ecr:CompleteLayerUpload"
         ],
         "Resource": "arn:aws:ecr:ap-south-1:587294124303:repository/ecom-learn/backend"
       },
       {
         "Sid": "ECSAccessSpecific",
         "Effect": "Allow",
         "Action": ["ecs:UpdateService", "ecs:DescribeServices", "ecs:DescribeTaskDefinition"],
         "Resource": [
           "arn:aws:ecs:ap-south-1:587294124303:cluster/test-ecom-learn",
           "arn:aws:ecs:ap-south-1:587294124303:service/test-ecom-learn/ecom-learn-backend-server-1-service-tws6nx5s",
           "arn:aws:ecs:ap-south-1:587294124303:task-definition/ecom-learn-backend-server-1:*"
         ]
       },
       {
         "Sid": "CloudWatchLogsAccess",
         "Effect": "Allow",
         "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
         "Resource": "*"
       }
     ]
   }
   ```
8. Give the role and policy descriptive names (e.g., `GitHubActionsOIDCRole` and `EcomBackendDeployPolicy`)
9. Create the role and note the ARN for use in GitHub

### 4. Configure GitHub Repository Variables

In your GitHub repository settings, go to Settings > Secrets and variables > Variables (repository level), and add the following variables:

1. `AWS_REGION` - Set to `ap-south-1`
2. `AWS_ROLE_ARN` - Set to the ARN of the IAM role created in step 3.2 (e.g., `arn:aws:iam::587294124303:role/GitHubActionsOIDCRole`)
3. `ECR_REPOSITORY` - Set to `ecom-learn/backend`
4. `ECS_SERVICE` - Set to `ecom-learn-backend-server-1-service-tws6nx5s`
5. `ECS_CLUSTER` - Set to `test-ecom-learn`

Make sure these values exactly match your AWS resources as specified in the IAM policy.

## Testing the Pipeline

The pipeline can be triggered in the following ways:

1. Pushing to the `main` branch
2. Creating a pull request targeting the `main` branch
3. Manually triggering the workflow from the GitHub Actions tab

## Monitoring Deployments

After the pipeline runs:

1. Check the GitHub Actions tab for the workflow status
2. Check the AWS ECS console to verify your service updated successfully
3. Check the logs in CloudWatch for your container

## Rollback Process

If a deployment fails:

1. In the GitHub Actions tab, find the last successful workflow run
2. Click on the workflow and find the image tag it created
3. Go to your AWS ECS task definition and update it to use the previous image tag
4. Update your ECS service to use the new task definition revision
