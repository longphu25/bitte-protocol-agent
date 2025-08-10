# Pet-Agent: Mintable NFT Pets & Task-Based Leveling on Multichain Blockchain

A gamified pet management system built on the Multichain blockchain using Bitte.ai's agent platform. Users can mint unique Pet NFTs and level them up by completing various tasks, creating an engaging web3 gaming experience.

## 🌟 Features

- 🐾 **Pet NFT Minting** - Mint unique Pet NFTs on SUI blockchain (one per wallet)
- 📈 **Dynamic Leveling System** - Pet NFTs level up through task completion
- 🎯 **Task-Based Gameplay** - Complete diverse tasks to earn experience points:
  - Social media interactions (Twitter-like)
  - Content engagement (YouTube-like viewing)
  - Website visits and exploration
  - Custom gamified challenges
- 🔗 **SUI Blockchain Integration** - Leveraging SUI's mutable NFT capabilities
- 🤖 **Bitte.ai Agent Platform** - Seamless wallet integration and transaction handling
- ⚡ **Next.js 15** with App Router and TypeScript
- 🎨 **Modern Development Stack** - Tailwind CSS, ESLint, TypeScript
- 🚀 **Real-time Updates** - Dynamic NFT attribute updates on task completion
- � **Progress Tracking** - Monitor pet growth and task completion statistics

## 🎮 Pet-Agent Overview

The Pet-Agent is a gamified blockchain experience where users can:

1. **Mint Unique Pet NFTs** - Each wallet can mint exactly one Pet NFT on the SUI blockchain
2. **Complete Engaging Tasks** - Earn experience points through various activities
3. **Level Up Pets Dynamically** - Watch your pet grow stronger as you complete challenges
4. **Track Progress** - Monitor your pet's development and task completion history

### Core Gameplay Loop

1. Connect SUI-compatible wallet to the pet-agent
2. Mint your unique Pet NFT (one per wallet)
3. Browse and complete available tasks
4. Earn XP and level up your pet automatically
5. Unlock new abilities and visual enhancements

## 🐾 Pet NFT System

### NFT Metadata Structure

```json
{
  "name": "Your Pet Name",
  "description": "A unique companion on SUI",
  "image": "ipfs://pet-image-url",
  "attributes": {
    "level": 1,
    "experience": 0,
    "pet_type": "dragon",
    "creation_date": "timestamp",
    "total_tasks_completed": 0
  }
}
```

### Dynamic Leveling

- **Experience Points (XP)**: Earned through task completion
- **Level Progression**: Automatic level-ups when XP thresholds are reached
- **Mutable NFTs**: Leveraging SUI's dynamic fields for real-time updates
- **Visual Evolution**: Higher-level pets unlock new appearances and abilities

## 🎯 Task System

### Available Task Types

1. **Social Engagement Tasks**
   - Twitter-like interactions
   - Share content and engage with community
   - Follow specific accounts or hashtags

2. **Content Consumption Tasks**
   - Watch YouTube videos (view time tracking)
   - Read articles or blog posts
   - Explore educational content

3. **Web Exploration Tasks**
   - Visit specified websites
   - Complete web-based challenges
   - Discover new platforms and services

4. **Community Challenges**
   - Participate in community events
   - Complete collaborative tasks
   - Engage with other pet owners

### Task Completion Verification

- **On-chain verification** for blockchain-related tasks
- **Off-chain monitoring** for web interactions
- **Agent-based validation** through Bitte.ai platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Bitte wallet account with SUI support
- Git
- SUI-compatible wallet (Sui Wallet, Ethos, etc.)

### 1. Clone and Setup

```bash
git clone https://github.com/BitteProtocol/agent-next-boilerplate.git
cd agent-next-boilerplate
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```bash
# Required: Get your API key from https://key.bitte.ai
BITTE_API_KEY='your-api-key'

# Required: Your SUI account address
SUI_ACCOUNT_ADDRESS='your-sui-address'

# Optional: SUI Network configuration (testnet/mainnet)
SUI_NETWORK='testnet'

# Optional: For local development
NEXT_PUBLIC_HOST='localhost'
PORT=3000

# Optional: Pet NFT contract configuration
PET_CONTRACT_PACKAGE_ID='your-contract-package-id'
```

### 3. Start Development

```bash
pnpm run dev
```

This command will:

- Start your Next.js application on `http://localhost:3000`
- Launch `make-agent` development mode
- Prompt you to sign a message in your SUI wallet to authenticate
- Open your pet-agent in the Bitte playground for testing
- Enable hot reload for seamless development

## �️ Available Tools & Features

The Pet-Agent includes specialized tools for managing Pet NFTs and tasks on SUI:

### 1. **Pet NFT Minting** (`/api/tools/mint-pet`)

- **Purpose**: Mint a unique Pet NFT on SUI blockchain
- **Parameters**: `petName`, `petType`, `initialAttributes`
- **Implementation**: One NFT per wallet restriction with SUI Move contract
- **Integration**: Uses SUI transaction building for minting

### 2. **Task Management** (`/api/tools/get-tasks`)

- **Purpose**: Retrieve available tasks for XP earning
- **Implementation**: Dynamic task list with difficulty levels
- **Categories**: Social, Content, Web, Community tasks
- **Return Format**: Task ID, description, XP reward, completion criteria

### 3. **Task Completion** (`/api/tools/complete-task`)

- **Purpose**: Mark tasks as completed and award XP
- **Parameters**: `taskId`, `completionProof`, `userAddress`
- **Verification**: Multi-layer validation (on-chain/off-chain)
- **Integration**: Triggers pet leveling system

### 4. **Pet Level Update** (`/api/tools/level-up-pet`)

- **Purpose**: Update Pet NFT attributes when leveling up
- **Parameters**: `petNftId`, `newLevel`, `newXP`, `newAttributes`
- **Implementation**: SUI dynamic fields for mutable NFT updates
- **Visual Updates**: New pet appearances and abilities unlocked

### 5. **Pet Status Check** (`/api/tools/get-pet-status`)

- **Purpose**: Retrieve current pet information and statistics
- **Return Data**: Level, XP, completed tasks, visual attributes
- **Real-time**: Always shows current blockchain state
- **Analytics**: Progress tracking and achievement milestones

### 6. **SUI Wallet Integration** (`/api/tools/sui-wallet`)

- **Purpose**: Handle SUI wallet connections and transactions
- **Features**: Balance checking, transaction signing, NFT display
- **Compatibility**: Sui Wallet, Ethos, and other SUI wallets
- **Security**: Secure transaction building and validation

### 4. Build for Production

```bash
# Build without deployment
pnpm run build

# Build and deploy to production
pnpm run build:deploy
```

## 🤖 Pet-Agent Configuration

The pet-agent is configured through the AI plugin manifest at `/api/ai-plugin/route.ts`. This endpoint returns an OpenAPI specification that defines:

### Agent Metadata

```typescript
{
  name: "Pet-Agent: SUI NFT Companion",
  description: "A gamified pet management system on SUI blockchain...",
  instructions: "You help users mint Pet NFTs, complete tasks, and level up their virtual companions...",
  tools: [
    { type: "sui-transaction" },        // SUI transactions
    { type: "nft-mint" },              // Pet NFT minting
    { type: "task-management" },       // Task completion tracking
    { type: "level-system" }           // Pet leveling mechanics
  ],
  categories: ["Gaming", "NFT", "SUI", "Gamification"],
  chainIds: ["sui:testnet", "sui:mainnet"]
}
```

### Important Configuration Notes

1. **SUI Integration**: The agent uses SUI's Move language and mutable NFT capabilities
2. **Task System**: Integrated task verification and XP reward mechanisms
3. **Pet Leveling**: Automatic NFT attribute updates through dynamic fields
4. **Single Pet Policy**: One NFT per wallet enforcement at contract level
5. **Real-time Updates**: Live pet status and progress tracking

## 📝 Environment Variables

| Variable                    | Required | Description                                                        | Example                           |
| --------------------------- | -------- | ------------------------------------------------------------------ | --------------------------------- |
| `BITTE_API_KEY`            | ✅       | Your Bitte API key from [key.bitte.ai](https://key.bitte.ai)     | `bitte_key_...`                  |
| `SUI_ACCOUNT_ADDRESS`       | ✅       | Your SUI wallet address                                           | `0x123...abc`                    |
| `SUI_NETWORK`              | ❌       | SUI network (testnet/mainnet)                                     | `testnet`                        |
| `PET_CONTRACT_PACKAGE_ID`   | ❌       | Pet NFT smart contract package ID                                 | `0x456...def`                    |
| `NEXT_PUBLIC_HOST`         | ❌       | Development host                                                  | `localhost`                      |
| `PORT`                     | ❌       | Development port                                                  | `3000`                           |
| `NEXT_PUBLIC_BASE_URL`     | ❌       | Base URL for assets                                               | `https://yourdomain.com`         |

## 🎮 User Flow

### Complete Pet-Agent Experience

1. **Initial Setup**
   - User visits pet-agent interface powered by Bitte.ai
   - Connect SUI-compatible wallet (Sui Wallet, Ethos, etc.)
   - Agent verifies wallet connection and displays welcome message

2. **Pet NFT Minting**
   - User chooses to mint their unique Pet NFT
   - Select pet type, name, and initial attributes
   - Agent generates SUI transaction for minting
   - User approves transaction in wallet
   - Pet NFT is minted with level 1 and 0 XP

3. **Task Discovery**
   - Agent displays available tasks categorized by type
   - Tasks include social media, content viewing, web exploration
   - Each task shows XP reward and completion requirements
   - User can filter tasks by difficulty or category

4. **Task Completion**
   - User selects and completes tasks
   - Agent verifies task completion through various methods
   - XP is automatically awarded to the pet NFT
   - Progress is tracked and displayed in real-time

5. **Pet Leveling**
   - When XP threshold is reached, pet automatically levels up
   - Agent triggers transaction to update NFT attributes
   - New abilities, visual enhancements, or bonuses are unlocked
   - User receives notification of pet's growth

6. **Progress Tracking**
   - View pet statistics, level history, and achievements
   - Compare progress with other pet owners
   - Access leaderboards and community features
   - Plan future tasks and leveling strategies

## 🏗️ Technical Architecture

### SUI Blockchain Components

- **Pet NFT Smart Contract**: Move language implementation with mutable fields
- **Task Verification**: On-chain task completion tracking
- **XP System**: Dynamic NFT attribute updates
- **Level Mechanics**: Automated leveling thresholds and rewards

### Bitte.ai Integration

- **Agent Framework**: No-code/low-code agent development
- **Wallet Connection**: Seamless SUI wallet integration
- **Transaction Building**: Automated SUI transaction generation
- **User Interface**: Chat-based and UI widget interactions

## 🛠️ Development Scripts

```bash
# Development with hot reload and make-agent
pnpm run dev

# Next.js development only (without make-agent)
pnpm run dev:agent

# Production build (local)
pnpm run build

# Build and deploy to production
pnpm run build:deploy

# Linting
pnpm run lint

# Test SUI connection
pnpm run test:sui

# Deploy pet contract to SUI
pnpm run deploy:contract
```

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `BITTE_API_KEY`
   - `SUI_ACCOUNT_ADDRESS`
   - `SUI_NETWORK`
   - `PET_CONTRACT_PACKAGE_ID`
4. Deploy! The build process automatically runs `make-agent deploy`

### Manual Deployment

```bash
# Build and deploy manually
pnpm run build:deploy
```

## 🎯 Success Metrics

Track the success of your Pet-Agent with these key metrics:

- **Pet NFT Mints**: Number of unique pets created
- **Task Completion Rate**: Percentage of tasks completed by users
- **Average Pet Level**: Mean level across all pets
- **User Retention**: Daily/weekly active users
- **Transaction Volume**: SUI transactions generated
- **Community Engagement**: User interactions and social sharing

## 🔨 Creating Custom Tasks

To add new tasks to the pet-agent system:

### 1. Define Task Structure

```typescript
// src/types/task.ts
interface Task {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'content' | 'web' | 'community';
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string[];
  verificationMethod: 'onchain' | 'offchain' | 'hybrid';
}
```

### 2. Create Task Endpoint

```typescript
// src/app/api/tools/tasks/custom-task/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { taskId, userAddress, completionProof } = await request.json();

  // Verify task completion
  const isCompleted = await verifyTaskCompletion(taskId, completionProof);
  
  if (isCompleted) {
    // Award XP to pet
    await awardXP(userAddress, task.xpReward);
    return NextResponse.json({ success: true, xpAwarded: task.xpReward });
  }

  return NextResponse.json({ success: false, error: "Task not completed" });
}
```

### 3. Update Agent Manifest

Add the new task endpoint to `/api/ai-plugin/route.ts` in the OpenAPI specification.

### 4. Implement Verification Logic

Create appropriate verification methods for your task type:

- **On-chain**: Verify blockchain transactions or state
- **Off-chain**: API calls to external services
- **Hybrid**: Combination of both methods

## 📖 Key Dependencies

- **[@bitte-ai/agent-sdk](https://www.npmjs.com/package/@bitte-ai/agent-sdk)** - Core SDK for Bitte integration
- **[make-agent](https://www.npmjs.com/package/make-agent)** - Development and deployment tooling
- **[@mysten/sui.js](https://www.npmjs.com/package/@mysten/sui.js)** - TypeScript SDK for SUI blockchain
- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[vercel-url](https://www.npmjs.com/package/vercel-url)** - Automatic deployment URL detection

## 🌐 Community & Support

- 📚 [Bitte Protocol Documentation](https://docs.bitte.ai)
- 💬 [Join our Telegram](https://t.me/bitteai) - Get help and connect with other developers
- 🐛 [Report Issues](https://github.com/BitteProtocol/agent-next-boilerplate/issues)
- 🔗 [SUI Documentation](https://docs.sui.io)
- 📋 [OpenAPI Specification](https://swagger.io/specification/)
- 🎮 [Pet-Agent Community](https://discord.gg/pet-agent) - Connect with other pet owners

## 📋 Project Structure

```text
pet-agent/
├── src/app/
│   ├── api/
│   │   ├── ai-plugin/route.ts          # Pet-agent manifest endpoint
│   │   └── tools/                      # Pet-agent tool endpoints
│   │       ├── mint-pet/               # Pet NFT minting
│   │       ├── get-tasks/              # Task listing
│   │       ├── complete-task/          # Task completion
│   │       ├── level-up-pet/           # Pet leveling
│   │       ├── get-pet-status/         # Pet information
│   │       └── sui-wallet/             # SUI wallet integration
│   ├── config.ts                       # Environment configuration
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Pet-agent interface
├── contracts/                          # SUI Move smart contracts
│   ├── pet_nft.move                   # Pet NFT contract
│   └── task_system.move               # Task management contract
├── public/                             # Static assets and pet images
├── package.json                        # Dependencies and scripts
└── README.md                           # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Areas for Contribution

- New task types and verification methods
- Pet visual enhancements and animations
- Advanced leveling mechanics and rewards
- Community features and social interactions
- Performance optimizations and gas efficiency

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Bitte Protocol](https://bitte.ai) and [SUI Blockchain](https://sui.io)
