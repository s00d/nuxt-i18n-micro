---
outline: deep
---

# 🌐 Crowdin Integration Guide

## 📖 Introduction

Integrating Crowdin into your project streamlines the localization and translation process, making it easier to manage translations across multiple languages and platforms. This guide provides a step-by-step walkthrough on setting up Crowdin with your project, including configuration, uploading sources, and downloading translations.

## 🔧 Installation and Setup

To get started with Crowdin, you'll need to install the Crowdin CLI globally on your machine and initialize it within your project directory.

### 📦 Installing Crowdin CLI

First, install the Crowdin CLI globally using npm:

```bash
npm install -g @crowdin/cli
```

### 🛠 Initializing Crowdin in Your Project

Initialize Crowdin in your project by running:

```bash
crowdin init
```

This command will guide you through the setup process, including setting your project ID, API token, and other configuration details.

## 🗂️ Configuration Guide

### 📄 Crowdin Configuration File (`crowdin.yml`)

The Crowdin configuration file (`crowdin.yml`) defines how your source files are mapped and where translations should be placed. Below is an example configuration:

```yml
"project_id": "YOUR_PROJECT_ID"
"api_token": "YOUR_API_TOKEN"
"base_path": "./locales"
"base_url": "https://api.crowdin.com"
"preserve_hierarchy": true

files: [
  {
    "source": "/en.json",
    "translation": "/%two_letters_code%.json",
  },
  {
    "source": "/pages/**/en.json",
    "translation": "/pages/**/%two_letters_code%.json",
  }
]

```

### 📂 Key Configuration Parameters

- **`project_id`**: Your Crowdin project ID. This identifies the project within Crowdin where translations are managed.
- **`api_token`**: The API token used for authentication. Ensure this token has the correct permissions to upload and download translations.
- **`base_path`**: Specifies the base directory for source files. In this example, translations are stored in the `./locales` directory.
- **`base_url`**: The base URL for the Crowdin API.
- **`preserve_hierarchy`**: When set to `true`, Crowdin will maintain the folder structure of your source files in the project.

### 📂 Files Configuration

The `files` section maps your source files to the paths where translations will be stored. For example:

- **Source Path**: Defines the location of the original translation files.
- **Translation Path**: Specifies where the translated files will be stored in Crowdin. Placeholders like `%two_letters_code%` are used to dynamically set the language code in the file paths.

## ⬆️ Uploading Source Files to Crowdin

Once your Crowdin configuration is set up, you can upload your source files using the following command:

```bash
crowdin upload sources
```

This command uploads all specified source files in your configuration to Crowdin, making them available for translation.

## ⬇️ Downloading Translations from Crowdin

After translations are completed or updated in Crowdin, you can download them to your project using:

```bash
crowdin download
```

This command fetches the latest translations from Crowdin and saves them according to the paths specified in your configuration file.

## ⚙️ Best Practices

### 🔑 Consistent Key Naming

Ensure translation keys are consistent across all files to avoid confusion and duplication.

### 🧹 Regular Maintenance

Periodically review and clean up unused translation keys to keep your files organized and manageable.

### 🛠 Automate Uploads and Downloads

Integrate the Crowdin CLI commands into your CI/CD pipeline to automate the upload of source files and download of translations, ensuring your translations are always up to date.

By following this guide, you’ll be able to seamlessly integrate Crowdin into your project, ensuring an efficient and organized approach to managing your internationalization efforts.
