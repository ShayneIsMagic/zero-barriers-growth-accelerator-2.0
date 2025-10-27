# 📚 CURSOR DOCS REFERENCE

**Version:** 1.0.0
**Last Updated:** 2025-10-23
**Purpose:** Quick reference for Cursor documentation and pre-built prompts

---

## 🎯 QUICK START

### Essential Commands
```bash
# Install security tools
pip install detect-secrets bandit safety
npm install -g eslint-plugin-security
brew install gitleaks trivy

# Setup pre-commit hooks
pre-commit install

# Run security audit
./scripts/security-audit.sh

# Generate secure secret
./scripts/generate-secret.sh
```

### First Time Setup
1. Read all documentation files
2. Install required tools
3. Run setup script
4. Configure pre-commit hooks
5. Create secrets baseline
6. Run initial security audit

---

## 📖 DOCUMENTATION INDEX

### Core Documents
- **`.cursorrules`**: Master coding rules and standards
- **`CURSOR_SECURITY_ADDENDUM.md`**: Security rules and procedures
- **`CURSOR_AGILE_WORKFLOW.md`**: Development workflow and task management
- **`CURSOR_DOCS_REFERENCE.md`**: This reference document
- **`INTEGRATION_GUIDE.md`**: How all documents work together

### Configuration Files
- **`.gitignore`**: Git ignore patterns with security entries
- **`.pre-commit-config.yaml`**: Pre-commit hooks configuration
- **`.secrets.baseline`**: Secrets detection baseline
- **`.dockerignore`**: Docker ignore patterns
- **`.env.example`**: Environment variables template

### Scripts
- **`setup-security.sh`**: Initial security setup
- **`security-audit.sh`**: Comprehensive security audit
- **`generate-secret.sh`**: Generate secure secrets

---

## 🤖 PRE-BUILT PROMPTS

### Code Review Prompts

#### Security Code Review
```
Please review this code for security vulnerabilities:

1. Check for hardcoded secrets or credentials
2. Validate input sanitization and validation
3. Review authentication and authorization logic
4. Check for SQL injection vulnerabilities
5. Verify error handling doesn't expose sensitive information
6. Ensure proper logging without sensitive data
7. Check for XSS vulnerabilities
8. Review CORS configuration
9. Validate rate limiting implementation
10. Check for insecure direct object references

Code to review:
[PASTE CODE HERE]
```

#### Performance Code Review
```
Please review this code for performance issues:

1. Check for N+1 query problems
2. Review database query optimization
3. Look for memory leaks
4. Check for inefficient algorithms
5. Review caching strategies
6. Validate lazy loading implementation
7. Check for blocking operations
8. Review bundle size impact
9. Validate image optimization
10. Check for unnecessary re-renders

Code to review:
[PASTE CODE HERE]
```

### Testing Prompts

#### Unit Test Generation
```
Generate comprehensive unit tests for this function:

Requirements:
- Test all code paths and edge cases
- Include positive and negative test cases
- Mock external dependencies
- Test error handling
- Ensure 100% code coverage
- Use descriptive test names
- Include setup and teardown if needed

Function to test:
[PASTE FUNCTION HERE]
```

#### Integration Test Generation
```
Generate integration tests for this API endpoint:

Requirements:
- Test successful requests
- Test error scenarios
- Test authentication and authorization
- Test input validation
- Test response format
- Mock external services
- Test rate limiting
- Test concurrent requests

API endpoint:
[PASTE ENDPOINT CODE HERE]
```

### Documentation Prompts

#### API Documentation
```
Generate comprehensive API documentation for this endpoint:

Include:
- Endpoint description and purpose
- Request parameters and validation rules
- Response format and status codes
- Authentication requirements
- Rate limiting information
- Example requests and responses
- Error codes and messages
- Security considerations

API endpoint:
[PASTE ENDPOINT CODE HERE]
```

#### Code Documentation
```
Generate comprehensive documentation for this code:

Include:
- Function/class description
- Parameter descriptions
- Return value description
- Usage examples
- Error handling
- Performance considerations
- Security considerations
- Dependencies

Code to document:
[PASTE CODE HERE]
```

---

## 🔧 TOOL REFERENCE

### Security Tools

#### detect-secrets
```bash
# Scan for secrets
detect-secrets scan --all-files

# Create baseline
detect-secrets scan --baseline .secrets.baseline

# Audit baseline
detect-secrets audit .secrets.baseline

# Scan specific file
detect-secrets scan path/to/file
```

#### gitleaks
```bash
# Scan repository
gitleaks detect --source . --verbose

# Scan specific commit
gitleaks detect --source . --log-level info --commit HEAD

# Scan with config
gitleaks detect --source . --config .gitleaks.toml
```

#### bandit (Python)
```bash
# Scan Python code
bandit -r .

# Scan specific file
bandit path/to/file.py

# Generate report
bandit -r . -f json -o bandit-report.json

# Skip specific tests
bandit -r . -s B101,B102
```

#### eslint-plugin-security (JavaScript/TypeScript)
```bash
# Run security linting
npm run lint:security

# Fix auto-fixable issues
npm run lint:security -- --fix

# Run on specific file
npx eslint --plugin security path/to/file.js
```

### Dependency Auditing

#### pip-audit (Python)
```bash
# Audit Python dependencies
pip-audit

# Generate report
pip-audit --format=json --output=audit-report.json

# Fix vulnerabilities
pip-audit --fix
```

#### npm audit (Node.js)
```bash
# Audit npm dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Generate report
npm audit --json > audit-report.json

# Check specific package
npm audit package-name
```

### Container Scanning

#### trivy
```bash
# Scan Docker image
trivy image myapp:latest

# Scan filesystem
trivy fs .

# Scan repository
trivy repo https://github.com/user/repo

# Generate report
trivy image --format json --output trivy-report.json myapp:latest
```

---

## 📋 CHECKLISTS

### Pre-commit Checklist
- [ ] No secrets in code
- [ ] All tests passing
- [ ] Code formatted
- [ ] Linting passed
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Commit message follows convention

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Dependencies updated
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Monitoring configured
- [ ] Rollback plan ready

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] Logging added appropriately

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### Pre-commit Hooks Not Running
```bash
# Reinstall hooks
pre-commit uninstall
pre-commit install

# Run manually
pre-commit run --all-files
```

#### Secrets Detected
```bash
# Update baseline
detect-secrets scan --update .secrets.baseline

# Audit baseline
detect-secrets audit .secrets.baseline
```

#### Dependencies Vulnerable
```bash
# Python
pip-audit --fix

# Node.js
npm audit fix
```

#### Tests Failing
```bash
# Run specific test
npm test -- --testNamePattern="test name"

# Run with coverage
npm test -- --coverage

# Debug mode
npm test -- --verbose
```

---

## 📞 SUPPORT

### Internal Support
- **Security Team**: security@company.com
- **DevOps Team**: devops@company.com
- **Documentation**: docs@company.com

### External Resources
- **Cursor Documentation**: https://cursor.sh/docs
- **OWASP**: https://owasp.org
- **GitHub Security**: https://github.com/security
- **NPM Security**: https://www.npmjs.com/advisories

### Emergency Contacts
- **Security Incident**: incident@company.com
- **Production Issues**: oncall@company.com
- **Data Breach**: breach@company.com

---

## 🔄 UPDATES

### Regular Updates
- **Daily**: Check for new vulnerabilities
- **Weekly**: Update dependencies
- **Monthly**: Review security policies
- **Quarterly**: Update documentation

### Version Control
- **Major Changes**: Update version number
- **Minor Changes**: Update last modified date
- **Patches**: Update specific sections

---

## ✨ TIPS AND TRICKS

### Cursor AI Tips
- Use specific prompts for better results
- Provide context and examples
- Iterate on AI suggestions
- Always review AI-generated code
- Use AI for documentation generation

### Security Tips
- Rotate secrets regularly
- Use least privilege principle
- Monitor for unusual activity
- Keep dependencies updated
- Regular security training

### Development Tips
- Write tests first (TDD)
- Use meaningful commit messages
- Document complex logic
- Regular code reviews
- Continuous learning

---

**Remember: This reference is a living document - update it as you learn and improve!**



