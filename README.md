# Face & Body Insight

A modern AI-powered face and body analysis tool built with Vue 3 + Vite, supporting internationalization.

## Project Overview

Face & Body Insight is a rapid development solution built with Vue 3 + Vite, designed for quick deployment and production use. This project demonstrates how to quickly build and deploy a modern web application with the following advantages:

- ⚡ **Lightning Fast Development**: Leveraging Vite's instant server start and hot module replacement
- 🚀 **Quick Deployment**: Automated CI/CD pipeline for rapid production deployment
- 🎯 **Production Ready**: Built with best practices and modern web standards
- 📦 **Optimized Build**: Efficient production builds with automatic code splitting
- 🔧 **Easy Maintenance**: Well-structured codebase for easy updates and maintenance

## Features

- 🎯 AI-Powered Face & Body Analysis
- 🌐 Multi-language Support (i18n)
- 📱 Responsive Design
- 🎨 Modern UI Interface
- 📄 PDF Export Functionality
- 🖼️ Canvas Screenshot Capability

## Tech Stack

- Vue 3 (using Composition API)
- Vite 6
- Vue Router 4
- Vue I18n
- Axios
- Less
- HTML2Canvas
- HTML2PDF.js

## Development Requirements

- Node.js 18+
- npm or yarn

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/xxxfengsu/shapeCheck.git
cd shapeCheck
```

2. Install dependencies

```bash
npm install
```

3. Start development server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── api/          # API interfaces
├── assets/       # Static assets
├── components/   # Common components
├── composables/  # Composable functions
├── i18n/         # Internationalization config
├── pc/          # PC pages
├── router/      # Route configuration
├── utils/       # Utility functions
├── App.vue      # Root component
└── main.js      # Entry file
```

## Deployment

The project uses GitHub Actions for automated deployment. When code is pushed to the main branch, it will automatically build and deploy to the server.

### Quick Deployment Steps

1. Push your code to the main branch
2. GitHub Actions will automatically:
   - Build the project
   - Run tests
   - Deploy to production server
3. Your changes will be live in minutes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

- 📄 **License Type**: MIT License
- 👤 **Copyright**: © 2024 xxxfengsu
- 🔄 **Permissions**:
  - Commercial use
  - Modification
  - Distribution
  - Private use
- ⚠️ **Limitations**:
  - Liability
  - Warranty
- 📝 **Conditions**:
  - License and copyright notice

For more information about the MIT License, visit [choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/).
