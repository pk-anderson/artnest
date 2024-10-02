import { Request, Response } from 'express';
import { createUserService } from "../services/UserService";
import { User, UserHandler, UserService } from '../interfaces/User';

export class UserHandlerImpl implements UserHandler {
    private userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user: User = req.body
            const profilePicture = req.file;
            if (profilePicture) {
            user.profile_picture = profilePicture.buffer
            }

            const result = await this.userService.createUser(user)
            res.status(result.statusCode).json({
                success: result.success,
                message: result.success ? result.data?.message : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in createUser: ${error}` 
            });
        }
    }

    async findUser(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const result = await this.userService.findUser(id)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.user : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in findUser: ${error}` 
            });
        }
    }

    async listAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.listAllUsers()
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.users : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in listAllUsers: ${error}` 
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const result = await this.userService.authenticate(email, password)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in login: ${error}` 
            });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken  
            const user: User = req.body
            const profilePicture = req.file;
            if (profilePicture) {
            user.profile_picture = profilePicture.buffer
            }

            const result = await this.userService.updateUser(decodedToken!.id, user)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.user : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in updateUser: ${error}` 
            });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken
            const { password , newPassword } = req.body
            const result = await this.userService.changePassword(decodedToken!.email, password, newPassword) 
            res.status(result.statusCode).json({
                success: result.success,
                message: result.success ? result.data?.message : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in changePassword: ${error}` 
            });
        }
    }

    async activateUser(req: Request, res: Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken         
            const result = await this.userService.updateUserStatus(decodedToken!.id, true)
            res.status(result.statusCode).json({
                success: result.success,
                message: result.success ? result.data?.message : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in activateUser: ${error}` 
            });
        }
    }

    async deactivateUser(req: Request, res: Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken         
            const result = await this.userService.updateUserStatus(decodedToken!.id, false)
            res.status(result.statusCode).json({
                success: result.success,
                message: result.success ? result.data?.message : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in activateUser: ${error}` 
            });
        }
    }
}

export function createUserHandler(): UserHandler {
    const userService = createUserService();
    return new UserHandlerImpl(userService);
}