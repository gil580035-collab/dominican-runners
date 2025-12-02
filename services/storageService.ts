
import { User, UserRole } from '../types';
import { WORLDS, STORAGE_KEYS, CHARACTERS } from '../constants';

const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const AuthService = {
  login: (email: string, password?: string): User | null => {
    const users = getUsers();
    
    // Admin Backdoor (Hardcoded for demo safety)
    if (email === 'admin@concho.com' && password === 'admin123') {
      const admin: User = {
        id: 'admin-001',
        email,
        username: 'El Jefe Supremo',
        role: UserRole.ADMIN,
        isBanned: false,
        highScore: 999999,
        coins: 1000000,
        selectedCharacterId: 'tiguere',
        createdAt: new Date().toISOString()
      };
      // Ensure admin exists in DB for stats
      if (!users.find(u => u.email === email)) {
        users.push(admin);
        saveUsers(users);
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
      return admin;
    }

    const user = users.find(u => u.email === email);
    
    if (user) {
      // Basic password check (In real app, hash this!)
      if (user.password !== password) {
        throw new Error("Invalid credentials");
      }
      if (user.isBanned) {
        throw new Error("ACCOUNT BANNED: Contact Administrator");
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (email: string, username: string, password?: string): User => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password: password || '123456', // Default for legacy
      username,
      role: UserRole.USER,
      isBanned: false,
      highScore: 0,
      coins: 0,
      selectedCharacterId: 'mofonguero', // Default
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  updateCharacter: (userId: string, characterId: string) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].selectedCharacterId = characterId;
      saveUsers(users);
      
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.selectedCharacterId = characterId;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }
  }
};

export const StatsService = {
  getAllUsers: () => getUsers(),
  updateScore: (userId: string, score: number, coins: number) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      if (score > users[idx].highScore) {
        users[idx].highScore = score;
      }
      users[idx].coins += coins;
      saveUsers(users);
      // Update session if it's the current user
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.highScore = Math.max(currentUser.highScore, score);
        currentUser.coins += coins;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }
  },
  toggleBan: (userId: string) => {
     const users = getUsers();
     const user = users.find(u => u.id === userId);
     if (user && user.role !== UserRole.ADMIN) {
        user.isBanned = !user.isBanned;
        saveUsers(users);
     }
  },
  deleteUser: (userId: string) => {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
  }
};
