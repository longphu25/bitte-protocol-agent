import { NextRequest, NextResponse } from "next/server";

// Mock task database - in real implementation, this would be stored in a database
const mockTasks = [
  {
    id: "task_001",
    title: "Feed Your Pet",
    description: "Feed your pet to increase its happiness and energy",
    type: "daily",
    reward: {
      experience: 50,
      coins: 10,
    },
    requirements: {
      petLevel: 1,
    },
    difficulty: "Easy",
    category: "Care",
    isActive: true,
    createdAt: "2025-08-10T00:00:00Z",
  },
  {
    id: "task_002",
    title: "Play with Pet",
    description: "Spend time playing with your pet to boost its mood",
    type: "daily",
    reward: {
      experience: 75,
      coins: 15,
    },
    requirements: {
      petLevel: 1,
    },
    difficulty: "Easy",
    category: "Entertainment",
    isActive: true,
    createdAt: "2025-08-10T00:00:00Z",
  },
  {
    id: "task_003",
    title: "Train Pet Skills",
    description: "Train your pet to learn new skills and abilities",
    type: "weekly",
    reward: {
      experience: 200,
      coins: 50,
      items: ["Skill Book", "Training Treats"],
    },
    requirements: {
      petLevel: 3,
    },
    difficulty: "Medium",
    category: "Training",
    isActive: true,
    createdAt: "2025-08-10T00:00:00Z",
  },
  {
    id: "task_004",
    title: "Pet Battle Tournament",
    description: "Enter your pet in a tournament to compete with other pets",
    type: "event",
    reward: {
      experience: 500,
      coins: 200,
      items: ["Tournament Trophy", "Rare Accessory"],
    },
    requirements: {
      petLevel: 10,
      minimumStats: {
        strength: 70,
        agility: 60,
      },
    },
    difficulty: "Hard",
    category: "Combat",
    isActive: true,
    createdAt: "2025-08-10T00:00:00Z",
  },
  {
    id: "task_005",
    title: "Explore New Territory",
    description: "Take your pet on an adventure to discover new areas",
    type: "adventure",
    reward: {
      experience: 300,
      coins: 100,
      items: ["Explorer's Map", "Adventure Badge"],
    },
    requirements: {
      petLevel: 5,
      minimumStats: {
        stamina: 50,
      },
    },
    difficulty: "Medium",
    category: "Exploration",
    isActive: true,
    createdAt: "2025-08-10T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const petLevel = searchParams.get("petLevel");
    const taskType = searchParams.get("taskType"); // daily, weekly, event, adventure
    const category = searchParams.get("category"); // Care, Entertainment, Training, Combat, Exploration
    const difficulty = searchParams.get("difficulty"); // Easy, Medium, Hard

    let filteredTasks = [...mockTasks];

    // Filter by task type
    if (taskType) {
      filteredTasks = filteredTasks.filter(task => 
        task.type.toLowerCase() === taskType.toLowerCase()
      );
    }

    // Filter by category
    if (category) {
      filteredTasks = filteredTasks.filter(task => 
        task.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (difficulty) {
      filteredTasks = filteredTasks.filter(task => 
        task.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Filter by pet level requirements
    if (petLevel) {
      const level = parseInt(petLevel);
      filteredTasks = filteredTasks.filter(task => 
        task.requirements.petLevel <= level
      );
    }

    // Add completion status if user address is provided
    if (userAddress) {
      filteredTasks = filteredTasks.map(task => ({
        ...task,
        completionStatus: getTaskCompletionStatus(userAddress, task.id),
      }));
    }

    // Sort tasks by difficulty and level requirements
    filteredTasks.sort((a, b) => {
      const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
      return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
             difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
    });

    return NextResponse.json({
      success: true,
      data: {
        tasks: filteredTasks,
        totalTasks: filteredTasks.length,
        availableFilters: {
          types: ["daily", "weekly", "event", "adventure"],
          categories: ["Care", "Entertainment", "Training", "Combat", "Exploration"],
          difficulties: ["Easy", "Medium", "Hard"],
        },
      },
      message: "Tasks retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching task list:", error);
    return NextResponse.json(
      { error: "Failed to fetch task list" },
      { status: 500 }
    );
  }
}

// Helper function to get task completion status for a user
function getTaskCompletionStatus(userAddress: string, taskId: string) {
  // Mock completion status - in real implementation, this would query the database
  const mockCompletions: Record<string, {
    completed: boolean;
    completedAt?: string;
    rewardClaimed?: boolean;
    progress?: number;
  }> = {
    "task_001": {
      completed: true,
      completedAt: "2025-08-10T10:00:00Z",
      rewardClaimed: true,
    },
    "task_002": {
      completed: false,
      progress: 50, // percentage
    },
    "task_003": {
      completed: true,
      completedAt: "2025-08-09T15:30:00Z",
      rewardClaimed: false,
    },
  };

  return mockCompletions[taskId] || {
    completed: false,
    progress: 0,
  };
}
