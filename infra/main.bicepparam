using './main.bicep'

// ===========================================================================
// FastService Infrastructure Parameters
// ===========================================================================

param location = 'eastus2'
param appName = 'fastservice'
param imageTag = 'latest'

// Docker Hub image (e.g., yourusername/fastservice-api)
param dockerHubImage = 'yourusername/fastservice-api'

// GitHub repository (optional - needed for SWA GitHub integration)
param repositoryUrl = 'https://github.com/lopezleandro03/FastServiceAgentic'
param repositoryBranch = 'main'

// Azure OpenAI Configuration
param azureOpenAIEndpoint = 'https://fastservice-resource.cognitiveservices.azure.com/'
param azureOpenAIDeploymentName = 'gpt-5-nano'

// ===========================================================================
// Secrets - Override these during deployment
// ===========================================================================
param sqlConnectionString = ''
param azureOpenAIApiKey = ''
