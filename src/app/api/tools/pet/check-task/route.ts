import { NextRequest, NextResponse } from "next/server";

// Mock task completion database
interface TaskProgress {
  completed: boolean;
  completedAt?: string;
  rewardClaimed?: boolean;
  timeSpent?: number;
  startedAt?: string;
  progress?: number;
  currentStep?: string;
  requirements?: Record<string, boolean>;
  locked?: boolean;
  reason?: string;
  lastUpdated?: string;
  rewardClaimedAt?: string;
}

const mockUserTaskProgress: Record<string, Record<string, TaskProgress>> = {
  "0x742d35Cc9001C7C1b0B5E9fD4a8dC4A0a5c7F5c1": {
    "task_001": {
      completed: true,
      completedAt: "2025-08-10T10:00:00Z",
      rewardClaimed: true,
      timeSpent: 300, // seconds
    },
    "task_002": {
      completed: false,
      startedAt: "2025-08-10T12:00:00Z",
      progress: 75, // percentage
      currentStep: "Playing with pet",
    },
    "task_003": {
      completed: true,
      completedAt: "2025-08-09T15:30:00Z",
      rewardClaimed: false,
      timeSpent: 1800,
    },
    "task_004": {
      completed: false,
      progress: 25,
      currentStep: "Training for tournament",
      requirements: {
        strengthMet: true,
        agilityMet: false,
        levelMet: true,
      },
    },
    "task_005": {
      completed: false,
      progress: 0,
      locked: true,
      reason: "Pet level too low (required: 5, current: 3)",
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const taskId = searchParams.get("taskId");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    const userTasks = mockUserTaskProgress[userAddress] || {};

    // If specific task ID is provided, return only that task's status
    if (taskId) {
      const taskStatus = userTasks[taskId];
      
      if (!taskStatus) {
        return NextResponse.json({
          success: true,
          data: {
            taskId,
            status: "not_started",
            completed: false,
            progress: 0,
          },
          message: "Task not started yet",
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          taskId,
          status: getTaskStatus(taskStatus),
          ...taskStatus,
        },
        message: "Task status retrieved successfully",
      });
    }

    // Return all tasks with their statuses
    const allTaskStatuses = Object.entries(userTasks).map(([id, status]) => ({
      taskId: id,
      status: getTaskStatus(status),
      ...status,
    }));

    // Calculate overall progress statistics
    const totalTasks = allTaskStatuses.length;
    const completedTasks = allTaskStatuses.filter(task => task.completed).length;
    const inProgressTasks = allTaskStatuses.filter(task => 
      !task.completed && (task.progress || 0) > 0
    ).length;
    const availableRewards = allTaskStatuses.filter(task => 
      task.completed && !task.rewardClaimed
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        tasks: allTaskStatuses,
        statistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          availableRewards,
        },
      },
      message: "User task progress retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking task status:", error);
    return NextResponse.json(
      { error: "Failed to check task status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, taskId, action, progress } = body;

    if (!userAddress || !taskId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: userAddress, taskId, action" },
        { status: 400 }
      );
    }

    const validActions = ["start", "update_progress", "complete", "claim_reward"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // Initialize user tasks if not exists
    if (!mockUserTaskProgress[userAddress]) {
      mockUserTaskProgress[userAddress] = {};
    }

    let taskStatus = mockUserTaskProgress[userAddress][taskId] || {
      completed: false,
      progress: 0,
    };

    // Handle different actions
    switch (action) {
      case "start":
        taskStatus = {
          ...taskStatus,
          startedAt: new Date().toISOString(),
          progress: 0,
          completed: false,
        };
        break;

      case "update_progress":
        if (typeof progress === "number" && progress >= 0 && progress <= 100) {
          taskStatus.progress = progress;
          taskStatus.lastUpdated = new Date().toISOString();
          
          // Auto-complete if progress reaches 100%
          if (progress >= 100) {
            taskStatus.completed = true;
            taskStatus.completedAt = new Date().toISOString();
          }
        }
        break;

      case "complete":
        taskStatus = {
          ...taskStatus,
          completed: true,
          completedAt: new Date().toISOString(),
          progress: 100,
        };
        break;

      case "claim_reward":
        if (taskStatus.completed && !taskStatus.rewardClaimed) {
          taskStatus.rewardClaimed = true;
          taskStatus.rewardClaimedAt = new Date().toISOString();
        } else {
          return NextResponse.json(
            { error: "Cannot claim reward. Task not completed or reward already claimed." },
            { status: 400 }
          );
        }
        break;
    }

    // Update the task status
    mockUserTaskProgress[userAddress][taskId] = taskStatus;

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        status: getTaskStatus(taskStatus),
        ...taskStatus,
      },
      message: `Task ${action} successful`,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}

// Helper function to determine task status
function getTaskStatus(taskData: TaskProgress): string {
  if (taskData.locked) return "locked";
  if (taskData.completed) {
    return taskData.rewardClaimed ? "completed_and_claimed" : "completed_pending_reward";
  }
  if ((taskData.progress || 0) > 0) return "in_progress";
  if (taskData.startedAt) return "started";
  return "not_started";
}
