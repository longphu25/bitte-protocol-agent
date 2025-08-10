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

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { senderAddress, recipientAddress, amountInSui, network = "testnet" } = body;

    // Log received parameters for debugging
    console.log("Received SUI transaction request:", {
      senderAddress,
      recipientAddress,
      amountInSui,
      network,
      bodyKeys: Object.keys(body)
    });

    // Validate required parameters
    if (!senderAddress || !recipientAddress || amountInSui === undefined || amountInSui === null) {
      const errorResponse = { 
        error: "Missing required parameters", 
        required: ["senderAddress", "recipientAddress", "amountInSui"],
        received: { 
          senderAddress: !!senderAddress, 
          recipientAddress: !!recipientAddress, 
          amountInSui: amountInSui !== undefined 
        }
      };
      console.error("Parameter validation failed:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate addresses format (basic validation)
    if (!senderAddress.startsWith("0x") || !recipientAddress.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address format. Addresses must start with 0x" },
        { status: 400 }
      );
    }

    // Validate amount
    const numAmount = Number(amountInSui);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate network
    const validNetworks = ["mainnet", "testnet", "devnet"];
    if (!validNetworks.includes(network)) {
      return NextResponse.json(
        { error: `Invalid network. Must be one of: ${validNetworks.join(", ")}` },
        { status: 400 }
      );
    }

    console.log("Creating SUI transaction...");

    // Create the transaction
    const tx = new Transaction();
    const MIST_PER_SUI = 1_000_000_000; // 1e9
    const amountInMist = Math.floor(numAmount * MIST_PER_SUI);

    if (amountInMist > Number.MAX_SAFE_INTEGER) {
      return NextResponse.json(
        { error: "Amount exceeds safe integer limit" },
        { status: 400 }
      );
    }

    console.log("Setting up transaction with amount:", amountInMist, "MIST");

    try {
      // Split coins and transfer
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(amountInMist))]);
      tx.setSender(senderAddress);
      tx.transferObjects([coin], tx.pure.address(recipientAddress));

      console.log("Transaction setup complete, building...");

      // Build the transaction
      const client = suiClientFor(network);
      const txBytes = await tx.build({ client });
      
      console.log("Transaction built successfully");

      return NextResponse.json({
        success: true,
        data: { 
          suiTransactionBytes: Buffer.from(txBytes).toString('base64'),
          senderAddress,
          recipientAddress,
          amountInSui: numAmount,
          amountInMist: amountInMist.toString(),
          network,
          transactionSize: txBytes.length
        }
      });

    } catch (buildError) {
      console.error("Error building SUI transaction:", buildError);
      return NextResponse.json(
        { 
          error: "Failed to build SUI transaction", 
          details: buildError instanceof Error ? buildError.message : "Unknown build error",
          stack: buildError instanceof Error ? buildError.stack : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error creating SUI transaction:", error);
    return NextResponse.json(
      { 
        error: "Failed to create SUI transaction",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
