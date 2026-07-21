from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="alephonenull-eval",
    version="0.3.0a2",  # Alpha — keep in sync with alephonenull/__init__.py __version__
    author="AlephOneNull Research Team",
    author_email="research@alephonenull.org",
    description="⚠️ EXPERIMENTAL: Theoretical AI safety framework - research purposes only",
    long_description="""
    ⚠️ WARNING: This is a theoretical research framework that has NOT been validated.
    DO NOT use in production systems.
    DO NOT rely on this for actual safety critical applications.
    This is for research and experimentation only.
    
    """ + long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/purposefulmaker/alephonenull",
    license="MIT",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Scientific/Engineering :: Information Analysis",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Environment :: No Input/Output (Daemon)",
        "Operating System :: OS Independent",
        "Natural Language :: English"
    ],
    python_requires=">=3.8",
    # Minimal core: `import alephonenull` and the v3 engine need only numpy.
    # Heavy optional stacks live in extras (see below).
    install_requires=[
        "numpy>=1.21.0",
        "prometheus-client>=0.16.0",
    ],
    extras_require={
        "ml": [
            "sentence-transformers>=2.2.0",
            "torch>=2.0.0",
            "tiktoken>=0.3.0",
        ],
        "server": [
            "fastapi>=0.95.0",
            "uvicorn>=0.21.0",
        ],
        "all-providers": [
            "openai>=1.0.0",
            "anthropic>=0.40.0",
            "google-generativeai>=0.3.0",
            "transformers>=4.30.0",
            "replicate>=0.15.0",
            "cohere>=4.0.0",
            "boto3>=1.26.0",  # AWS Bedrock
            "azure-cognitiveservices-language-luis>=0.7.0",  # Azure OpenAI
        ],
        "monitoring": [
            "grafana-api>=1.0.0",
            "influxdb-client>=1.36.0",
            "prometheus-client>=0.16.0",
            "psutil>=5.9.0",
        ],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=22.0.0",
            "mypy>=1.0.0",
            "coverage>=7.0.0",
            "pre-commit>=3.0.0",
        ],
        "all": [
            # ml
            "sentence-transformers>=2.2.0",
            "torch>=2.0.0",
            "tiktoken>=0.3.0",
            # server
            "fastapi>=0.95.0",
            "uvicorn>=0.21.0",
            # all-providers
            "openai>=1.0.0",
            "anthropic>=0.40.0",
            "google-generativeai>=0.3.0",
            "transformers>=4.30.0",
            "replicate>=0.15.0",
            "cohere>=4.0.0",
            "boto3>=1.26.0",
            "azure-cognitiveservices-language-luis>=0.7.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "alephonenull-protect=alephonenull.providers:protect_all_cli",
            "alephonenull-dashboard=alephonenull.monitoring.dashboard:run_dashboard_cli",
        ],
    },
    project_urls={
        "Bug Reports": "https://github.com/purposefulmaker/alephonenull/issues",
        "Source": "https://github.com/purposefulmaker/alephonenull",
        "Documentation": "https://alephonenull.com/docs",
        "Disclaimer": "https://github.com/purposefulmaker/alephonenull/blob/main/DISCLAIMER.md",
    },
)
