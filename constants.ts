
import { WorldId, WorldConfig, ObstacleType, Character } from './types';

export const CHARACTERS: Record<string, Character> = {
  mofonguero: {
    id: 'mofonguero',
    name: "El Mofonguero",
    role: "Culinary Tank",
    bio: "Armed with a pilón cannon. He launches giant mofongo balls to clear the path.",
    emoji: "👨🏾‍🍳",
    color: "text-yellow-600",
    abilityName: "Mofongo Blast",
    abilityDescription: "Destroys all obstacles on screen instantly.",
    abilityDuration: 1000,
    abilityCooldown: 15000
  },
  bachatera: {
    id: 'bachatera',
    name: "La Bachatera 3000",
    role: "Agile Dodger",
    bio: "Moved by the rhythm of the cyber-requinto. She dances through solid matter.",
    emoji: "💃🏽",
    color: "text-pink-500",
    abilityName: "Vueltita Ghost",
    abilityDescription: "Becomes transparent and passes through obstacles unharmed.",
    abilityDuration: 5000,
    abilityCooldown: 20000
  },
  tiguere: {
    id: 'tiguere',
    name: "El Tiguere Jet",
    role: "Speedster",
    bio: "He knows every shortcut in the galaxy. His jetpack runs on pure Dominican ingenuity.",
    emoji: "🚀",
    color: "text-cyan-400",
    abilityName: "Nitro Concho",
    abilityDescription: "Super speed boost + invincibility.",
    abilityDuration: 3000,
    abilityCooldown: 25000
  }
};

export const WORLDS: Record<WorldId, WorldConfig> = {
  [WorldId.ZONA_COLONIAL]: {
    id: WorldId.ZONA_COLONIAL,
    name: "Zona Colonial 3050",
    description: "Ancient ruins meet hologram statues. Watch out for cyber-pigeons and tourist traps.",
    difficulty: 'Medium',
    primaryColor: 'from-orange-700 to-amber-900',
    secondaryColor: 'bg-amber-950',
    obstacleTypes: [ObstacleType.METRO_PILLAR, ObstacleType.PIGEON, ObstacleType.HOYO]
  },
  [WorldId.NEON_CARNAVAL]: {
    id: WorldId.NEON_CARNAVAL,
    name: "Neon Carnaval",
    description: "A never-ending party in orbit. Avoid the Diablos Cojuelos and loud speakers.",
    difficulty: 'Hard',
    primaryColor: 'from-purple-600 to-pink-600',
    secondaryColor: 'bg-purple-950',
    obstacleTypes: [ObstacleType.DIABLO, ObstacleType.VENDEDOR, ObstacleType.MOTORISTA]
  },
  [WorldId.QUANTUM_PUNTA_CANA]: {
    id: WorldId.QUANTUM_PUNTA_CANA,
    name: "Quantum Punta Cana",
    description: "Floating islands and plasma beaches. Dodge the radioactive coconuts.",
    difficulty: 'Easy',
    primaryColor: 'from-cyan-400 to-blue-500',
    secondaryColor: 'bg-cyan-950',
    obstacleTypes: [ObstacleType.PALM_TREE, ObstacleType.AGUA_POZA]
  }
};

export const STORAGE_KEYS = {
  USERS: 'dominican_runner_users_v2',
  CURRENT_USER: 'dominican_runner_current_user_v2'
};
