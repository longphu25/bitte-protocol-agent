import { ACCOUNT_ID } from "@/app/config";
import { NextResponse } from "next/server";
import {
  chainIdParam,
  addressParam,
  SignRequestResponse200,
  AddressSchema,
  MetaTransactionSchema,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Boilerplate Agent",
      description: "API for the boilerplate",
      version: "1.0.0",
    },
    servers: [
      {
        // Enter the base and open url of your agent here, make sure it is reachable
        url: process.env.NEXT_SERVER_AGENT || "http://localhost:3000",
      },
    ],
    "x-mb": {
      // The account id of the user who created the agent found in .env file
      "account-id": ACCOUNT_ID,
      // The email of the user who created the agent
      email: "longphu257@gmail.com",
        assistant: {
          name: "Pet-Agent: Multichain Pet NFT Assistant",
          description:
            "A gamified pet management system for minting unique Pet NFTs and leveling them up through task completion on Multichain blockchain",
          instructions:
            "You are a pet management assistant that helps users mint unique Pet NFTs and level them up through task-based gameplay on Multichain blockchain. You can create near, evm, and sui transactions, provide blockchain information, manage user accounts, interact with twitter, check SUI balances, flip coins, and handle all Pet NFT operations. For blockchain transactions, first generate a transaction payload using the appropriate endpoint (/api/tools/create-near-transaction, /api/tools/create-evm-transaction, or /api/tools/sui/send-sui), then explicitly use the corresponding tool ('generate-transaction' for NEAR, 'generate-evm-tx' for EVM, or the SUI transaction bytes for SUI) to execute the transaction. For Pet NFTs, you can mint new pets using /api/tools/pet/mint-nft (returns SUI transaction bytes), list available tasks, check task progress, and monitor pet levels and stats. The mint-nft endpoint creates a transaction that must be executed client-side using the 'generate-sui-tx' tool. Guide users through the gamified pet experience by explaining task requirements, pet evolution mechanics, and reward systems.",
          tools: [
            { type: "generate-transaction" },
            { type: "generate-evm-tx" },
            { type: "sign-message" },
            { type: 'generate-sui-tx' },
          ],
        // Thumbnail image for your agent
        image: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/bitte.svg`,
        // The repo url for your agent https://github.com/your-username/your-agent-repo
        repo: "https://github.com/longphu25/bitte-protocol-agent",
        // The categories your agent supports ["DeFi", "DAO", "NFT", "Social"]
        categories: ["DeFi", "DAO", "NFT", "Social"],
        // The chains your agent supports 1 = mainnet, 8453 = base
        chainIds: [1, 8453],
      },
    },
    paths: {
      "/api/tools/get-blockchains": {
        get: {
          summary: "get blockchain information",
          description: "Respond with a list of blockchains",
          operationId: "get-blockchains",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "The list of blockchains",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/get-user": {
        get: {
          summary: "get user information",
          description: "Returns user account ID and EVM address",
          operationId: "get-user",
          parameters: [
            {
              name: "accountId",
              in: "query",
              required: false,
              schema: {
                type: "string",
              },
              description: "The user's account ID",
            },
            {
              name: "evmAddress",
              in: "query",
              required: false,
              schema: {
                type: "string",
              },
              description: "The user's EVM address",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      accountId: {
                        type: "string",
                        description:
                          "The user's account ID, if you dont have it, return an empty string",
                      },
                      evmAddress: {
                        type: "string",
                        description:
                          "The user's EVM address, if you dont have it, return an empty string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/twitter": {
        get: {
          operationId: "getTwitterShareIntent",
          summary: "Generate a Twitter share intent URL",
          description:
            "Creates a Twitter share intent URL based on provided parameters",
          parameters: [
            {
              name: "text",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The text content of the tweet",
            },
            {
              name: "url",
              in: "query",
              required: false,
              schema: {
                type: "string",
              },
              description: "The URL to be shared in the tweet",
            },
            {
              name: "hashtags",
              in: "query",
              required: false,
              schema: {
                type: "string",
              },
              description: "Comma-separated hashtags for the tweet",
            },
            {
              name: "via",
              in: "query",
              required: false,
              schema: {
                type: "string",
              },
              description: "The Twitter username to attribute the tweet to",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      twitterIntentUrl: {
                        type: "string",
                        description: "The generated Twitter share intent URL",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/create-near-transaction": {
        get: {
          operationId: "createNearTransaction",
          summary: "Create a NEAR transaction payload",
          description:
            "Generates a NEAR transaction payload for transferring tokens to be used directly in the generate-tx tool",
          parameters: [
            {
              name: "receiverId",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The NEAR account ID of the receiver",
            },
            {
              name: "amount",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The amount of NEAR tokens to transfer",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      transactionPayload: {
                        type: "object",
                        properties: {
                          receiverId: {
                            type: "string",
                            description: "The receiver's NEAR account ID",
                          },
                          actions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                type: {
                                  type: "string",
                                  description:
                                    "The type of action (e.g., 'Transfer')",
                                },
                                params: {
                                  type: "object",
                                  properties: {
                                    deposit: {
                                      type: "string",
                                      description:
                                        "The amount to transfer in yoctoNEAR",
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/create-evm-transaction": {
        get: {
          operationId: "createEvmTransaction",
          summary: "Create EVM transaction",
          description:
            "Generate an EVM transaction payload with specified recipient and amount to be used directly in the generate-evm-tx tool",
          parameters: [
            {
              name: "to",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The EVM address of the recipient",
            },
            {
              name: "amount",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "The amount of ETH to transfer",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      evmSignRequest: {
                        type: "object",
                        properties: {
                          to: {
                            type: "string",
                            description: "Receiver address",
                          },
                          value: {
                            type: "string",
                            description: "Transaction value",
                          },
                          data: {
                            type: "string",
                            description: "Transaction data",
                          },
                          from: {
                            type: "string",
                            description: "Sender address",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/coinflip": {
        get: {
          summary: "Coin flip",
          description: "Flip a coin and return the result (heads or tails)",
          operationId: "coinFlip",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      result: {
                        type: "string",
                        description:
                          "The result of the coin flip (heads or tails)",
                        enum: ["heads", "tails"],
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/eth-sign-request": {
        get: {
          summary: "returns ethereum signature requests",
          description:
            "Constructs requested signature requests (eth_sign, personal_sign, eth_signTypedData, eth_signTypedData_v4)",
          operationId: "eth-sign",
          parameters: [
            { $ref: "#/components/parameters/chainId" },
            { $ref: "#/components/parameters/evmAddress" },
            { $ref: "#/components/parameters/method" },
            { $ref: "#/components/parameters/message" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/sui/testnet/get-balance": {
        get: {
          summary: "SUI Tool - Testnet Get Balance",
          description:
            "Tool to get the balance of a SUI address on the testnet",
          operationId: "sui-testnet-get-balance",
          parameters: [
            {
              name: "param",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "The SUI address to check balance for (must start with 0x)",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      result: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/sui/send-sui": {
        post: {
          summary: "Send a Sui tokens",
          description:
            "Accept the args and return a valid sui transaction in bytes to send tokens to an address",
          operationId: "generateSuiTx",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    senderAddress: {
                      type: "string",
                      description: "Address sending SUI",
                    },
                    recipientAddress: {
                      type: "string",
                      description: "Address receiving SUI",
                    },
                    amountInSui: {
                      type: "number",
                      description: "Amount of SUI to send",
                    },
                    network: {
                      type: "string",
                      enum: ["mainnet", "testnet", "devnet"],
                      default: "testnet",
                      description: "Which Sui network to use",
                    },
                  },
                  required: [
                    "senderAddress",
                    "recipientAddress",
                    "amountInSui",
                  ],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        description:
                          "Whether the transaction was successfully built or validated",
                      },
                      data: {
                        type: "object",
                        description: "Additional result data",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      parameters: {
        evmAddress: { ...addressParam, name: "evmAddress" },
        method: {
          name: "method",
          description: "The signing method to be used.",
          in: "query",
          required: true,
          schema: {
            type: "string",
            enum: [
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4",
            ],
          },
          example: "eth_sign",
        },
        chainId: { ...chainIdParam, example: 8453, required: false },
        message: {
          name: "message",
          in: "query",
          required: false,
          description: "any text message",
          schema: { type: "string" },
          example: "Hello Bitte",
        },
      },
      responses: {
        SignRequestResponse200,
      },
      schemas: {
        Address: AddressSchema,
        MetaTransaction: MetaTransactionSchema,
        SignRequest: SignRequestSchema,
      },
    },
  };

  return NextResponse.json(pluginData);
}
