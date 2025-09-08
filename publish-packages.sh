#!/bin/bash

# AlephOneNull Experimental Package Publishing Script
# ⚠️ This publishes EXPERIMENTAL packages with proper warnings

echo "🚀 Publishing AlephOneNull Experimental Packages"
echo "================================================"
echo "⚠️ WARNING: These are EXPERIMENTAL packages"
echo "⚠️ NOT FOR PRODUCTION USE"
echo ""

# Check if required tools are installed
echo "📋 Checking publishing tools..."

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

# Check for twine (PyPI publishing)
if ! python -m pip show twine &> /dev/null; then
    echo "📦 Installing twine for PyPI publishing..."
    python -m pip install twine build
fi

echo "✅ Publishing tools ready"
echo ""

# Confirm experimental nature
read -p "⚠️ Confirm: These are EXPERIMENTAL packages for research only (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Cancelled publishing"
    exit 0
fi

echo ""
echo "🔨 Building packages..."

# Build NPM package
echo "📦 Building NPM package..."
cd packages/npm
npm run build:all
if [ $? -ne 0 ]; then
    echo "❌ NPM build failed"
    exit 1
fi

# Build Python package  
echo "🐍 Building Python package..."
cd ../python
python -m build --sdist --wheel
if [ $? -ne 0 ]; then
    echo "❌ Python build failed"  
    exit 1
fi

cd ../..

echo "✅ Packages built successfully"
echo ""

# Publish NPM package
echo "📤 Publishing to NPM..."
echo "⚠️ This will publish @alephonenull/experimental@0.1.0-alpha.1"
read -p "Continue? (y/N): " npm_confirm

if [[ $npm_confirm == [yY] ]]; then
    cd packages/npm
    npm publish --tag experimental --access public
    if [ $? -eq 0 ]; then
        echo "✅ NPM package published!"
        echo "📦 Install with: npm install @alephonenull/experimental"
    else
        echo "❌ NPM publish failed"
    fi
    cd ../..
else
    echo "⏭️ Skipped NPM publishing"
fi

echo ""

# Publish Python package
echo "🐍 Publishing to PyPI..."
echo "⚠️ This will publish alephonenull-experimental 0.1.0a1"
read -p "Continue? (y/N): " pypi_confirm

if [[ $pypi_confirm == [yY] ]]; then
    cd packages/python
    echo "🔐 You'll be prompted for PyPI credentials..."
    python -m twine upload dist/*
    if [ $? -eq 0 ]; then
        echo "✅ PyPI package published!"
        echo "🐍 Install with: pip install alephonenull-experimental"
    else
        echo "❌ PyPI publish failed"
    fi
    cd ../..
else
    echo "⏭️ Skipped PyPI publishing"
fi

echo ""
echo "🎉 Publishing complete!"
echo ""
echo "📊 Package status:"
echo "- NPM: @alephonenull/experimental@0.1.0-alpha.1"  
echo "- PyPI: alephonenull-experimental==0.1.0a1"
echo ""
echo "⚠️ Remember: These are EXPERIMENTAL packages"
echo "🔗 GitHub: https://github.com/purposefulmaker/alephonenull" 