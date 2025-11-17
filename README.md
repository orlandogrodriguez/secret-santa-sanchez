# Secret Santa Web Links

A lightweight secret Santa matching system that generates password-protected static HTML pages for each participant. Each person receives a unique URL and password to access only their match, ensuring privacy.

## Features

- ✅ Circular matching algorithm (P1→P2→P3→...→P8→P1)
- ✅ Password-protected pages with SHA-256 hashing
- ✅ Client-side only (no server needed)
- ✅ Mobile-responsive design
- ✅ Rate limiting (5 attempts per page)
- ✅ Developer only sees their own match

## Setup

1. Edit `participants.json` with your family members' names and IDs
2. Update `developerId` in `participants.json` to your own ID

## Generate Matches

Run the generator script:

```bash
npm run generate
```

This will:
- Create HTML files in `dist/` directory
- Generate passwords for each participant
- Create `distribution.txt` with URLs and passwords
- Create `passwords.txt` for easy distribution

## Deploy

### Option 1: GitHub Pages

1. Create a new GitHub repository
2. Copy files from `dist/` to `deploy/`
3. Push `deploy/` contents to the repository
4. Enable GitHub Pages in repository settings
5. Update URLs in `distribution.txt` with your GitHub Pages URL

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run deploy`
3. Set publish directory: `deploy`
4. Deploy and update URLs in `distribution.txt`

### Option 3: Manual Deployment

1. Copy all files from `dist/` to any static hosting service
2. Update URLs in `distribution.txt` with your hosting URL

## Distribution

1. Review `distribution.txt` to see your own match
2. Send each person their unique URL and password
3. Each person visits their link, enters password, and sees only their match

## Security

- Passwords are hashed with SHA-256 before embedding in HTML
- No server-side code (pure static files)
- Rate limiting prevents brute force attacks
- Each page is independent and isolated

## Project Structure

```
secret-santa/
├── generator/
│   ├── generate.js          # Main generation script
│   └── template.html        # HTML template for pages
├── participants.json        # Participant data
├── dist/                    # Generated HTML files (gitignored)
├── deploy/                  # Deployment-ready files
├── distribution.txt         # Distribution info (gitignored)
├── passwords.txt            # Password list (gitignored)
└── package.json
```

## Notes

- The `dist/`, `deploy/`, `distribution.txt`, and `passwords.txt` directories/files are gitignored
- Update `participants.json` with real names before generating
- After deployment, replace `[YOUR_SITE_URL]` in `distribution.txt` with your actual URL

