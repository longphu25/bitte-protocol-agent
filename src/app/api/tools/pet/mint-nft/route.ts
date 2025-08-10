import { NextResponse } from "next/server";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

function suiClientFor(network: string): SuiClient {
  const networkMap: Record<string, string> = {
    mainnet: getFullnodeUrl("mainnet"),
    testnet: getFullnodeUrl("testnet"),
    devnet: getFullnodeUrl("devnet"),
  };
  
  const url = networkMap[network] || getFullnodeUrl("testnet");
  return new SuiClient({ url });
}

// Pet type constants
const PET_TYPES = {
  dog: 1,
  cat: 2,
  dragon: 3
} as const;

// Pet image URLs
const PET_IMAGES = {
  cat: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/cat.png",
  dog: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/dog.png",
  dragon: "https://raw.githubusercontent.com/longphu25/bitte-protocol-agent/refs/heads/main/public/dragon.png"
} as const;

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { userAddress, address, petName, name, petType, network = "testnet" } = body;

    // Support both field names for backward compatibility
    const walletAddress = userAddress || address;
    const petDisplayName = petName || name;

    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json(
        { error: "User address is required (provide either 'userAddress' or 'address')" },
        { status: 400 }
      );
    }

    if (!petDisplayName) {
      return NextResponse.json(
        { error: "Pet name is required (provide either 'petName' or 'name')" },
        { status: 400 }
      );
    }

    if (!petType) {
      return NextResponse.json(
        { error: "Pet type is required" },
        { status: 400 }
      );
    }

    // Validate pet type
    const normalizedPetType = petType.toLowerCase();
    if (!PET_TYPES[normalizedPetType as keyof typeof PET_TYPES]) {
      return NextResponse.json(
        { 
          error: `Invalid pet type. Supported types: ${Object.keys(PET_TYPES).join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Get SUI client for the specified network
    const suiClient = suiClientFor(network);

    // Get pet type number and image URL
    const petTypeNumber = PET_TYPES[normalizedPetType as keyof typeof PET_TYPES];
    const imageUrl = PET_IMAGES[normalizedPetType as keyof typeof PET_IMAGES];

    // Package ID - check multiple environment variables
    const packageId = process.env.PET_PACKAGE_ID || 
                     process.env.SUI_PACKAGE_ID || 
                     process.env.NEXT_PUBLIC_PET_PACKAGE_ID ||
                     "0x0"; // Default placeholder

    // Warn if using placeholder package ID
    if (packageId === "0x0") {
      console.warn("⚠️  Using placeholder package ID. Please deploy the contract and set PET_PACKAGE_ID environment variable.");
    }

    // Create transaction
    const tx = new Transaction();

    // Create description for the pet
    const description = `A ${normalizedPetType} pet named ${petDisplayName}`;

    // Add mint function call (matching the Move contract signature)
    tx.moveCall({
      target: `${packageId}::pet_nft::mint_pet`,
      arguments: [
        tx.pure(new TextEncoder().encode(petDisplayName)), // name as vector<u8>
        tx.pure(new TextEncoder().encode(description)), // description as vector<u8>
        tx.pure.u8(petTypeNumber), // pet_type as u8
        tx.pure(new TextEncoder().encode(imageUrl)), // image_url as vector<u8>
      ],
    });

    // Set sender
    tx.setSender(walletAddress);

    // Build transaction bytes
    const transactionBytes = await tx.build({ client: suiClient });

    // Convert to base64 for client-side execution
    const suiTransactionBytes = Buffer.from(transactionBytes).toString('base64');

    // Return success response with transaction data
    return NextResponse.json({
      success: true,
      data: {
        suiTransactionBytes,
        petName: petDisplayName,
        petType: normalizedPetType,
        petTypeNumber,
        imageUrl,
        ownerAddress: walletAddress,
        network,
        packageId,
        transactionSize: transactionBytes.length,
      },
      message: `PET NFT mint transaction created successfully for ${petDisplayName} (${normalizedPetType})`,
    });

  } catch (error) {
    console.error("Error creating mint transaction:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create mint transaction" 
      },
      { status: 500 }
    );
  }
}
