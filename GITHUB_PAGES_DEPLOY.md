# GitHub Pages Deployment Guide

## Step-by-Step Instructions

### 1. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name your repository (e.g., `secret-santa-2024`)
4. Choose **Public** or **Private** - both work! (Private repos get free GitHub Pages too)
5. **Do NOT** initialize with README, .gitignore, or license (we already have files)
6. Click "Create repository"

**Note:** Even with a private repo, your GitHub Pages site will be publicly accessible via the URL. However, the password protection ensures only people with the correct password can see the matches.

### 2. Initialize Git and Push Your Code

Open terminal in the `secret-santa` directory and run:

```bash
cd /Users/stemuser/Developer/secret-santa

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Secret Santa app"

# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Generate and Deploy Files

```bash
# Generate the HTML files
npm run deploy

# This creates files in the deploy/ directory
```

### 4. Set Up GitHub Pages

**Recommended: Use `/docs` folder**

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Select branch: **main**
6. Select folder: **/docs**
7. Click **Save**

**Note:** The `npm run deploy` command automatically copies files to both `/deploy` and `/docs` folders. The `/docs` folder is recommended for GitHub Pages because GitHub Pages supports it natively.

#### Option B: Use GitHub Actions (Alternative)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Generate and deploy
        run: npm run deploy

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./deploy
```

### 5. Get Your GitHub Pages URL

After setting up Pages, your site will be available at:

- **https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/person1.html**
- **https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/person2.html**
- etc.

**Note:** If you use the `/docs` folder, you can access files directly without the `/docs` path in the URL. The URLs will be clean like `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/person1.html` (not `.../docs/person1.html`).

It may take a few minutes for GitHub Pages to build and deploy.

### 6. Update Distribution File

1. Run `npm run generate` again (or just edit `distribution.txt`)
2. Replace `[YOUR_SITE_URL]` with your actual GitHub Pages URL
3. Example: `https://yourusername.github.io/secret-santa-2024`

### 7. Verify Deployment

1. Visit one of your person pages (e.g., `person1.html`)
2. You should see the password form
3. Test with the password from `distribution.txt` or `passwords.txt`

## Quick Reference Commands

```bash
# Generate matches and prepare for deployment
npm run deploy

# Just generate (without deploying)
npm run generate

# After making changes, commit and push:
git add .
git commit -m "Updated matches"
git push
```

## Troubleshooting

- **404 Error**: Make sure you selected `/docs` folder in Pages settings (not `/deploy`)
- **Files not updating**: Wait 1-2 minutes for GitHub Pages to rebuild
- **Can't see Pages option**: Make sure you're in the repository Settings tab, not GitHub account settings
- **Can't select `/deploy` folder**: GitHub Pages doesn't support custom folders like `/deploy`. Use `/docs` instead, which is automatically created by `npm run deploy`

## Important Notes

- The `dist/`, `deploy/`, `distribution.txt`, and `passwords.txt` files are gitignored by default
- You should commit the `/docs` folder contents so GitHub Pages can serve them
- Do NOT commit `distribution.txt` or `passwords.txt` (they contain passwords)
- GitHub Pages URLs are public (even for private repos), so anyone with the URL can access the page, but they still need the password
- Each person's page now shows a personalized greeting: "Hi [Name]! Welcome to Coreillo Secret Santa!"
