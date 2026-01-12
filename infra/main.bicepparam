using './main.bicep'

// ===========================================================================
// FastService Infrastructure Parameters - Development Environment
// ===========================================================================

param environmentName = 'dev'
param location = 'eastus2'
param appName = 'fastservice'
param imageTag = 'latest'

// Docker Hub image (e.g., yourusername/fastservice-api)
param dockerHubImage = 'yourusername/fastservice-api'

// Existing App Service Plan
param existingAppServicePlanId = '/subscriptions/05502140-2c2f-45e5-85dc-477c35e7a985/resourceGroups/fastservice-app/providers/Microsoft.Web/serverFarms/basic-serviceplan'

// GitHub repository (optional - needed for SWA GitHub integration)
param repositoryUrl = 'https://github.com/YOUR_ORG/FastServiceAgentic'
param repositoryBranch = 'main'

// Azure OpenAI Configuration
param azureOpenAIEndpoint = 'https://fastservice-resource.cognitiveservices.azure.com/'
param azureOpenAIDeploymentName = 'gpt-5-nano'

// ===========================================================================
// Secrets - Override these during deployment
// Do NOT commit actual values to source control
// ===========================================================================

// Use: az deployment group create ... --parameters sqlConnectionString='<actual-value>' azureOpenAIApiKey='<actual-value>'
param sqlConnectionString = '' // Required - pass securely at deployment time
param azureOpenAIApiKey = ''   // Required - pass securely at deployment time
