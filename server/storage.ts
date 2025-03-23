import { users, type User, type InsertUser, type Resume, type InsertResume } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { v4 as uuidv4 } from "uuid";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume methods
  getResumes(userId: number): Promise<Resume[]>;
  getResume(id: string): Promise<Resume | undefined>;
  createResume(userId: number, resume: InsertResume): Promise<Resume>;
  updateResume(id: string, resume: Partial<Resume>): Promise<Resume | undefined>;
  deleteResume(id: string): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<string, Resume>;
  public sessionStore: session.SessionStore;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getResumes(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      resume => resume.userId === userId
    );
  }

  async getResume(id: string): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createResume(userId: number, resumeData: InsertResume): Promise<Resume> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const resume: Resume = {
      ...resumeData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: string, updateData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    
    if (!resume) {
      return undefined;
    }
    
    const updatedResume: Resume = {
      ...resume,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: string): Promise<boolean> {
    return this.resumes.delete(id);
  }
}

export const storage = new MemStorage();
