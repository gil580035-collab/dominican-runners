
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  password?: string; // Simple mock storage
  username: string;
  role: UserRole;
  isBanned: boolean;
  highScore: number;
  coins: number;
  selectedCharacterId: string;
  createdAt: string;
}

export enum WorldId {
  ZONA_COLONIAL = 'zona_colonial',
  NEON_CARNAVAL = 'neon_carnaval',
  QUANTUM_PUNTA_CANA = 'quantum_punta_cana'
}

export interface WorldConfig {
  id: WorldId;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  primaryColor: string;
  secondaryColor: string;
  obstacleTypes: ObstacleType[];
}

export enum ObstacleType {
  HOYO = 'hoyo', // Pothole
  MOTORISTA = 'motorista', // Motorcycle taxi
  VENDEDOR = 'vendedor', // Street vendor
  AGUA_POZA = 'agua', // Puddle
  METRO_PILLAR = 'metro', // Concrete pillar
  PIGEON = 'pigeon', // Zona Colonial Pigeon
  DIABLO = 'diablo', // Carnaval Diablo Cojuelo
  PALM_TREE = 'palm' // Sci-fi Palm
}

export interface Character {
  id: string;
  name: string;
  role: string;
  bio: string;
  emoji: string;
  color: string;
  abilityName: string;
  abilityDescription: string;
  abilityDuration: number; // in ms
  abilityCooldown: number; // in ms
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  coins: number;
  speed: number;
  distance: number;
  currentWorld: WorldId;
  gameOver: boolean;
  abilityActive: boolean;
  abilityTimeRemaining: number;
  cooldownRemaining: number;
}

export interface GameObject {
  id: number;
  lane: number; // 0, 1, 2
  z: number; // Depth position (100 -> 0)
  type: 'obstacle' | 'coin' | 'powerup';
  subtype?: ObstacleType;
}
