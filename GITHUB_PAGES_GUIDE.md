# GitHub Pages Deployment Guide

This guide will help you deploy your Budget Buddy app to GitHub Pages.

## Prerequisites

1. **GitHub Account**: Make sure you have a GitHub account
2. **Repository**: Create a new repository on GitHub named `budget-buddy-app`

## Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name it `budget-buddy-app`
4. Make it public (required for free GitHub Pages)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2. Connect Local Repository to GitHub

```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/budget-buddy-app.git

# Rename main branch (GitHub uses 'main' by default)
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. The deployment will start automatically

### 4. Configure Repository Settings (if needed)

If you encounter permission issues:

1. Go to repository "Settings" → "Actions" → "General"
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Save changes

## Manual Deployment (Alternative)

If you prefer manual deployment using gh-pages:

```bash
# Build and deploy
npm run deploy
```

This will:
1. Build the app
2. Deploy to the `gh-pages` branch
3. GitHub Pages will serve from this branch

## Accessing Your Deployed App

Once deployed, your app will be available at:
```
https://YOUR_USERNAME.github.io/budget-buddy-app/
```

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure the repository is public and Pages is enabled
2. **Build Fails**: Check the Actions tab for error details
3. **Wrong Base Path**: Ensure `vite.config.ts` has the correct base path

### Check Deployment Status

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Check the latest workflow run

### Force Redeploy

If you need to redeploy:

```bash
# Make a small change and commit
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Configuration Files

The following files are configured for GitHub Pages deployment:

- **`.github/workflows/deploy.yml`**: GitHub Actions workflow
- **`vite.config.ts`**: Vite configuration with correct base path
- **`package.json`**: Deploy script and dependencies

## Features Included

Your deployed Budget Buddy app includes:

✅ **Budget Management**: Set and track monthly/yearly budgets  
✅ **Expense Tracking**: Add and categorize expenses  
✅ **Email Notifications**: Multi-threshold alerts (80%, 85%, 100%)  
✅ **Banking Integration**: Connect to bank accounts (with API keys)  
✅ **Visual Analytics**: Charts and spending trends  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Data Persistence**: Local storage for offline functionality

## Next Steps

After deployment:

1. **Configure Email Service**: Set up EmailJS or webhook for real notifications
2. **Bank Integration**: Add API keys for real bank connections
3. **Custom Domain**: Optionally configure a custom domain
4. **Analytics**: Add Google Analytics or similar tracking

## Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Review the troubleshooting section above
3. Ensure all prerequisites are met
4. Try the manual deployment method

Your Budget Buddy app is now ready for the world! 🚀💰
