# ./sam-dev.ps1

# Step 1: Build SAM with template-dev.yml
Write-Host "Running SAM build..."
sam build -t template-dev.yml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error in sam build" -ForegroundColor Red
    exit 1
}





# Step 2: Start local API
Write-Host "Starting SAM local API..."
sam local start-api `
  --port 8080 `
  --env-vars env.json `
  --warm-containers EAGER `
  --container-host-interface 0.0.0.0