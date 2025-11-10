# Contributing to VeriMe ZK

Thank you for your interest in contributing to VeriMe ZK! This document provides guidelines and instructions for contributing to the project.

**Please note**: By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/verime-zk.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A modern browser for testing

### Building

```bash
npm run build
```

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

### Linting

Check code style:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint -- --fix
```

## Contribution Guidelines

### Code Style

- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Write self-documenting code when possible

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:

```
feat: add support for custom validity periods
fix: resolve camera permission handling on iOS
docs: update API documentation for verifyProof
```

### Pull Request Process

1. **Update Documentation**: If you're adding features or changing APIs, update the relevant documentation
2. **Add Tests**: Include tests for new features or bug fixes
3. **Ensure Tests Pass**: All tests must pass before submitting
4. **Update CHANGELOG**: Add an entry describing your changes
5. **Write Clear PR Description**: Explain what changes you made and why

### PR Checklist

Before submitting your pull request, ensure:

- [ ] Code follows the project's style guidelines
- [ ] Tests are added/updated and passing
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages follow conventional commits format
- [ ] No console.log statements or debug code left behind
- [ ] Code is properly commented where necessary

## Areas for Contribution

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS version
- Screenshots if applicable

### Feature Requests

For feature requests, please:

- Describe the use case
- Explain why this feature would be valuable
- Suggest implementation approach if you have ideas

### Documentation

Documentation improvements are always welcome:

- Fix typos or clarify unclear sections
- Add examples or use cases
- Improve API documentation
- Translate documentation to other languages

### Code Contributions

Areas that need help:

- Performance optimizations
- Browser compatibility improvements
- Test coverage improvements
- Error handling enhancements
- Security improvements

## Testing Guidelines

- Write tests for new features
- Ensure existing tests still pass
- Test on multiple browsers when possible
- Include edge cases in test coverage
- Mock external dependencies appropriately

## Code Review

All submissions require review. We aim to:

- Review PRs within 48 hours
- Provide constructive feedback
- Help improve code quality
- Answer questions promptly

## Questions?

- Open an issue for bug reports or feature requests
- Start a discussion in GitHub Discussions for questions
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VeriMe ZK!

