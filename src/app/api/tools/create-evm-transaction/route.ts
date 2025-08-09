import { NextResponse } from "next/server";
import { signRequestFor } from "@bitte-ai/agent-sdk";
import { parseEther, isAddress, toHex } from "viem";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get("to");
    const amount = searchParams.get("amount");

    if (!to || !amount) {
      console.log(`to: ${to}\namount: ${amount}`);

      return NextResponse.json(
        { error: '"to" and "amount" are required parameters' },
        { status: 400 },
      );
    }

    if (!isAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid "to" address' },
        { status: 400 },
      );
    }

    // Create EVM transaction object
    const signRequestTransaction = signRequestFor({
      chainId: 1,
      metaTransactions: [
        {
          to: to as `0x${string}`,
          value: toHex(parseEther(amount.toString())),
          data: "0x",
        },
      ],
    });

    return NextResponse.json(
      { evmSignRequest: signRequestTransaction },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating EVM transaction:", error);
    return NextResponse.json(
      { error: "Failed to generate EVM transaction" },
      { status: 500 },
    );
  }
}
