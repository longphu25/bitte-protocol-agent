#!/bin/bash

echo "Pet NFT Contract Deployment Script"
echo "=================================="

# Check if sui client is available
if ! command -v sui &> /dev/null; then
    echo "❌ Error: 'sui' command not found. Please install Sui CLI first."
    echo "Visit: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "Move.toml" ]; then
    echo "❌ Error: Move.toml not found. Please run this script from the move/pet_nft directory."
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "  - Move contract in sources/pet_nft.move"
echo "  - Sui CLI installed and configured"
echo "  - Active address with sufficient gas"
echo ""

# Show current active address
echo "🔍 Current active address:"
sui client active-address

echo ""
echo "💰 Current balance:"
sui client gas

echo ""
read -p "📦 Deploy to which network? (testnet/devnet/mainnet) [testnet]: " network
network=${network:-testnet}

echo ""
echo "🚀 Deploying pet NFT contract to $network..."
echo "   This may take a few moments..."

# Deploy the contract
deployment_result=$(sui client publish --gas-budget 100000000 --json 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Contract deployed successfully!"
    
    # Extract package ID from the JSON output
    package_id=$(echo "$deployment_result" | jq -r '.packageId // .objectChanges[] | select(.type == "published") | .packageId')
    
    if [ "$package_id" != "null" ] && [ -n "$package_id" ]; then
        echo ""
        echo "📋 Deployment Details:"
        echo "   Package ID: $package_id"
        echo "   Network: $network"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Update your .env file with:"
        echo "      PET_PACKAGE_ID=\"$package_id\""
        echo ""
        echo "   2. Test the minting function:"
        echo "      cd ../.. && node test-mint-pet.js"
        echo ""
        
        # Offer to update .env file
        read -p "🔧 Would you like me to update the .env file automatically? (y/n) [y]: " update_env
        update_env=${update_env:-y}
        
        if [ "$update_env" = "y" ] || [ "$update_env" = "Y" ]; then
            env_file="../../.env"
            if [ -f "$env_file" ]; then
                # Check if PET_PACKAGE_ID already exists in .env
                if grep -q "PET_PACKAGE_ID=" "$env_file"; then
                    # Update existing line
                    sed -i.bak "s/PET_PACKAGE_ID=.*/PET_PACKAGE_ID=\"$package_id\"/" "$env_file"
                    echo "✅ Updated PET_PACKAGE_ID in .env file"
                else
                    # Add new line
                    echo "" >> "$env_file"
                    echo "# Pet NFT Package ID" >> "$env_file"
                    echo "PET_PACKAGE_ID=\"$package_id\"" >> "$env_file"
                    echo "✅ Added PET_PACKAGE_ID to .env file"
                fi
            else
                echo "⚠️  .env file not found at $env_file"
                echo "   Please manually add: PET_PACKAGE_ID=\"$package_id\""
            fi
        fi
        
    else
        echo "⚠️  Could not extract package ID from deployment output"
        echo "   Please check the deployment logs above"
    fi
    
else
    echo "❌ Deployment failed!"
    echo "Error output:"
    echo "$deployment_result"
    exit 1
fi

echo ""
echo "🎉 Deployment completed!"
