# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities by emailing security@your-domain.com.

**Do not** open a public GitHub issue for security vulnerabilities.

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability (e.g., XSS, CSRF, SQL injection)
- Full paths of source file(s) related to the vulnerability
- Location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Disclosure Policy

- We will acknowledge receipt of your report within 48 hours
- We will provide a status update within 7 days
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (if desired)

### Security Best Practices

When using VeriMe ZK:

- Always use HTTPS in production
- Keep dependencies up to date
- Validate all inputs on the server side
- Implement rate limiting for API endpoints
- Use secure storage for sensitive data
- Regularly audit access logs

## Security Updates

Security updates will be announced via:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Email notifications (for critical vulnerabilities)

## Known Security Considerations

- Camera access requires user permission
- All processing happens client-side (no data sent to servers)
- ZK proofs are cryptographically secure
- MRZ data is processed locally and never stored

If you discover a security vulnerability, please follow the reporting process above. Thank you for helping keep VeriMe ZK secure!

