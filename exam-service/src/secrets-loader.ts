import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function bootstrap() {
  const keyVaultName = process.env.KEY_VAULT_NAME;
  if (keyVaultName) {
    console.log(`Loading secrets from Key Vault: ${keyVaultName} using Azure Workload Identity...`);
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(`https://${keyVaultName}.vault.azure.net`, credential);
    try {
      for await (const secretProperties of client.listPropertiesOfSecrets()) {
        const secretName = secretProperties.name;
        const secret = await client.getSecret(secretName);
        const envName = secretName.toUpperCase().replace(/-/g, '_');
        process.env[envName] = secret.value;
        
        // Map common aliases
        if (envName === 'DB_CONNECTION_STRING' || envName === 'DATABASE_URL') {
          process.env.DATABASE_URL = secret.value;
        }
        if (envName === 'REDIS_CONNECTION_STRING' || envName === 'REDIS_URL') {
          process.env.REDIS_URL = secret.value;
        }
        if (envName === 'JWT_ACCESS_SECRET' || envName === 'JWT_SECRET') {
          process.env.JWT_SECRET = secret.value;
          process.env.JWT_ACCESS_SECRET = secret.value;
        }
      }
      console.log('Successfully loaded all secrets from Key Vault.');
    } catch (error) {
      console.error('Error loading secrets from Key Vault:', error);
      process.exit(1);
    }
  } else {
    console.log('KEY_VAULT_NAME not set. Sourcing secrets from local environment.');
  }
}

bootstrap().then(() => {
  require('./index.js');
}).catch((err) => {
  console.error('Unhandled error in secrets loader:', err);
  process.exit(1);
});
