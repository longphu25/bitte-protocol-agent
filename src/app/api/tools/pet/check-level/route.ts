import { NextRequest, NextResponse } from "next/server";

// Mock pet database - in real implementation, this would be stored in a database
interface PetData {
  tokenId: string;
  owner: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  rarity: string;
  attributes: {
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
  };
  skills: string[];
  lastFed: string;
  lastPlayed: string;
  happiness: number;
  energy: number;
  health: number;
  createdAt: string;
  lastLevelUp?: string;
  achievements: string[];
}

const mockPets: Record<string, PetData> = {
  "pet_1691234567890_abc123def": {
    tokenId: "pet_1691234567890_abc123def",
    owner: "0x742d35Cc9001C7C1b0B5E9fD4a8dC4A0a5c7F5c1",
    name: "Draco",
    type: "Dragon",
    level: 15,
    experience: 2250,
    experienceToNextLevel: 750, // 3000 total needed for level 16
    rarity: "Rare",
    attributes: {
      strength: 95,
      agility: 78,
      intelligence: 88,
      stamina: 82,
    },
    skills: ["Fire Breath", "Flight", "Treasure Hunting", "Battle Roar"],
    lastFed: "2025-08-10T10:30:00Z",
    lastPlayed: "2025-08-10T11:15:00Z",
    happiness: 85,
    energy: 70,
    health: 100,
    createdAt: "2025-07-15T08:00:00Z",
    lastLevelUp: "2025-08-09T16:45:00Z",
    achievements: ["First Flight", "Dragon Slayer", "Treasure Master", "Battle Champion"],
  },
  "pet_1691234567891_xyz789ghi": {
    tokenId: "pet_1691234567891_xyz789ghi",
    owner: "0x742d35Cc9001C7C1b0B5E9fD4a8dC4A0a5c7F5c1",
    name: "Whiskers",
    type: "Cat",
    level: 8,
    experience: 560,
    experienceToNextLevel: 240, // 800 total needed for level 9
    rarity: "Common",
    attributes: {
      strength: 45,
      agility: 92,
      intelligence: 75,
      stamina: 58,
    },
    skills: ["Stealth", "Climbing", "Night Vision"],
    lastFed: "2025-08-10T09:00:00Z",
    lastPlayed: "2025-08-10T10:00:00Z",
    happiness: 90,
    energy: 80,
    health: 95,
    createdAt: "2025-08-01T12:00:00Z",
    lastLevelUp: "2025-08-08T14:20:00Z",
    achievements: ["Silent Hunter", "Tree Climber"],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const tokenId = searchParams.get("tokenId");
    const petName = searchParams.get("petName");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    // Find pets owned by the user
    let userPets = Object.values(mockPets).filter(pet => 
      pet.owner.toLowerCase() === userAddress.toLowerCase()
    );

    // Filter by specific token ID if provided
    if (tokenId) {
      userPets = userPets.filter(pet => pet.tokenId === tokenId);
    }

    // Filter by pet name if provided
    if (petName) {
      userPets = userPets.filter(pet => 
        pet.name.toLowerCase().includes(petName.toLowerCase())
      );
    }

    if (userPets.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          pets: [],
          totalPets: 0,
        },
        message: "No pets found for this user",
      });
    }

    // Calculate additional stats for each pet
    const petsWithStats = userPets.map(pet => ({
      ...pet,
      levelProgress: calculateLevelProgress(pet.experience, pet.level),
      powerLevel: calculatePowerLevel(pet.attributes),
      nextLevelRequirements: getNextLevelRequirements(pet.level),
      statusEffects: calculateStatusEffects(pet),
      canLevelUp: pet.experience >= getExperienceRequiredForLevel(pet.level + 1),
      totalExperience: pet.experience,
    }));

    // Sort pets by level (descending) and then by experience
    petsWithStats.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return b.experience - a.experience;
    });

    return NextResponse.json({
      success: true,
      data: {
        pets: petsWithStats,
        totalPets: petsWithStats.length,
        highestLevelPet: petsWithStats[0],
        averageLevel: calculateAverageLevel(petsWithStats),
      },
      message: "Pet levels retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking pet level:", error);
    return NextResponse.json(
      { error: "Failed to check pet level" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, experienceGained, actionType } = body;

    if (!tokenId || experienceGained === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: tokenId, experienceGained" },
        { status: 400 }
      );
    }

    const pet = mockPets[tokenId];
    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found" },
        { status: 404 }
      );
    }

    // Add experience
    const oldLevel = pet.level;
    pet.experience += experienceGained;

    // Check for level up
    let leveledUp = false;
    while (pet.experience >= getExperienceRequiredForLevel(pet.level + 1)) {
      pet.level++;
      leveledUp = true;
      pet.lastLevelUp = new Date().toISOString();
      
      // Increase attributes on level up
      increaseAttributesOnLevelUp(pet);
      
      // Learn new skills at certain levels
      const newSkill = getNewSkillForLevel(pet.type, pet.level);
      if (newSkill && !pet.skills.includes(newSkill)) {
        pet.skills.push(newSkill);
      }
    }

    // Update experience to next level
    pet.experienceToNextLevel = getExperienceRequiredForLevel(pet.level + 1) - pet.experience;

    // Update pet status based on action
    if (actionType) {
      updatePetStatusFromAction(pet, actionType);
    }

    const response = {
      success: true,
      data: {
        pet: {
          ...pet,
          levelProgress: calculateLevelProgress(pet.experience, pet.level),
          powerLevel: calculatePowerLevel(pet.attributes),
        },
        leveledUp,
        levelsGained: pet.level - oldLevel,
        experienceGained,
      },
      message: leveledUp 
        ? `${pet.name} gained ${experienceGained} experience and leveled up to level ${pet.level}!`
        : `${pet.name} gained ${experienceGained} experience`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating pet level:", error);
    return NextResponse.json(
      { error: "Failed to update pet level" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateLevelProgress(experience: number, level: number): number {
  const currentLevelExp = getExperienceRequiredForLevel(level);
  const nextLevelExp = getExperienceRequiredForLevel(level + 1);
  const progressExp = experience - currentLevelExp;
  const levelRange = nextLevelExp - currentLevelExp;
  
  return Math.floor((progressExp / levelRange) * 100);
}

function getExperienceRequiredForLevel(level: number): number {
  // Exponential experience curve: level^2 * 100
  return Math.floor(Math.pow(level, 2) * 100);
}

function calculatePowerLevel(attributes: PetData['attributes']): number {
  return attributes.strength + attributes.agility + attributes.intelligence + attributes.stamina;
}

function getNextLevelRequirements(level: number): Record<string, number> {
  const nextLevel = level + 1;
  const expRequired = getExperienceRequiredForLevel(nextLevel);
  
  return {
    experienceRequired: expRequired,
    trainingSessionsNeeded: Math.ceil((expRequired / 100) / 5), // Assuming 5 training sessions give ~100 exp
    estimatedDays: Math.ceil(expRequired / 200), // Assuming 200 exp per day average
  };
}

function calculateStatusEffects(pet: PetData): string[] {
  const effects: string[] = [];
  
  if (pet.happiness >= 90) effects.push("Very Happy");
  else if (pet.happiness >= 70) effects.push("Happy");
  else if (pet.happiness <= 30) effects.push("Sad");
  
  if (pet.energy >= 90) effects.push("Energetic");
  else if (pet.energy <= 30) effects.push("Tired");
  
  if (pet.health === 100) effects.push("Healthy");
  else if (pet.health <= 50) effects.push("Needs Care");
  
  // Check feeding status
  const lastFed = new Date(pet.lastFed);
  const hoursWithoutFood = (Date.now() - lastFed.getTime()) / (1000 * 60 * 60);
  if (hoursWithoutFood > 12) effects.push("Hungry");
  
  return effects;
}

function calculateAverageLevel(pets: PetData[]): number {
  if (pets.length === 0) return 0;
  const totalLevels = pets.reduce((sum, pet) => sum + pet.level, 0);
  return Math.round((totalLevels / pets.length) * 10) / 10; // Round to 1 decimal place
}

function increaseAttributesOnLevelUp(pet: PetData): void {
  // Random attribute increases on level up
  const increases = [1, 2, 2, 3]; // Possible increases
  const attributes = ['strength', 'agility', 'intelligence', 'stamina'] as const;
  
  attributes.forEach(attr => {
    const increase = increases[Math.floor(Math.random() * increases.length)];
    pet.attributes[attr] = Math.min(100, pet.attributes[attr] + increase);
  });
}

function getNewSkillForLevel(petType: string, level: number): string | null {
  const skillsByType: Record<string, Record<number, string>> = {
    Dragon: {
      5: "Fire Breath",
      10: "Flight",
      15: "Treasure Hunting",
      20: "Battle Roar",
      25: "Dragon Rage",
    },
    Cat: {
      3: "Stealth",
      6: "Climbing",
      9: "Night Vision",
      12: "Hunting Instinct",
      15: "Acrobatics",
    },
    Dog: {
      3: "Fetch",
      6: "Guard",
      9: "Tracking",
      12: "Loyalty Boost",
      15: "Pack Leader",
    },
    Bird: {
      3: "Flight",
      6: "Dive Attack",
      9: "Weather Sense",
      12: "Swift Escape",
      15: "Air Mastery",
    },
  };

  return skillsByType[petType]?.[level] || null;
}

function updatePetStatusFromAction(pet: PetData, actionType: string): void {
  const now = new Date().toISOString();
  
  switch (actionType) {
    case "feed":
      pet.lastFed = now;
      pet.happiness = Math.min(100, pet.happiness + 10);
      pet.energy = Math.min(100, pet.energy + 20);
      pet.health = Math.min(100, pet.health + 5);
      break;
    case "play":
      pet.lastPlayed = now;
      pet.happiness = Math.min(100, pet.happiness + 15);
      pet.energy = Math.max(0, pet.energy - 10);
      break;
    case "train":
      pet.energy = Math.max(0, pet.energy - 20);
      pet.happiness = Math.min(100, pet.happiness + 5);
      break;
    case "rest":
      pet.energy = Math.min(100, pet.energy + 30);
      pet.health = Math.min(100, pet.health + 10);
      break;
  }
}
