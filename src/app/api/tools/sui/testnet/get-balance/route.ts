import { NextResponse } from "next/server";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("param");

    // Validate required parameter
    if (!address) {
      return NextResponse.json(
        { error: "Missing required parameter: param (SUI address)" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address format. Address must start with 0x" },
        { status: 400 }
      );
    }

    // Create SUI client for testnet
    const client = new SuiClient({ 
      url: getFullnodeUrl("testnet") 
    });

    // Get balance
    const balance = await client.getBalance({
      owner: address,
    });

    // Convert from MIST to SUI (1 SUI = 1e9 MIST)
    const balanceInSui = Number(balance.totalBalance) / 1e9;

    return NextResponse.json({
      result: `Address ${address} has ${balanceInSui} SUI on testnet`,
      balance: {
        totalBalance: balance.totalBalance,
        balanceInSui: balanceInSui,
        coinType: balance.coinType,
        coinObjectCount: balance.coinObjectCount
      }
    });

  } catch (error) {
    console.error("Error getting SUI balance:", error);
    return NextResponse.json(
      { error: "Failed to get SUI balance" },
      { status: 500 }
    );
  }
}
