# Quick Deployment Commands

To deploy your Budget Buddy app to GitHub Pages, run these commands:

## 1. Create GitHub Repository
First, create a new repository on GitHub named `mybudget-buddy`

## 2. Connect and Deploy

```bash
# Connect to your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mybudget-buddy.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## 3. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Select "GitHub Actions" as source
3. Wait for deployment to complete

## Your app will be live at:
`https://YOUR_USERNAME.github.io/mybudget-buddy/`

---

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username.

See `GITHUB_PAGES_GUIDE.md` for detailed instructions and troubleshooting.
