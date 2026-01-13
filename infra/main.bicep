// ===========================================================================
// FastService Azure Infrastructure
// Backend: Azure App Service (Containerized) - Always On
// Frontend: Azure Static Web Apps (Free Tier)
// ===========================================================================

targetScope = 'resourceGroup'

// ===========================================================================
// Parameters
// ===========================================================================

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'fastservice'

@description('Container image tag')
param imageTag string = 'latest'

@description('Docker Hub image name (e.g., username/fastservice-api)')
param dockerHubImage string

@description('Existing App Service Plan resource ID')
param existingAppServicePlanId string

@secure()
@description('SQL Server connection string')
param sqlConnectionString string

@secure()
@description('Azure OpenAI API Key')
param azureOpenAIApiKey string

@description('Azure OpenAI Endpoint')
param azureOpenAIEndpoint string = 'https://fastservice-resource.cognitiveservices.azure.com/'

@description('Azure OpenAI Deployment Name')
param azureOpenAIDeploymentName string = 'gpt-5-nano'

@description('GitHub repository URL for Static Web App')
param repositoryUrl string = ''

@description('GitHub repository branch')
param repositoryBranch string = 'main'

// ===========================================================================
// Variables
// ===========================================================================

var tags = {
  Application: appName
  ManagedBy: 'Bicep'
}

// ===========================================================================
// Backend Web App (Containerized)
// ===========================================================================

resource backendWebApp 'Microsoft.Web/sites@2023-12-01' = {
  name: '${appName}-api'
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: existingAppServicePlanId
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      linuxFxVersion: 'DOCKER|${dockerHubImage}:${imageTag}'
      healthCheckPath: '/health'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_ENABLE_CI'
          value: 'true'
        }
        {
          name: 'ConnectionStrings__FastServiceDb'
          value: sqlConnectionString
        }
        {
          name: 'AzureOpenAI__Endpoint'
          value: azureOpenAIEndpoint
        }
        {
          name: 'AzureOpenAI__DeploymentName'
          value: azureOpenAIDeploymentName
        }
        {
          name: 'AzureOpenAI__ApiKey'
          value: azureOpenAIApiKey
        }
        {
          name: 'AzureOpenAI__ApiVersion'
          value: '2024-05-01-preview'
        }
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
      ]
    }
  }
}

// ===========================================================================
// Frontend Static Web App (Free Tier)
// ===========================================================================

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${appName}-swa'
  location: 'eastus2'
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: repositoryBranch
    buildProperties: {
      appLocation: '/frontend'
      outputLocation: 'build'
      skipGithubActionWorkflowGeneration: true
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// Static Web App - App Settings
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    REACT_APP_API_URL: 'https://${backendWebApp.properties.defaultHostName}'
  }
}

// ===========================================================================
// Outputs
// ===========================================================================

@description('Backend API URL')
output backendUrl string = 'https://${backendWebApp.properties.defaultHostName}'

@description('Backend Web App name')
output backendWebAppName string = backendWebApp.name

@description('Frontend Static Web App URL')
output frontendUrl string = 'https://${staticWebApp.properties.defaultHostname}'

@description('Frontend Static Web App name')
output staticWebAppName string = staticWebApp.name
