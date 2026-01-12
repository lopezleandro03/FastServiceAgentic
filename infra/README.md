# Azure Deployment Guide

## 🏗️ Infrastructure Overview

This project uses **Bicep** for Infrastructure as Code and **GitHub Actions** for CI/CD orchestration.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Azure Resources                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐  │
│  │  Static Web App  │    │        App Service (B1)              │  │
│  │   (Free Tier)    │───▶│   ┌────────────────────────────┐    │  │
│  │                  │    │   │  Docker Container          │    │  │
│  │  React Frontend  │    │   │  .NET 8 API (Always On)    │    │  │
│  └──────────────────┘    │   └────────────────────────────┘    │  │
│                          └──────────────────────────────────────┘  │
│                                           │                         │
│  ┌──────────────────┐                     │                         │
│  │ Container        │                     │                         │
│  │ Registry (Basic) │◀────────────────────┘                         │
│  └──────────────────┘                                               │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │  Azure SQL DB    │    │   Azure OpenAI   │                       │
│  │   (Existing)     │    │    (Existing)    │                       │
│  └──────────────────┘    └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Estimated Monthly Cost

| Resource | SKU | Est. Cost |
|----------|-----|-----------|
| Static Web App | Free | $0 |
| App Service | B1 | ~$13 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$18/month** |

---

## 🔧 Prerequisites

1. **Azure CLI** installed and logged in
2. **GitHub repository** with Actions enabled
3. **Azure Service Principal** for CI/CD

---

## 🚀 Quick Start

### 1. Create Azure Service Principal

```bash
# Create service principal and save credentials
az ad sp create-for-rbac \
  --name "FastService-GitHub-Actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

Save the JSON output as a GitHub secret named `AZURE_CREDENTIALS`.

### 2. Configure GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service principal JSON from step 1 |
| `SQL_CONNECTION_STRING` | Azure SQL connection string |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Generated after first infrastructure deployment |
| `API_URL` | Backend URL (e.g., `https://fastservice-dev-api.azurewebsites.net`) |

### 3. Deploy Infrastructure

```bash
# Option A: Via GitHub Actions (recommended)
# Go to Actions → Infrastructure Deployment → Run workflow

# Option B: Manual deployment
az group create --name fastservice-dev-rg --location eastus2

az deployment group create \
  --resource-group fastservice-dev-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam \
  --parameters sqlConnectionString='Server=...' \
  --parameters azureOpenAIApiKey='...'
```

### 4. Get Static Web App Deployment Token

After infrastructure deployment:

```bash
az staticwebapp secrets list \
  --name fastservice-dev-swa \
  --resource-group fastservice-dev-rg \
  --query 'properties.apiKey' -o tsv
```

Add this as the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret.

### 5. Deploy Applications

Push to `main` branch or trigger workflows manually:

- **Backend**: `.github/workflows/backend-deploy.yml`
- **Frontend**: `.github/workflows/frontend-deploy.yml`

---

## 📁 File Structure

```
infra/
├── main.bicep          # Main infrastructure template
└── main.bicepparam     # Parameter values

.github/workflows/
├── infrastructure-deploy.yml  # Provision Azure resources
├── backend-deploy.yml         # Build & deploy backend container
└── frontend-deploy.yml        # Build & deploy frontend SWA

backend/FastService.McpServer/
└── Dockerfile                 # Backend container definition

frontend/
└── staticwebapp.config.json   # SWA routing configuration
```

---

## 🔄 CI/CD Workflows

### Infrastructure Deployment
- **Trigger**: Push to `infra/**` or manual
- **Actions**: Validate → What-If → Deploy

### Backend Deployment
- **Trigger**: Push to `backend/**` or manual
- **Actions**: Build → Test → Docker Build → Push to ACR → Deploy to App Service

### Frontend Deployment
- **Trigger**: Push to `frontend/**` or manual
- **Actions**: Build → Test → Deploy to Static Web Apps
- **Features**: PR preview environments

---

## 🛡️ Security Best Practices

1. **Secrets**: All sensitive values passed via GitHub Secrets
2. **Managed Identity**: System-assigned identity on App Service
3. **HTTPS Only**: Enforced on all endpoints
4. **Security Headers**: CSP, X-Frame-Options, etc. configured in SWA
5. **Non-root Container**: Backend runs as unprivileged user

---

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check container logs
az webapp log tail --name fastservice-dev-api --resource-group fastservice-dev-rg

# Check health endpoint
curl https://fastservice-dev-api.azurewebsites.net/health
```

### Frontend Routing Issues
Ensure `staticwebapp.config.json` is in the `frontend/` folder with correct `navigationFallback` settings.

### ACR Authentication Issues
```bash
# Enable admin access (if needed)
az acr update --name fastservicedevacr --admin-enabled true

# Get credentials
az acr credential show --name fastservicedevacr
```

---

## 📈 Future Improvements

- [ ] Add Azure Key Vault for secrets management
- [ ] Configure Application Insights for monitoring
- [ ] Add staging slots for zero-downtime deployments
- [ ] Implement Azure Front Door for global CDN + WAF
