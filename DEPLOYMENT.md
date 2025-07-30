# Deployment Guide

## Deploying to GitHub Pages

Your finance tracker is ready to be deployed to GitHub Pages! Here are two methods:

### Method 1: Automatic Deployment (Recommended)

The GitHub Actions workflow is already set up. Just push your code to the main branch:

```bash
git add .
git commit -m "Deploy finance tracker"
git push origin main
```

The deployment will happen automatically and your app will be available at:
`https://[your-username].github.io/spark-template/`

### Method 2: Manual Deployment

You can also deploy manually using the npm script:

```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## Required GitHub Settings

Make sure to enable GitHub Pages in your repository settings:

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. Save the settings

## Important Notes

- The app is configured to work with the `/spark-template/` base path for GitHub Pages
- All Euro currency formatting is preserved in the deployment
- The app uses browser storage for data persistence, so user data stays local

## Troubleshooting

If deployment fails:
- Check that GitHub Pages is enabled in your repository settings
- Ensure the GitHub Actions workflow has necessary permissions
- Verify that your repository is public (or you have GitHub Pro for private repos)

Your finance tracker will be live and accessible to anyone with the URL once deployed!