# OIDC Authentication for GitHub Actions

This document provides detailed instructions for setting up OpenID Connect (OIDC) authentication between GitHub Actions and AWS for the ecom-learn-backend project.

## What is OIDC?

OpenID Connect (OIDC) allows GitHub Actions workflows to authenticate with AWS without storing long-lived AWS access keys as GitHub secrets. Instead, the workflow exchanges a short-lived token for an AWS session token using a trust relationship.

## Benefits of OIDC

1. **Enhanced Security**: No long-lived secrets stored in GitHub
2. **Simplified Management**: No need to rotate credentials
3. **Principle of Least Privilege**: Fine-grained permissions for specific repositories and branches

## Setup Instructions

### 1. Create an OIDC Identity Provider in AWS IAM

1. Go to AWS IAM Console
2. Navigate to "Identity providers"
3. Click "Add provider"
4. Select "OpenID Connect"
5. For the Provider URL, enter: `https://token.actions.githubusercontent.com`
6. For the Audience, enter: `sts.amazonaws.com`
7. Click "Get thumbprint" to verify the provider
8. Click "Add provider"

### 2. Create an IAM Role for GitHub Actions

1. Go to AWS IAM Console
2. Navigate to "Roles"
3. Click "Create role"
4. Under "Trusted entity type", select "Web identity"
5. Under "Identity provider", select `token.actions.githubusercontent.com`
6. For "Audience", select `sts.amazonaws.com`
7. Under "GitHub organization", enter `vinoddotcom` (your GitHub username or organization)
8. Under "GitHub repository", enter `ecom-learn-backend`
9. Click "Next"

### 3. Create and Attach IAM Policy

1. Go to AWS IAM Console
2. Navigate to "Policies"
3. Click "Create policy"
4. Select the JSON tab
5. Paste the following policy document:

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

6. Click "Next: Tags" (add tags if needed)
7. Click "Next: Review"
8. Name the policy: `EcomBackendDeployPolicy`
9. Add a description: "Policy for GitHub Actions OIDC to deploy to ECR and ECS"
10. Click "Create policy"
11. Return to the role creation browser tab/window that you left open
12. Search for and select your newly created `EcomBackendDeployPolicy`
13. Click "Next"
14. Name the role: `GitHubActionsOIDCRole`
15. Add a description: "Role for GitHub Actions OIDC authentication for ecom-learn-backend"
16. Click "Create role"

### 4. Configure GitHub Repository Variables

In your GitHub repository:

1. Go to "Settings" > "Secrets and variables" > "Variables" (repository level)
2. Add the following variables:
   - `AWS_REGION`: `ap-south-1`
   - `AWS_ROLE_ARN`: `arn:aws:iam::587294124303:role/GitHubActionsOIDCRole`
   - `ECR_REPOSITORY`: `ecom-learn/backend`
   - `ECS_SERVICE`: `ecom-learn-backend-server-1-service-tws6nx5s`
   - `ECS_CLUSTER`: `test-ecom-learn`

### 5. Configure Permissions in GitHub Workflow

Ensure your workflow file has the correct permissions:

```yaml
permissions:
  id-token: write # Required for OIDC
  contents: read
```

### 6. Configure AWS Credentials in the Workflow

Use the AWS credential action to obtain credentials via OIDC:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ vars.AWS_ROLE_ARN }}
    aws-region: ${{ vars.AWS_REGION }}
```

## Troubleshooting

### Common Issues

1. **"AccessDenied" error when assuming role**:

   - Verify the trust policy is correctly configured
   - Ensure the GitHub repository name matches exactly

2. **"Not authorized to perform sts:AssumeRoleWithWebIdentity"**:

   - Check that the OIDC provider is correctly set up
   - Verify the audience value (`sts.amazonaws.com`)

3. **"ECR repository not found"**:
   - Verify the ECR repository exists in the specified region
   - Check the permissions for the repository

### Verify OIDC Configuration

#### Using AWS Console

1. Navigate to IAM service
2. Click "Identity providers" in the left navigation
3. Verify that `token.actions.githubusercontent.com` appears in the list
4. Click on the provider to check its details and ensure:
   - The URL is `https://token.actions.githubusercontent.com`
   - The audience includes `sts.amazonaws.com`
   - The thumbprint is valid

#### Using AWS CLI

```bash
aws iam list-open-id-connect-providers
aws iam get-open-id-connect-provider --open-id-connect-provider-arn YOUR_PROVIDER_ARN
```

### Testing the OIDC Connection

To test that the OIDC connection works correctly:

1. Make a small change to your code repository
2. Push the change to trigger the CI/CD workflow
3. Go to your GitHub repository's "Actions" tab
4. Watch the workflow execution and check for any authentication errors
5. If the workflow succeeds in configuring AWS credentials, your OIDC setup is working properly

## References

- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
