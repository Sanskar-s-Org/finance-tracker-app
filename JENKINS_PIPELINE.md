# Jenkins CI/CD Pipeline Configuration

This Jenkinsfile implements a comprehensive CI/CD pipeline following the DevSecOps methodology.

## Pipeline Overview

```
Feature Branch → CI → EC2 Deploy → Integration Tests → PR
Pull Request → CD → ECR → K8s/ArgoCD → DAST → Approval → Merge
Main Branch → Lambda Deploy → Testing → Reports → S3
```

## Required Jenkins Credentials

Configure these credentials in Jenkins:

### Docker & Container Registry
- `dockerhub-credentials` - Docker Hub username/password
- `ecr-registry` - AWS ECR registry URL

### AWS Credentials
- `aws-credentials` - AWS Access Key ID and Secret
- `ec2-host` - EC2 instance hostname/IP
- `ec2-ssh-key` - SSH key for EC2 access

### Kubernetes & ArgoCD
- `argocd-server` - ArgoCD server URL
- `argocd-credentials` - ArgoCD username/password

### Code Quality & Security
- `sonar-host-url` - SonarQube server URL
- `sonar-token` - SonarQube authentication token

### Notifications
- `slack-webhook-url` - Slack webhook for notifications

## Required Jenkins Plugins

```bash
# Install these plugins in Jenkins:
- Pipeline
- Docker Pipeline
- AWS Steps
- SonarQube Scanner
- OWASP Dependency-Check
- HTML Publisher
- JUnit
- Slack Notification
- SSH Agent
- Credentials Binding
```

## Pipeline Stages

### 1. CI Pipeline (All Branches)

**Build & Install Dependencies**
- Parallel installation of backend and frontend npm packages
- Uses `npm ci` for reproducible builds

**OWASP Dependency Check**
- Scans all dependencies for known vulnerabilities
- Generates HTML, JSON, and XML reports
- Publishes to Jenkins

**Unit Testing & Code Coverage**
- Backend: Mocha + NYC (HTML reports + Mochawesome test reports)
- Frontend: Jest with coverage
- Publishes coverage reports to Jenkins
- Fails if coverage below 80%

**SAST & Quality Gates**
- SonarQube code quality analysis
- Semgrep for security vulnerabilities
- Quality gate must pass to continue

**Containerization**
- Builds Docker images for backend and frontend
- Tags with branch, commit hash, and build number
- Scans images with Trivy for vulnerabilities
- Pushes to Docker Hub

### 2. Continuous Deployment (Feature Branches)

**Deploy to EC2 (Dev)**
- Deploys containers to EC2 development environment
- Uses docker-compose for orchestration
- Performs health checks

**Integration Testing**
- Runs integration tests against deployed EC2 environment
- Tests API endpoints and frontend

### 3. Continuous Delivery (Pull Requests)

**Push to ECR**
- Pushes images to AWS Elastic Container Registry
- Prepares for Kubernetes deployment

**Deploy to K8s via ArgoCD**
- Updates ArgoCD application with new image tags
- Syncs Kubernetes deployment
- Waits for successful rollout

**DAST - OWASP ZAP**
- Dynamic Application Security Testing
- Scans running application for vulnerabilities
- Generates security report

**Manual Approval**
- Senior developers/tech leads review PR
- Approves merge to main branch

### 4. Production Deployment (Main Branch)

**Lambda Deployment Approval**
- Manual approval required for Lambda deployment
- DevOps/Senior developers can approve

**Deploy AWS Lambda**
- Creates deployment package
- Updates Lambda function code
- Waits for deployment completion

**Update Lambda Configuration**
- Updates environment variables
- Sets production configuration

**Lambda Invocation Testing**
- Tests Lambda function execution
- Verifies successful response

### 5. Post-Build (All Branches)

**Report Collection**
- Collects all test reports
- Collects code coverage reports
- Collects vulnerability scan reports
- Collects dependency check reports

**Publish to Jenkins & S3**
- Archives artifacts in Jenkins
- Uploads all reports to S3 bucket
- Organized by project name and build number

**Slack Notifications**
- Real-time notifications for all stages
- Success, failure, and unstable build alerts
- Links to build logs and reports

## Environment Variables

```groovy
DOCKER_IMAGE_NAME = 'personal-finance-tracker'
AWS_REGION = 'us-east-1'
LAMBDA_FUNCTION_NAME = 'finance-tracker-api'
S3_BUCKET = 'finance-tracker-reports'
PROJECT_NAME = 'personal-finance-tracker'
```

## Branch Strategy

- **Feature branches** (`feature-*`): Full CI + EC2 deployment + integration tests
- **Develop branch**: Full CI + EC2 deployment
- **Pull Requests to main**: Full CD pipeline with K8s deployment + DAST
- **Main branch**: Production Lambda deployment

## Security Scanning

1. **OWASP Dependency Check** - Checks npm dependencies
2. **Semgrep SAST** - Static code analysis
3. **SonarQube** - Code quality and security
4. **Trivy** - Container image vulnerabilities
5. **OWASP ZAP** - Dynamic application testing

## Report Locations

After each build, reports are available:

**Jenkins:**
- Build → Test Results
- Build → Code Coverage
- Build → Dependency Check
- Build → Trivy Scan
- Build → OWASP ZAP Report

**S3:**
```
s3://finance-tracker-reports/personal-finance-tracker/{BUILD_NUMBER}/
├── backend-coverage/
├── frontend-coverage/
├── test-results/
├── dependency-check/
├── trivy-backend.html
├── trivy-frontend.html
└── zap-report.html
```

## Slack Notifications

Notifications are sent for:
- ✅ Pipeline start
- 🔍 OWASP Dependency Check
- 🐳 Docker image build
- 🚀 EC2/K8s deployments
- 🧪 Integration/DAST tests
- ⏸️ Manual approvals needed
- ⚡ Lambda deployments
- ✅ Success (with duration and links)
- ❌ Failure (with failed stage and logs)
- ⚠️ Unstable builds

## Running the Pipeline

1. **Push to feature branch:**
   - Triggers CI pipeline
   - Deploys to EC2
   - Runs integration tests

2. **Create Pull Request to main:**
   - Triggers CD pipeline
   - Deploys to K8s via ArgoCD
   - Runs DAST
   - Waits for approval

3. **Merge to main:**
   - Requires approval for Lambda deployment
   - Deploys to AWS Lambda
   - Runs Lambda tests
   - Uploads all reports

## Cleanup

The pipeline automatically:
- Prunes unused Docker images
- Removes stopped containers
- Keeps last 10 builds
- Times out after 1 hour

## Troubleshooting

**Build fails at dependency check:**
- Check OWASP Dependency-Check installation
- Review suppression file

**Docker build fails:**
- Verify Dockerfile exists in backend/frontend
- Check Docker daemon is running

**Quality gate fails:**
- Review SonarQube dashboard
- Check code coverage is above 80%

**EC2 deployment fails:**
- Verify SSH key is configured
- Check docker-compose.yml exists on EC2
- Ensure ports 3000 and 5000 are open

**ArgoCD sync fails:**
- Check ArgoCD credentials
- Verify application exists in ArgoCD
- Check Kubernetes cluster connectivity

**Lambda deployment fails:**
- Verify AWS credentials
- Check Lambda function exists
- Ensure IAM permissions are correct

## Stage Duration Estimates

- Build & Dependencies: 2-3 minutes
- OWASP Dependency Check: 3-5 minutes
- Unit Tests: 1-2 minutes
- SAST & Quality Gates: 3-4 minutes
- Docker Build: 2-3 minutes
- Trivy Scan: 2-3 minutes
- EC2 Deployment: 1-2 minutes
- Integration Tests: 2-3 minutes
- ArgoCD Deployment: 2-4 minutes
- DAST: 5-10 minutes
- Lambda Deployment: 1-2 minutes

**Total: ~20-40 minutes** (excluding manual approvals)
