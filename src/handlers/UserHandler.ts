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

    async listAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.listAllUsers()
            res.status(result.statusCode).json({
                success: result.success,
                users: result.success ? result.data?.users : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in listAllUsers: ${error}` 
            });
        }
    }
}

export function createUserHandler(): UserHandler {
    const userService = createUserService();
    return new UserHandlerImpl(userService);
}