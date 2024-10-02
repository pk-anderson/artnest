import { APIResponse } from './../interfaces/APIResponse';
import { createUserRepository } from "../repositories/UserRepository";
import { User, UserService, UserRepository } from "../interfaces/User";
import { encryptPassword, checkPassword } from '../utils/password';
import { generateUUID } from '../utils/generateUUID';
import jwt from 'jsonwebtoken';

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

    async authenticate(email: string, password: string): Promise<APIResponse> {
    try {
        if (!email || !password) {
            return {
                success: false, 
                data: {
                    error: `Email and Password are required.`
                },
                statusCode: 400
            }
        }
    
        const user = await this.userRepository.getUserByEmail(email);
        if (!user || !user.is_active) {
            return {
                success: false, 
                data: {
                    error: `User with this email not found.`
                },
                statusCode: 404
            }
        }
    
        const isPasswordValid = await checkPassword(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false, 
                data: {
                    error: `Invalid credentials.`
                },
                statusCode: 401
            }
        }
        
        const token = jwt.sign(
          { id: user.id, name: user.username, email: user.email },
          process.env.JWT_SECRET as string, 
          { expiresIn: '24h' }
        );
    
        const { password: passwordHash, ...userWithoutPassword } = user

        return {
            success: true, 
            data: {
                token: token,
                user: userWithoutPassword
            },
            statusCode: 200
        }
    } catch (error) {
        return {
            success: false,
            data: {
                error: `Error authenticating user on service layer: ${error}`
            },
            statusCode: 500
        }
    }
  }

  async findUser(id:string): Promise<APIResponse> {
      try {
          const user = await this.userRepository.getUserById(id)
          if (!user || !user.is_active) {
            return {
                success: false,
                data: {
                    error: `User not found.`
                },
                statusCode: 404
            }
          }

          return {
            success: true, 
            data: {
                user: user
            },
            statusCode: 200
        }
      } catch (error) {
        return {
            success: false,
            data: {
                error: `Error finding user on service layer: ${error}`
            },
            statusCode: 500
        }
      }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<APIResponse> {
    try {
        const user = await this.userRepository.getUserById(id);
        if (!user || !user.is_active) {
            return {
                success: false,
                data: {
                    error: `User not found`
                },
                statusCode: 404
            };
        }

        const updatedUser = await this.userRepository.updateUser(id, updates)

        if (!updatedUser) {
            return {
                success: false,
                data: {
                    error: `No changes were made.`
                },
                statusCode: 400  
            };
        }
        
        const { password, ...userWithoutPassword } = updatedUser;

        return {
            success: true,
            data: {
                user: userWithoutPassword
            },
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            data: {
                error: `Error updating user: ${error}`
            },
            statusCode: 500
        };
    }
}

    async changePassword(email: string, password: string, newPassword: string): Promise<APIResponse> {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user || !user.is_active) {
                return {
                    success: false,
                    data: {
                        error: `User not found`
                    },
                    statusCode: 404
                };
            }
            
            const check = await checkPassword(password, user.password)
            if (!check) {
                return {
                    success: false,
                    data: {
                        error: `Invalid credentials`
                    },
                    statusCode: 403
                };
            }
    
            if (!newPassword) {
                return {
                    success: false,
                    data: {
                        error: `New password is required.`
                    },
                    statusCode: 400
                };
            }
    
            const hashedPassword = await encryptPassword(newPassword) 
            await this.userRepository.updatePassword(user.id, hashedPassword) 
            return {
                success: true,
                data: {
                    message: 'Password updated successfully'
                },
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error updating password: ${error}`
                },
                statusCode: 500
            };
        }
    }

  async updateUserStatus(id: string, status: boolean): Promise<APIResponse> {
    try {
            const user = await this.userRepository.getUserById(id)
            if (!user) {
                return {
                    success: false,
                    data: {
                        error: 'User not found'
                    },
                    statusCode: 404
                }
            }
            if (user.is_active == status) {
                return {
                    success: false,
                    data: {
                        error: status ? 'User is already active' : 'User is already deactivated'
                    },
                    statusCode: 400
                }
            }
            await this.userRepository.changeUserStatus(id, status)
            return {
                success: true,
                data: {
                    message: status ? 'User activated successfully' : 'User deactivated successfully'
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error updating user status on service layer: ${error}`
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