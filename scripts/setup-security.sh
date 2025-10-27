#!/bin/bash

# Cursor Security Setup Script
# This script sets up all security tools and configurations

set -e

echo "🔐 Setting up Cursor Security Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Please adapt for your OS."
    exit 1
fi

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed. Please install it first: https://brew.sh"
    exit 1
fi

print_status "Installing security tools..."

# Install Python security tools
if command -v pip3 &> /dev/null; then
    print_status "Installing Python security tools..."
    pip3 install detect-secrets bandit safety pip-audit
else
    print_warning "Python3 not found. Skipping Python security tools."
fi

# Install Node.js security tools
if command -v npm &> /dev/null; then
    print_status "Installing Node.js security tools..."
    npm install -g eslint-plugin-security
else
    print_warning "npm not found. Skipping Node.js security tools."
fi

# Install system security tools
print_status "Installing system security tools..."
brew install gitleaks trivy

# Install pre-commit
print_status "Installing pre-commit..."
pip3 install pre-commit

# Create .secrets.baseline if it doesn't exist
if [ ! -f ".secrets.baseline" ]; then
    print_status "Creating secrets baseline..."
    detect-secrets scan --baseline .secrets.baseline
else
    print_warning ".secrets.baseline already exists. Skipping creation."
fi

# Install pre-commit hooks
print_status "Installing pre-commit hooks..."
pre-commit install

# Create security audit script
print_status "Creating security audit script..."
cat > scripts/security-audit.sh << 'EOF'
#!/bin/bash

# Security Audit Script
# Run comprehensive security checks

set -e

echo "🔍 Running Security Audit..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check for secrets
echo "🔍 Scanning for secrets..."
if detect-secrets scan --all-files --baseline .secrets.baseline; then
    print_status "No new secrets detected"
else
    print_error "New secrets detected! Please review and update baseline."
    exit 1
fi

# Check for secrets in git history
echo "🔍 Scanning git history for secrets..."
if gitleaks detect --source . --verbose; then
    print_status "No secrets found in git history"
else
    print_error "Secrets found in git history! Please review."
    exit 1
fi

# Check Python dependencies
if command -v pip-audit &> /dev/null; then
    echo "🔍 Auditing Python dependencies..."
    if pip-audit; then
        print_status "No Python vulnerabilities found"
    else
        print_warning "Python vulnerabilities found. Please review."
    fi
fi

# Check Node.js dependencies
if command -v npm &> /dev/null; then
    echo "🔍 Auditing Node.js dependencies..."
    if npm audit; then
        print_status "No Node.js vulnerabilities found"
    else
        print_warning "Node.js vulnerabilities found. Please review."
    fi
fi

# Run security linting
if command -v bandit &> /dev/null; then
    echo "🔍 Running Python security linting..."
    if bandit -r .; then
        print_status "Python security linting passed"
    else
        print_warning "Python security issues found. Please review."
    fi
fi

# Run ESLint security plugin
if command -v npm &> /dev/null; then
    echo "🔍 Running JavaScript security linting..."
    if npm run lint:security 2>/dev/null; then
        print_status "JavaScript security linting passed"
    else
        print_warning "JavaScript security issues found. Please review."
    fi
fi

print_status "Security audit completed!"
EOF

chmod +x scripts/security-audit.sh

# Create secret generation script
print_status "Creating secret generation script..."
cat > scripts/generate-secret.sh << 'EOF'
#!/bin/bash

# Secret Generation Script
# Generate secure secrets for the application

set -e

echo "🔐 Generating Secure Secrets..."

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Generate JWT secret
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"

# Generate API key
echo "API_KEY=$(openssl rand -hex 32)"

print_status "Secrets generated! Copy these to your .env file."
print_status "Remember to never commit these secrets to version control!"
EOF

chmod +x scripts/generate-secret.sh

# Create GitHub Actions workflow
print_status "Creating GitHub Actions security workflow..."
mkdir -p .github/workflows

cat > .github/workflows/security.yml << 'EOF'
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install security tools
      run: |
        pip install detect-secrets bandit safety pip-audit
        npm install -g eslint-plugin-security

    - name: Install gitleaks
      uses: gitleaks/gitleaks-action@v2
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}

    - name: Scan for secrets
      run: detect-secrets scan --all-files --baseline .secrets.baseline

    - name: Run bandit
      run: bandit -r . || true

    - name: Run pip-audit
      run: pip-audit || true

    - name: Run npm audit
      run: npm audit || true

    - name: Run ESLint security
      run: npm run lint:security || true
EOF

print_status "Security setup completed!"
print_status "Next steps:"
print_status "1. Copy .env.example to .env and fill in your values"
print_status "2. Run './scripts/generate-secret.sh' to generate secure secrets"
print_status "3. Run './scripts/security-audit.sh' to verify everything is working"
print_status "4. Commit your changes and push to trigger security scans"

echo ""
print_status "🔐 Cursor Security Environment is ready!"



