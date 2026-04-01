const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate RSA key pair for JWT signing
 */
function generateKeys() {
  console.log('Generating RSA key pair...');

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Create keys directory if it doesn't exist
  const keysDir = path.join(__dirname, '../keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Write keys to files
  fs.writeFileSync(path.join(keysDir, 'public-key.pem'), publicKey);
  fs.writeFileSync(path.join(keysDir, 'private-key.pem'), privateKey);

  console.log('✅ Keys generated successfully!');
  console.log(`   Public key:  ${path.join(keysDir, 'public-key.pem')}`);
  console.log(`   Private key: ${path.join(keysDir, 'private-key.pem')}`);
  console.log('\n⚠️  IMPORTANT: Keep private-key.pem secure and never commit it to version control!');
}

// Run the function
generateKeys();
