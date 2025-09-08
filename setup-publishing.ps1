# Setup script for publishing AlephOneNull packages
# Installs necessary tools for NPM and PyPI publishing

Write-Host "🛠️ Setting up publishing environment for AlephOneNull" -ForegroundColor Green
Write-Host "======================================================"
Write-Host ""

# Check Python
Write-Host "🐍 Checking Python setup..."
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion"
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "📦 Checking Node.js setup..."
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion"
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Install Python publishing tools
Write-Host ""
Write-Host "🔧 Installing Python publishing tools..."
python -m pip install --upgrade pip setuptools wheel build twine

# Check npm login status
Write-Host ""
Write-Host "🔐 Checking NPM authentication..."
try {
    npm whoami | Out-Null
    $npmUser = npm whoami
    Write-Host "✅ Logged into NPM as: $npmUser"
} catch {
    Write-Host "⚠️ Not logged into NPM" -ForegroundColor Yellow
    Write-Host "Run: npm login"
    Write-Host "Or: npm adduser"
}

# Check PyPI credentials
Write-Host ""
Write-Host "🔐 PyPI Setup..."
Write-Host "For first-time PyPI publishing:"
Write-Host "1. Create account at https://pypi.org/account/register/"
Write-Host "2. Verify your email"
Write-Host "3. Set up 2FA (required)"
Write-Host "4. Create an API token at https://pypi.org/manage/account/token/"

# Install development dependencies
Write-Host ""
Write-Host "🔧 Installing development dependencies..."

Write-Host "Installing Python dev tools..."
python -m pip install pytest black mypy pre-commit

Write-Host "Installing NPM dev tools..."  
npm install -g typescript ts-node

Write-Host ""
Write-Host "✅ Publishing environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "1. Make sure you're logged into NPM: npm login"
Write-Host "2. Get your PyPI API token ready"
Write-Host "3. Run: .\publish-packages.ps1"
Write-Host ""
Write-Host "⚠️ Remember: You're publishing EXPERIMENTAL research software" -ForegroundColor Yellow 