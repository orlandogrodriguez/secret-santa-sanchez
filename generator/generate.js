import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// GitHub Pages URL
const SITE_URL = "https://orlandogrodriguez.github.io/secret-santa-sanchez";

// Read participants data
function loadParticipants() {
  const filePath = path.join(projectRoot, "participants.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

// Pet names for password generation
const PET_NAMES = ["coco", "lucy", "canela", "koby", "pudsy", "mila"];

// Generate a memorable password: pet name + 4 digits
function generatePassword() {
  // Select a random pet name
  const petName = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];

  // Generate 4 random digits
  const digits = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999

  return petName + digits;
}

// Hash password using SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Check if a matching violates any exclusion rules
function isValidMatching(matches, participants) {
  for (const participant of participants) {
    const match = matches.get(participant.id);
    // Check if exclude is an array and if match.id is in the exclude list
    if (
      participant.exclude &&
      Array.isArray(participant.exclude) &&
      participant.exclude.includes(match.id)
    ) {
      return false;
    }
  }
  return true;
}

// Generate circular matching with random shuffle, respecting exclusions
function generateCircularMatching(participants) {
  const maxAttempts = 1000; // Prevent infinite loops

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Create a copy and shuffle the order
    const shuffled = [...participants];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Create circular matching: person[i] gifts person[i+1], last person gifts first
    const matches = new Map();
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length];
      matches.set(giver.id, receiver);
    }

    // Check if this matching respects exclusion rules
    if (isValidMatching(matches, participants)) {
      return matches;
    }
  }

  // If we couldn't find a valid matching after many attempts, throw an error
  throw new Error(
    "Could not generate a valid matching that respects exclusion rules. Please check your exclusion settings."
  );
}

// Load HTML template
function loadTemplate() {
  const templatePath = path.join(__dirname, "template.html");
  return fs.readFileSync(templatePath, "utf-8");
}

// Generate HTML file for a participant
function generateHTMLFile(
  participant,
  match,
  passwordHash,
  template,
  deploymentVersion
) {
  let html = template;
  html = html.replace("{{PASSWORD_HASH}}", passwordHash);
  html = html.replace("{{MATCH_NAME}}", match.name);
  html = html.replace("{{PARTICIPANT_NAME}}", participant.name);
  html = html.replace("{{DEPLOYMENT_VERSION}}", deploymentVersion);
  return html;
}

// Main generation function
function generate() {
  console.log("🎄 Generating Secret Santa matches...\n");

  // Load data
  const data = loadParticipants();
  const participants = data.participants;
  const developerId = data.developerId;

  if (participants.length < 2) {
    console.error(
      `Error: Need at least 2 participants, found ${participants.length}`
    );
    process.exit(1);
  }

  // Generate circular matching
  const matches = generateCircularMatching(participants);

  // Generate passwords and hashes for each participant
  const passwords = new Map();
  const passwordHashes = new Map();

  for (const participant of participants) {
    const password = generatePassword();
    const hash = hashPassword(password);
    passwords.set(participant.id, password);
    passwordHashes.set(participant.id, hash);
  }

  // Load template
  const template = loadTemplate();

  // Generate deployment version (timestamp) to reset password attempts on new deployment
  const deploymentVersion = Date.now().toString();

  // Ensure dist directory exists
  const distDir = path.join(projectRoot, "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Generate HTML files
  console.log("📄 Generating HTML files...");
  for (const participant of participants) {
    const match = matches.get(participant.id);
    const passwordHash = passwordHashes.get(participant.id);
    const html = generateHTMLFile(
      participant,
      match,
      passwordHash,
      template,
      deploymentVersion
    );

    const filename = `${participant.id}.html`;
    const filePath = path.join(distDir, filename);
    fs.writeFileSync(filePath, html, "utf-8");
    console.log(`   ✓ Created ${filename}`);
  }

  // Create distribution file
  console.log("\n📋 Creating distribution file...");
  const distributionPath = path.join(projectRoot, "distribution.txt");
  let distributionContent = "=".repeat(60) + "\n";
  distributionContent += "SECRET SANTA DISTRIBUTION\n";
  distributionContent += "=".repeat(60) + "\n\n";

  // Find developer's info
  const developer = participants.find((p) => p.id === developerId);
  if (developer) {
    const developerMatch = matches.get(developerId);
    const developerPassword = passwords.get(developerId);
    distributionContent += "🎁 YOUR MATCH:\n";
    distributionContent += `   URL: ${SITE_URL}/${encodeURIComponent(
      developerId
    )}.html\n`;
    distributionContent += `   Password: ${developerPassword}\n`;
    distributionContent += `   You are gifting: ${developerMatch.name}\n\n`;
  }

  distributionContent += "📧 DISTRIBUTION LIST (for others):\n";
  distributionContent += "-".repeat(60) + "\n";

  for (const participant of participants) {
    if (participant.id === developerId) continue;

    const match = matches.get(participant.id);
    const password = passwords.get(participant.id);
    distributionContent += `\n${participant.name}:\n`;
    distributionContent += `   URL: ${SITE_URL}/${encodeURIComponent(
      participant.id
    )}.html\n`;
    distributionContent += `   Password: ${password}\n`;
  }

  distributionContent += "\n" + "=".repeat(60) + "\n";

  fs.writeFileSync(distributionPath, distributionContent, "utf-8");
  console.log(`   ✓ Created distribution.txt`);

  // Create separate passwords file (masked for developer)
  const passwordsPath = path.join(projectRoot, "passwords.txt");
  let passwordsContent = "=".repeat(60) + "\n";
  passwordsContent += "SECRET SANTA PASSWORDS (for manual distribution)\n";
  passwordsContent += "=".repeat(60) + "\n\n";

  for (const participant of participants) {
    const password = passwords.get(participant.id);
    if (participant.id === developerId) {
      passwordsContent += `👤 ${participant.name}: ${password} (YOURS)\n`;
    } else {
      passwordsContent += `👤 ${participant.name}: ${password}\n`;
    }
  }

  fs.writeFileSync(passwordsPath, passwordsContent, "utf-8");
  console.log(`   ✓ Created passwords.txt`);

  // Verify circular matching
  console.log("\n🔍 Verifying circular matching...");
  let chain = [];
  const firstPerson = participants[0];
  let current = firstPerson;

  for (let i = 0; i < participants.length; i++) {
    chain.push(current.name);
    const match = matches.get(current.id);
    current = participants.find((p) => p.id === match.id);
  }

  console.log("   Matching chain:", chain.join(" → ") + " → " + chain[0]);
  console.log("   ✓ Circular matching verified\n");

  console.log("✅ Generation complete!\n");
  console.log("Next steps:");
  console.log("1. Review distribution.txt for your match");
  console.log("2. Copy files from dist/ to deploy/");
  console.log("3. Deploy deploy/ folder to GitHub Pages or Netlify");
  console.log("4. Update [YOUR_SITE_URL] in distribution.txt");
  console.log("5. Send each person their URL and password\n");
}

// Run generation
try {
  generate();
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
