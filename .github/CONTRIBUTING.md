# 🤝 Contributing to Nuxt I18n Micro

Thank you for your interest in contributing! We appreciate your help in making this module better.

## 📚 Full Documentation

For detailed contribution guidelines, please visit our **[Contribution Guide](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)**.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or later
- **pnpm**: v9 or later

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/nuxt-i18n-micro.git
cd nuxt-i18n-micro

# Install dependencies
pnpm install

# Build packages
pnpm --filter "./packages/**" run build

# Prepare the module
pnpm run dev:prepare

# Start development
pnpm run dev
```

## 📝 Before Submitting

### Required Checks

```bash
# Run linter
pnpm run lint

# Run tests
pnpm run test:workspaces
pnpm run test

# Type checking
pnpm run typecheck
```

### Commit Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(scope): add new feature
fix(scope): resolve bug
docs(scope): update documentation
```

**Examples:**
- `feat(runtime): add new translation method`
- `fix(server): resolve locale detection issue`
- `docs(firebase): update deployment guide`

## 🐛 Reporting Bugs

Please use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and **include a reproduction repository**.

## ✨ Requesting Features

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) with clear use cases and examples.

## 📋 Pull Request Process

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes** following the code style
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run checks**: lint, test, typecheck
6. **Push and create PR** with a clear description

## 🎨 Code Style

- Use **TypeScript** with strict mode
- Follow **ESLint** configuration
- Avoid `any` type - use proper types
- Use **Composition API** for Vue components
- Add **JSDoc comments** for public APIs

## 📚 Resources

- 📖 [Full Contribution Guide](https://s00d.github.io/nuxt-i18n-micro/guide/contribution)
- 📘 [Documentation](https://s00d.github.io/nuxt-i18n-micro/)
- ❓ [FAQ](https://s00d.github.io/nuxt-i18n-micro/guide/faq)
- 💬 [Discussions](https://github.com/s00d/nuxt-i18n-micro/discussions)

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm run lint` | Run linter |
| `pnpm run lint:fix` | Fix linting errors |
| `pnpm run test` | Run tests |
| `pnpm run typecheck` | Check TypeScript types |
| `pnpm run docs:dev` | Start documentation site |
| `pnpm run prepack` | Build module |

## 💡 Need Help?

- Check the [documentation](https://s00d.github.io/nuxt-i18n-micro/)
- Search [existing issues](https://github.com/s00d/nuxt-i18n-micro/issues)
- Ask in [discussions](https://github.com/s00d/nuxt-i18n-micro/discussions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

Thank you for contributing! 🙏
