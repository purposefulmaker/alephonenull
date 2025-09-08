#!/usr/bin/env python3
"""
Setup script for AlephOneNull testing environment
This helps you configure your API keys and install dependencies
"""

import os
import sys
import subprocess

print("🛡️ AlephOneNull Test Environment Setup")
print("=" * 50)
print()

# Check Python version
if sys.version_info < (3, 7):
    print("❌ Python 3.7+ required")
    sys.exit(1)

# Install dependencies
print("📦 Installing required packages...")
packages = [
    "alephonenull",
    "openai",
    "anthropic",
    "python-dotenv",
    "requests"  # For Vercel AI Gateway
]

for package in packages:
    print(f"Installing {package}...")
    subprocess.run([sys.executable, "-m", "pip", "install", package], 
                   capture_output=True)

print("✅ Packages installed!")
print()

# Create .env file
if os.path.exists(".env"):
    print("📝 .env file already exists")
    update = input("Update API keys? (y/n): ").lower() == 'y'
    if not update:
        print("Keeping existing .env file")
    else:
        # Read existing
        with open(".env", "r") as f:
            existing = f.read()
else:
    print("📝 Creating .env file...")
    existing = ""
    update = True

if update:
    print("\n🔑 Enter your API keys (press Enter to skip):")
    
    openai_key = input("OpenAI API Key (sk-...): ").strip()
    anthropic_key = input("Anthropic API Key (sk-ant-...): ").strip()
    ai_gateway_key = input("Vercel AI Gateway Key: ").strip()
    replicate_key = input("Replicate API Token (optional): ").strip()
    mistral_key = input("Mistral API Key (optional): ").strip()
    
    env_content = f"""# AlephOneNull Test Environment

# Core API Keys
OPENAI_API_KEY={openai_key or 'your-openai-key-here'}
ANTHROPIC_API_KEY={anthropic_key or 'your-anthropic-key-here'}

# Vercel AI Gateway (unified access to multiple models)
AI_GATEWAY_API_KEY={ai_gateway_key or 'your-ai-gateway-key-here'}

# Additional Providers
REPLICATE_API_TOKEN={replicate_key or 'your-replicate-token-here'}
MISTRAL_API_KEY={mistral_key or 'your-mistral-key-here'}

# For Next.js (browser-side)
NEXT_PUBLIC_OPENAI_API_KEY={openai_key or 'your-openai-key-here'}
NEXT_PUBLIC_ANTHROPIC_API_KEY={anthropic_key or 'your-anthropic-key-here'}
NEXT_PUBLIC_AI_GATEWAY_API_KEY={ai_gateway_key or 'your-ai-gateway-key-here'}
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print("✅ .env file created!")

print("\n🚀 Setup complete!")
print("\nYou can now run:")
print("  python quick-test-aleph.py      # Quick local test")
print("  python test-alephonenull-python.py  # Test with real APIs")
print()
print("For Next.js testing, install:")
print("  npm install @alephonenull/core openai @anthropic-ai/sdk")
print()
print("Vercel AI Gateway provides unified access to:")
print("  - OpenAI models (gpt-4, gpt-3.5-turbo, etc)")
print("  - Anthropic Claude models")
print("  - Google Gemini")
print("  - Meta Llama")
print("  - And more!")
print()
print("Happy testing! 🛡️") 