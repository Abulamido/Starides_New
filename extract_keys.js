const fs = require('fs');
try {
    const key = JSON.parse(fs.readFileSync('service-account-key.json', 'utf8'));
    const envContent = `
FIREBASE_PROJECT_ID=${key.project_id}
FIREBASE_CLIENT_EMAIL=${key.client_email}
FIREBASE_PRIVATE_KEY="${key.private_key.replace(/\n/g, '\\n')}"
`;
    fs.writeFileSync('temp_env_output.txt', envContent);
    console.log('Successfully wrote env content to temp_env_output.txt');
} catch (e) {
    console.error(e);
}
