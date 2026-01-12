// ===========================================================================
// FastService Azure Infrastructure
// Backend: Azure App Service (Containerized) - Always On
// Frontend: Azure Static Web Apps (Free Tier)
// ===========================================================================

targetScope = 'resourceGroup'

// ===========================================================================
// Parameters
// ===========================================================================

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'dev'

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

// Database connection (use Key Vault in production)
@secure()
@description('SQL Server connection string')
param sqlConnectionString string

// Azure OpenAI settings
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

var resourcePrefix = '${appName}-${environmentName}'
var tags = {
  Application: appName
  Environment: environmentName
  ManagedBy: 'Bicep'
}

// ===========================================================================
// Using existing App Service Plan and Docker Hub for container registry
// ===========================================================================

// ===========================================================================
// Backend Web App (Containerized)
// ===========================================================================

module backendWebApp 'br/public:avm/res/web/site:0.15.0' = {
  name: 'backendWebApp'
  params: {
    name: '${resourcePrefix}-api'
    location: location
    kind: 'app,linux,container'
    serverFarmResourceId: existingAppServicePlanId
    httpsOnly: true
    managedIdentities: {
      systemAssigned: true
    }
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
          value: environmentName == 'prod' ? 'Production' : 'Development'
        }
      ]
    }
    basicPublishingCredentialsPolicies: [
      {
        name: 'ftp'
        allow: false
      }
      {
        name: 'scm'
        allow: true
      }
    ]
    tags: tags
  }
}

// ===========================================================================
// Frontend Static Web App (Free Tier)
// ===========================================================================

module staticWebApp 'br/public:avm/res/web/static-site:0.7.0' = {
  name: 'staticWebApp'
  params: {
    name: '${resourcePrefix}-swa'
    location: 'eastus2' // Static Web Apps have limited region availability
    sku: 'Free'
    repositoryUrl: repositoryUrl
    branch: repositoryBranch
    buildProperties: {
      appLocation: '/frontend'
      outputLocation: 'build'
      skipGithubActionWorkflowGeneration: true
    }
    appSettings: {
      REACT_APP_API_URL: 'https://${backendWebApp.outputs.defaultHostname}'
    }
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    tags: tags
  }
}

// ===========================================================================
// Outputs
// ===========================================================================

@description('Backend API URL')
output backendUrl string = 'https://${backendWebApp.outputs.defaultHostname}'

@description('Backend Web App name')
output backendWebAppName string = backendWebApp.outputs.name

@description('Frontend Static Web App URL')
output frontendUrl string = staticWebApp.outputs.defaultHostname

@description('Frontend Static Web App name')
output staticWebAppName string = staticWebApp.outputs.name
