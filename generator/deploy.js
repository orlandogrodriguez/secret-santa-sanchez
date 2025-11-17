import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Read participants data
function loadParticipants() {
    const filePath = path.join(projectRoot, 'participants.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Copy files from dist/ to docs/
function copyToDeploy() {
    const distDir = path.join(projectRoot, 'dist');
    const docsDir = path.join(projectRoot, 'docs');

    // Load participants to get valid file IDs
    const data = loadParticipants();
    const participantIds = data.participants.map(p => p.id);
    const validFilenames = new Set(participantIds.map(id => `${id}.html`));

    // Ensure docs directory exists (for GitHub Pages)
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    // Create index.html content
    const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secret Santa</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2rem;
        }
        .message {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎁 Secret Santa</h1>
        <p class="message">Please use the direct link provided to you to access your match.</p>
    </div>
</body>
</html>`;

    // Copy index.html to docs/
    const docsIndexPath = path.join(docsDir, 'index.html');
    fs.writeFileSync(docsIndexPath, indexContent, 'utf-8');

    // Copy only HTML files that match current participant IDs
    const files = fs.readdirSync(distDir);
    let copiedCount = 0;

    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
            // Only copy files that match participant IDs (skip person1.html, person2.html, etc.)
            if (validFilenames.has(file)) {
                const srcPath = path.join(distDir, file);
                const docsDestPath = path.join(docsDir, file);
                fs.copyFileSync(srcPath, docsDestPath);
                copiedCount++;
            }
        }
    });

    // Clean up any HTML files from docs/ that don't match current participant IDs
    const docsFiles = fs.readdirSync(docsDir);
    let removedCount = 0;
    docsFiles.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
            // Remove files that don't match valid participant IDs
            if (!validFilenames.has(file)) {
                const oldFilePath = path.join(docsDir, file);
                fs.unlinkSync(oldFilePath);
                console.log(`   🗑️  Removed old file: ${file}`);
                removedCount++;
            }
        }
    });

    if (removedCount > 0) {
        console.log(`   🧹 Cleaned up ${removedCount} old file(s) from docs/`);
    }

    console.log(`✅ Copied ${copiedCount} HTML file(s) to docs/`);
    console.log('📦 Ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. For GitHub Pages: Configure Pages to use /docs folder');
    console.log('   (Settings > Pages > Source: Deploy from a branch > /docs)');
    console.log('   Your URLs will be: https://YOUR_USERNAME.github.io/YOUR_REPO/person1.html');
    console.log('2. Update [YOUR_SITE_URL] in distribution.txt');
    console.log('3. Send each person their URL and password');
}

copyToDeploy();

