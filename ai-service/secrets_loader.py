import os
import sys
import uvicorn
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

def load_secrets():
    kv_name = os.environ.get("KEY_VAULT_NAME")
    if kv_name:
        print(f"Loading secrets from Key Vault: {kv_name} using Azure Workload Identity...")
        kv_uri = f"https://{kv_name}.vault.azure.net"
        credential = DefaultAzureCredential()
        client = SecretClient(vault_url=kv_uri, credential=credential)
        try:
            secrets = client.list_properties_of_secrets()
            for secret_prop in secrets:
                secret_name = secret_prop.name
                secret = client.get_secret(secret_name)
                env_name = secret_name.upper().replace("-", "_")
                os.environ[env_name] = secret.value
                
                # Custom alias mapping
                if env_name == "AI_PORT":
                    os.environ["PORT"] = secret.value
            print("Successfully loaded secrets from Key Vault.")
        except Exception as e:
            print(f"Error loading secrets from Key Vault: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print("KEY_VAULT_NAME not set. Sourcing from environment directly.")

if __name__ == "__main__":
    load_secrets()
    # Now run uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
