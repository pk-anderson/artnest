import { APIResponse } from './../interfaces/APIResponse';
import { createUserRepository } from "../repositories/UserRepository";
import { User, UserService, UserRepository } from "../interfaces/User";
import { encryptPassword } from '../utils/password';
import { generateUUID } from '../utils/generateUUID';

function validateUserData(user: User): { valid: boolean, errors: string[] } {
    const errors: string[] = [];

    if (!user.id) errors.push('ID is required');
    if (!user.email) errors.push('Email is required');
    if (!user.password) errors.push('Password is required');
    if (!user.username) errors.push('Username is required');

    return {
        valid: errors.length === 0,
        errors: errors
    };
}


export class UserServiceImpl implements UserService {

    private userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async createUser(user: User): Promise<APIResponse> {
        try {
            user.id = generateUUID()
            const validations = validateUserData(user)

            if (!validations.valid) {
                return {
                    success: false, 
                    data: {
                        error: `${validations.errors.join(', ')}`
                    },
                    statusCode: 400
                }
            }

            const exists = await this.userRepository.getUserByEmail(user.email)
            if (exists) {
                return {
                    success: false, 
                    data: {
                        error: `User with this email already exists`
                    },
                    statusCode: 400
                }
            }

            user.password = await encryptPassword(user.password)

            await this.userRepository.createUser(user)
            return {
                success: true,
                data: {
                    message: "Success on creating new user"
                },
                statusCode: 201
            }

        } catch (error) {
            console.error('Error in UserService while creating user:', error);
            return {
                success: false,
                data: {
                    error: `Error creating user on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }

    async listAllUsers(): Promise<APIResponse> {
        try {
            const users = await this.userRepository.getAllUsers()
            return {
                success: true,
                data: {
                    users
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error listing users on service layer: ${error}`
                },
                statusCode: 500
            }
        }     
    }
}

export function createUserService(): UserService {
    const userRepository = createUserRepository();
    return new UserServiceImpl(userRepository);
}