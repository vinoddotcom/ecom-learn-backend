# CI/CD Architecture with OIDC

This document provides a visual overview of our CI/CD pipeline architecture using GitHub Actions for CI/CD and AWS services for deployment, with OIDC authentication.

## Architecture Overview

```
┌─────────────────────┐      ┌───────────────────┐     ┌──────────────────────┐
│                     │      │                   │     │                      │
│    GitHub Repo      │──┬──▶│  GitHub Actions   │────▶│   OIDC Provider      │
│                     │  │   │                   │     │                      │
└─────────────────────┘  │   └───────────────────┘     └──────────┬───────────┘
                         │                                        │
                         │                                        ▼
┌─────────────────────┐  │   ┌───────────────────┐     ┌──────────────────────┐
│                     │  │   │                   │     │                      │
│    Source Code      │──┘   │   AWS IAM Role    │◀────│   Trust Relationship │
│                     │      │                   │     │                      │
└─────────────────────┘      └────────┬──────────┘     └──────────────────────┘
                                      │
                                      ▼
                            ┌────────────────────┐
                            │                    │
                            │  IAM Permissions   │
                            │                    │
                            └────────┬───────────┘
                                     │
                 ┌──────────────────┬┴──────────────────┐
                 │                  │                   │
                 ▼                  ▼                   ▼
        ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
        │                │ │                │ │                │
        │  AWS ECR       │ │  AWS ECS       │ │  CloudWatch    │
        │  Repository    │ │  Service       │ │  Logs          │
        │                │ │                │ │                │
        └────┬───────────┘ └───────┬────────┘ └────────────────┘
             │                     │
             │                     │
             ▼                     ▼
  ┌────────────────────┐  ┌────────────────────┐
  │                    │  │                    │
  │  Docker Image      │  │  ECS Fargate Task  │
  │                    │  │                    │
  └────────────────────┘  └────────────────────┘
```

## Flow Description

1. **Source Code**: Developers push code changes to the GitHub repository
2. **GitHub Actions**: CI/CD workflow is triggered by the push
3. **OIDC Authentication**:
   - GitHub Actions requests a JWT token from GitHub's OIDC provider
   - The token is presented to AWS to assume the IAM role using `sts:AssumeRoleWithWebIdentity`
   - AWS verifies the token against the trust policy (checks repository and audience)
   - Temporary credentials are returned to GitHub Actions
4. **Build and Push**:
   - The workflow uses the temporary credentials to build and push the Docker image to ECR
5. **Deploy**:
   - The workflow uses the same credentials to update the ECS service, forcing a deployment of the new image
6. **Logs and Monitoring**:
   - CloudWatch collects logs from the running ECS tasks

## Security Considerations

1. **No Long-lived Credentials**: The OIDC approach eliminates the need to store long-lived AWS credentials in GitHub
2. **Principle of Least Privilege**: The IAM role has only the permissions needed for the specific deployment tasks
3. **Repository Restriction**: The trust policy restricts access to a specific GitHub repository
4. **Temporary Access**: Credentials obtained through OIDC are short-lived and automatically rotated

## Key Components

| Component      | Purpose                               |
| -------------- | ------------------------------------- |
| GitHub Actions | Runs the CI/CD workflow               |
| OIDC Provider  | Issues tokens that establish identity |
| IAM Role       | Grants temporary AWS permissions      |
| ECR            | Stores Docker images                  |
| ECS            | Runs container workloads              |
| CloudWatch     | Monitors application logs             |

## Advantages

1. **Security**: Eliminates credential exposure in GitHub Actions
2. **Efficiency**: Automates the deployment process
3. **Auditability**: All actions are logged and traceable
4. **Reliability**: Consistent deployment process reducing human error
