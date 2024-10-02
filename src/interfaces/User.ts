import { APIResponse } from './APIResponse';
import { Request, Response } from "express";

export interface UserHandler {
    createUser(req: Request, res: Response): Promise<void>;
    listAllUsers(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    activateUser(req: Request, res: Response): Promise<void> 
    deactivateUser(req: Request, res: Response): Promise<void> 
}

export interface UserService {
    createUser(user: User): Promise<APIResponse>;
    listAllUsers(): Promise<APIResponse>;
    authenticate(email: string, password: string): Promise<APIResponse>;
    updateUserStatus(id: string, status: boolean): Promise<APIResponse> 
}

export interface UserRepository {
    createUser(user: User): Promise<void>;
    getUserById(id: string): Promise<User | null>
    getUserByEmail(email: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    changeUserStatus(id: string, status: boolean): Promise<void>
}

export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
    bio?: string;
    is_active?: boolean;
    profile_picture?: Uint8Array;
    created_at?: Date;
    updated_at?: Date;
  }