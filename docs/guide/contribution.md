---
outline: deep
---

# Contribution Guide

## Introduction

Thank you for your interest in contributing to `Nuxt I18n Micro`! We welcome contributions from the community, whether it's bug fixes, new features, or improvements to the documentation. This guide outlines the steps to help you get started and ensures that your contributions can be easily integrated into the project.

## Getting Started

### 1. Familiarize Yourself with the Project

Before making changes, it's a good idea to familiarize yourself with the project's architecture and codebase. Read through the existing documentation and take a look at open issues and pull requests to understand ongoing work and challenges.

### 2. Fork the Repository

- Navigate to the [Nuxt I18n Micro repository](https://github.com/s00d/nuxt-i18n-micro).
- Click the "Fork" button in the upper right corner to create a copy of the repository in your GitHub account.

### 3. Clone Your Fork

Clone the forked repository to your local machine:

```bash
git clone https://github.com/<your-username>/nuxt-i18n-micro.git
cd nuxt-i18n-micro
```

Replace `<your-username>` with your GitHub username.

### 4. Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names, such as `bugfix/fix-translation-error` or `feature/add-new-locale-support`.


# Local Development Setup

## Prerequisites

Before you begin, ensure that you have the following installed on your machine:

- **Node.js**: v16 or later
- **npm**: v7 or later

## Getting Started

### 1. Clone the Repository

First, you need to clone the `nuxt-i18n-micro` repository to your local machine.

```bash
git clone https://github.com/s00d/nuxt-i18n-micro.git
cd nuxt-i18n-micro
```

### 2. Install Dependencies

Next, install the project dependencies using npm.

```bash
npm install
```

### 3. Run the Development Server

To start the development server and work on the module, run the following command:

```bash
npm run dev
```

This command will start the Nuxt development server using the `playground` directory as the testing environment. You can view the app in your browser by navigating to `http://localhost:3000`.

### 4. Building the Module

To build the module, use the following command:

```bash
npm run prepack
```

This command prepares the module by building the necessary files, stubbing certain components, and ensuring everything is ready for packaging.

### 5. Linting the Code

To ensure your code adheres to the project's coding standards, run the linter:

```bash
npm run lint
```

If there are any issues, you can attempt to automatically fix them using:

```bash
npm run lint:fix
```

### 6. Running Tests

To run the test suite, use the following command:

```bash
npm run test
```

This will run all the Playwright tests to ensure everything is functioning as expected.

### 7. Type Checking

For TypeScript type checking, run:

```bash
npm run typecheck
```

This checks the type definitions to ensure there are no type errors.

### 8. Building and Previewing the Documentation

To build and preview the documentation locally, use the following commands:

```bash
npm run docs:build
npm run docs:serve
```

This will build the documentation and serve it locally, allowing you to view it in your browser.

### 9. Running the Playground

If you want to test your changes in a sample Nuxt application, the `playground` directory serves as a sandbox environment. Run the following command to start the playground:

```bash
npm run dev:build
```

You can access the playground app at `http://localhost:3000`.

## Summary of Common Scripts

- **`npm run dev`**: Start the development server using the playground.
- **`npm run prepack`**: Build the module and prepare it for publishing.
- **`npm run lint`**: Run the linter to check for code quality issues.
- **`npm run lint:fix`**: Automatically fix linter issues.
- **`npm run test`**: Run the test suite.
- **`npm run typecheck`**: Check TypeScript types.
- **`npm run docs:dev`**: Start the documentation site in development mode.
- **`npm run docs:build`**: Build the documentation site.
- **`npm run docs:serve`**: Serve the built documentation site locally.
- **`npm run dev:build`**: Build the playground environment.

## Making Changes

### 1. Code

- Make your changes in the codebase according to the project’s architecture.
- Follow the existing code style and conventions.
- If you’re adding a new feature, consider writing tests for it.

### 2. Run Linting

Before committing your changes, ensure that your code adheres to the project's coding standards by running the linter:

```bash
npm run lint
```

Fix any linting errors before proceeding.

### 3. Test Your Changes

Make sure your changes work and do not break any existing functionality:

- Run all tests to ensure there are no errors:

```bash
npm run test
```

- If you’re fixing a bug, add tests to cover the fix.

### 4. Commit Your Changes

To ensure consistency across the project, we use a standardized commit message format. Please follow this format when making commits:

#### Commit Message Format

Each commit message should be structured as follows:

```
<type>(<scope>): <short description>
```

#### Examples:

- `fix(router): resolve issue with locale switching`
- `feat(seo): add automatic og:locale meta tag generation`
- `docs(contribution): update contribution guide with commit message format`

#### Commit Types:

- **feat**: A new feature.
- **fix**: A bug fix.
- **docs**: Documentation changes or updates.
- **style**: Code style or formatting changes (no functional impact).
- **refactor**: Code changes that neither fix a bug nor add a feature.
- **test**: Adding or updating tests.
- **chore**: Miscellaneous tasks, such as updating build scripts or dependencies.

### 5. Push to GitHub

Push your changes to your fork on GitHub:

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to your forked repository on GitHub.
- Click the "Compare & pull request" button.
- Ensure your PR targets the `main` branch of the original repository (`s00d/nuxt-i18n-micro`).
- Describe your changes in the PR, and link to any relevant issues.

### 7. Await Feedback

Once your pull request is submitted, a maintainer will review your changes. Be prepared to make adjustments based on feedback. Once approved, your PR will be merged into the main branch.

## Contribution Tips

- **Documentation**: If you add or change a feature, ensure that you update the relevant documentation.
- **Code Cleanliness**: Keep your code clean and follow the project's coding standards.
- **Respectful Communication**: Be respectful and friendly in your communications. We are all working towards the common goal of making `Nuxt I18n Micro` better.

## Feedback

We value every contribution and are here to help. If you have questions or are unsure about any aspect of your contribution, feel free to ask in the repository's Discussions section.

## Conclusion

Your contributions make `Nuxt I18n Micro` better for everyone! Thank you for helping to improve this project. We look forward to your ideas and improvements.
