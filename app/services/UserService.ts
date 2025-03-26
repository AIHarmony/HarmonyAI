import { getMockHaiBalance } from '../utils/blockchain';

// User roles
export enum UserRole {
  USER = 'user',
  RESEARCHER = 'researcher',
  ADMIN = 'admin'
}

// User information
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
  reputation: number;
  profileImage?: string;
  bio?: string;
}

// User statistics
export interface UserStats {
  surveysCreated: number;
  surveysParticipated: number;
  totalEarned: number;
  reputation: number;
  haiBalance: number;
}

// User authentication information
interface AuthInfo {
  userId: string;
  passwordHash: string; // In a real application, this should be stored as a hash
}

// Mock database
class MockUserDatabase {
  private users: Map<string, User> = new Map();
  private authInfos: Map<string, AuthInfo> = new Map();
  private emailToId: Map<string, string> = new Map();
  private walletToId: Map<string, string> = new Map();
  
  // Register user
  saveUser(user: User, password: string): void {
    this.users.set(user.id, user);
    this.emailToId.set(user.email.toLowerCase(), user.id);
    
    if (user.walletAddress) {
      this.walletToId.set(user.walletAddress.toLowerCase(), user.id);
    }
    
    // Store authentication info (in a real application, password should be hashed)
    this.authInfos.set(user.id, {
      userId: user.id,
      passwordHash: password
    });
  }
  
  // Get user
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }
  
  // Get user by email
  getUserByEmail(email: string): User | undefined {
    const id = this.emailToId.get(email.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }
  
  // Get user by wallet address
  getUserByWallet(walletAddress: string): User | undefined {
    const id = this.walletToId.get(walletAddress.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }
  
  // Verify password
  verifyPassword(userId: string, password: string): boolean {
    const authInfo = this.authInfos.get(userId);
    return authInfo ? authInfo.passwordHash === password : false;
  }
  
  // Update user information
  updateUser(user: User): void {
    // If wallet address changes, update mapping
    const existingUser = this.users.get(user.id);
    if (existingUser && existingUser.walletAddress !== user.walletAddress) {
      if (existingUser.walletAddress) {
        this.walletToId.delete(existingUser.walletAddress.toLowerCase());
      }
      if (user.walletAddress) {
        this.walletToId.set(user.walletAddress.toLowerCase(), user.id);
      }
    }
    
    this.users.set(user.id, user);
  }
}

// User service class
export class UserService {
  private db = new MockUserDatabase();
  
  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  constructor() {
    // Create some mock users
    this.initializeMockUsers();
  }
  
  // Initialize mock users
  private initializeMockUsers(): void {
    // Create a regular user
    const normalUser: User = {
      id: this.generateId(),
      username: 'John Doe',
      email: 'user@example.com',
      walletAddress: '5Uj9m2CtGvR1X3KX6CPbGTmZRmnYYrH9yQ9jy7tRGLiJ',
      role: UserRole.USER,
      createdAt: new Date(),
      reputation: 75
    };
    
    // Create a researcher user
    const researcherUser: User = {
      id: this.generateId(),
      username: 'Dr. Smith',
      email: 'researcher@example.com',
      walletAddress: '7BZMAXPgPtBbPNuQjx4HLMJcnxq4JLhgmf4x4xG3X5Z2',
      role: UserRole.RESEARCHER,
      createdAt: new Date(),
      reputation: 150,
      bio: 'Focused on blockchain and user experience research'
    };
    
    // Save mock users
    this.db.saveUser(normalUser, 'password123');
    this.db.saveUser(researcherUser, 'secure456');
  }
  
  // Register new user
  register(data: {
    username: string;
    email: string;
    password: string;
    walletAddress?: string;
  }): User {
    // Check if email is already in use
    if (this.db.getUserByEmail(data.email)) {
      throw new Error('Email address is already registered');
    }
    
    // Check if wallet address is already bound
    if (data.walletAddress && this.db.getUserByWallet(data.walletAddress)) {
      throw new Error('Wallet address is already bound to another account');
    }
    
    // Create new user
    const user: User = {
      id: this.generateId(),
      username: data.username,
      email: data.email,
      walletAddress: data.walletAddress || '',
      role: UserRole.USER, // Default is regular user
      createdAt: new Date(),
      reputation: 0, // Initial reputation is 0
    };
    
    // Save user
    this.db.saveUser(user, data.password);
    
    return user;
  }
  
  // User login
  login(email: string, password: string): User {
    const user = this.db.getUserByEmail(email);
    
    if (!user) {
      throw new Error('User does not exist');
    }
    
    if (!this.db.verifyPassword(user.id, password)) {
      throw new Error('Incorrect password');
    }
    
    return user;
  }
  
  // Get user information
  getUser(id: string): User | undefined {
    return this.db.getUser(id);
  }
  
  // Update user information
  updateUser(id: string, data: Partial<User>): User {
    const user = this.db.getUser(id);
    
    if (!user) {
      throw new Error('User does not exist');
    }
    
    // Do not allow changing ID and creation time
    const updatedUser: User = {
      ...user,
      ...data,
      id: user.id,
      createdAt: user.createdAt,
    };
    
    this.db.updateUser(updatedUser);
    
    return updatedUser;
  }
  
  // Connect wallet address
  connectWallet(userId: string, walletAddress: string): User {
    // Check if wallet address is already bound
    if (this.db.getUserByWallet(walletAddress)) {
      throw new Error('Wallet address is already bound to another account');
    }
    
    return this.updateUser(userId, { walletAddress });
  }
  
  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    const user = this.db.getUser(userId);
    
    if (!user) {
      throw new Error('User does not exist');
    }
    
    // Get HAI balance (mock)
    const haiBalance = await getMockHaiBalance(user.walletAddress);
    
    // Mock statistics data (in a real application, would query from database)
    return {
      surveysCreated: Math.floor(Math.random() * 10),
      surveysParticipated: Math.floor(Math.random() * 20),
      totalEarned: Math.floor(Math.random() * 1000),
      reputation: user.reputation,
      haiBalance
    };
  }
  
  // Update user reputation
  updateReputation(userId: string, change: number): User {
    const user = this.db.getUser(userId);
    
    if (!user) {
      throw new Error('User does not exist');
    }
    
    // Update reputation (not allowed to go below 0)
    const newReputation = Math.max(0, user.reputation + change);
    
    return this.updateUser(userId, { reputation: newReputation });
  }
}

// Create singleton instance
export const userService = new UserService();
