# GitHub Pages Deployment Guide

This guide will help you set up automatic deployment to GitHub Pages for your portfolio website.

## 🚀 Quick Setup

### 1. Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Add GitHub Pages deployment setup"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **"GitHub Actions"**
5. Save the settings

### 3. Automatic Deployment

Once you've set up GitHub Pages with GitHub Actions:

- Every push to the `main` branch will automatically trigger a deployment
- The deployment workflow will:
  - Install dependencies
  - Build the project (`npm run build`)
  - Deploy the `dist/` folder to GitHub Pages
- Your site will be available at: `https://[username].github.io/[repository-name]`

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build the project
npm run build

# The dist/ folder contains your deployable site
# You can upload this to any static hosting service
```

## 📋 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] GitHub Pages source set to "GitHub Actions"
- [ ] `.github/workflows/deploy.yml` file exists
- [ ] `package.json` has proper build scripts
- [ ] Dependencies installed (`npm install`)
- [ ] Build process tested (`npm run build`)

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are installed
- Ensure your `src/` folder contains all necessary files
- Verify the `copyfiles` package is installed

### GitHub Actions Fails
- Check the Actions tab in your GitHub repository
- Ensure repository has Pages enabled
- Verify the workflow file is in `.github/workflows/`

### Site Not Loading
- Wait 5-10 minutes after first deployment
- Check GitHub Pages settings in repository
- Verify the correct branch is selected
- Check browser console for errors

## 📁 File Structure

Your repository should have:
```
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── shaders/
├── package.json
├── .gitignore
└── README.md
```

## 🔄 Updates

To update your live site:
1. Make changes to files in the `src/` folder
2. Commit and push to the `main` branch
3. GitHub Actions will automatically rebuild and deploy

Your site URL will be: `https://Vaperizer2.github.io/Vaperizer2`
