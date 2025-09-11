#!/bin/bash
# Setup and build packages

echo "🚀 Setting up AlephOneNull prototype packages..."

# Setup Python package
echo "📦 Setting up Python package..."
cd packages/python

# Install in development mode
pip install -e .
echo "✅ Python package ready!"

# Setup NPM package  
echo "📦 Setting up NPM package..."
cd ../npm

# Install dependencies and build
npm install
npm run build
echo "✅ NPM package ready!"

cd ../..

echo ""
echo "🎉 Both packages are ready!"
echo ""
echo "Python usage:"
echo "  pip install ./packages/python"
echo "  from alephonenull import AlephOneNullPrototype"
echo ""
echo "NPM usage:"
echo "  npm install ./packages/npm"
echo "  import { createSafetyGateway } from '@alephonenull/prototype'"
echo ""
echo "To publish:"
echo "  Python: cd packages/python && python setup.py sdist && twine upload dist/*"
echo "  NPM: cd packages/npm && npm publish"
