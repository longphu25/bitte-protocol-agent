/**
 * Sui Client utilities for interacting with the Pet NFT contract
 */

export interface MintPetParams {
  packageId: string;
  petName: string;
  petType: string;
  userAddress: string;
}

export interface TransactionTemplate {
  packageId: string;
  module: string;
  function: string;
  arguments: (number | number[])[];
  recipient: string;
}

/**
 * Get pet type number for the Move contract
 */
export function getPetTypeNumber(petType: string): number {
  switch (petType.toLowerCase()) {
    case "dog": return 1;
    case "cat": return 2;
    case "dragon": return 3;
    default: return 1;
  }
}

/**
 * Get image URL for pet type
 */
export function getPetImageUrl(petType: string): string {
  const IMAGE_URLS = {
    cat: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/cat.png",
    dog: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/dog.png",
    dragon: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/dragon.png",
  };
  
  return IMAGE_URLS[petType.toLowerCase() as keyof typeof IMAGE_URLS] || IMAGE_URLS.cat;
}

/**
 * Create a transaction template for minting a pet NFT
 */
export function createMintTransactionTemplate(params: MintPetParams): TransactionTemplate {
  const { packageId, petName, petType, userAddress } = params;
  const imageUrl = getPetImageUrl(petType);
  const petTypeNumber = getPetTypeNumber(petType);

  return {
    packageId,
    module: "pet_nft",
    function: "mint_pet",
    arguments: [
      Array.from(new TextEncoder().encode(petName)), // name as bytes
      Array.from(new TextEncoder().encode(`A ${petType} pet NFT`)), // description as bytes
      petTypeNumber, // pet_type as u8
      Array.from(new TextEncoder().encode(imageUrl)), // image_url as bytes
    ],
    recipient: userAddress,
  };
}

/**
 * Generate CLI command for minting
 */
export function generateMintCliCommand(template: TransactionTemplate): string {
  const args = template.arguments.map((arg) => {
    if (Array.isArray(arg)) {
      return `"[${arg.join(',')}]"`;
    }
    return arg.toString();
  }).join(' ');

  return `sui client call --package ${template.packageId} --module ${template.module} --function ${template.function} --args ${args} --gas-budget 10000000`;
}
