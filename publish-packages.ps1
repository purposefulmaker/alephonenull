# AlephOneNull Experimental Package Publishing Script
# ⚠️ This publishes EXPERIMENTAL packages with proper warnings

Write-Host "🚀 Publishing AlephOneNull Experimental Packages" -ForegroundColor Green
Write-Host "================================================"
Write-Host "⚠️ WARNING: These are EXPERIMENTAL packages" -ForegroundColor Yellow
Write-Host "⚠️ NOT FOR PRODUCTION USE" -ForegroundColor Yellow
Write-Host ""

# Check if required tools are installed
Write-Host "📋 Checking publishing tools..."

# Check for npm
try {
    npm --version | Out-Null
    Write-Host "✅ npm found"
} catch {
    Write-Host "❌ npm not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check for twine (PyPI publishing)
try {
    python -m pip show twine | Out-Null
    Write-Host "✅ twine found"
} catch {
    Write-Host "📦 Installing twine for PyPI publishing..."
    python -m pip install twine build
}

Write-Host "✅ Publishing tools ready"
Write-Host ""

# Confirm experimental nature
$confirm = Read-Host "⚠️ Confirm: These are EXPERIMENTAL packages for research only (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Cancelled publishing" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔨 Building packages..." -ForegroundColor Blue

# Build NPM package
Write-Host "📦 Building NPM package..."
cd packages\npm
npm run build:all
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ NPM build failed" -ForegroundColor Red
    exit 1
}

# Build Python package  
Write-Host "🐍 Building Python package..."
cd ..\python
python -m build --sdist --wheel
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python build failed" -ForegroundColor Red
    exit 1
}

cd ..\..

Write-Host "✅ Packages built successfully" -ForegroundColor Green
Write-Host ""

# Publish NPM package
Write-Host "📤 Publishing to NPM..." -ForegroundColor Blue
Write-Host "⚠️ This will publish @alephonenull/experimental@0.1.0-alpha.1" -ForegroundColor Yellow
$npm_confirm = Read-Host "Continue? (y/N)"

if ($npm_confirm -eq "y" -or $npm_confirm -eq "Y") {
    cd packages\npm
    
    Write-Host "🔐 Make sure you're logged in to NPM (npm login)" -ForegroundColor Cyan
    $login_check = Read-Host "Are you logged in to NPM? (y/N)"
    
    if ($login_check -eq "y" -or $login_check -eq "Y") {
        npm publish --tag experimental --access public
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ NPM package published!" -ForegroundColor Green
            Write-Host "📦 Install with: npm install @alephonenull/experimental"
        } else {
            Write-Host "❌ NPM publish failed" -ForegroundColor Red
        }
    } else {
        Write-Host "Please run: npm login"
        Write-Host "Then run this script again"
    }
    
    cd ..\..
} else {
    Write-Host "⏭️ Skipped NPM publishing"
}

Write-Host ""

# Publish Python package
Write-Host "🐍 Publishing to PyPI..." -ForegroundColor Blue  
Write-Host "⚠️ This will publish alephonenull-experimental 0.1.0a1" -ForegroundColor Yellow
$pypi_confirm = Read-Host "Continue? (y/N)"

if ($pypi_confirm -eq "y" -or $pypi_confirm -eq "Y") {
    cd packages\python
    Write-Host "🔐 You'll be prompted for PyPI credentials..." -ForegroundColor Cyan
    python -m twine upload dist/*
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PyPI package published!" -ForegroundColor Green
        Write-Host "🐍 Install with: pip install alephonenull-experimental"
    } else {
        Write-Host "❌ PyPI publish failed" -ForegroundColor Red
    }
    cd ..\..
} else {
    Write-Host "⏭️ Skipped PyPI publishing"
}

Write-Host ""
Write-Host "🎉 Publishing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Package status:"
Write-Host "- NPM: @alephonenull/experimental@0.1.0-alpha.1"
Write-Host "- PyPI: alephonenull-experimental==0.1.0a1"
Write-Host ""
Write-Host "⚠️ Remember: These are EXPERIMENTAL packages" -ForegroundColor Yellow
Write-Host "🔗 GitHub: https://github.com/purposefulmaker/alephonenull"

# Return to original directory
cd $PSScriptRoot 