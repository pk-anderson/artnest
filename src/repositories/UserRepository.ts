import { User, UserRepository } from "../interfaces/User";
import { pool } from '../index';

export class UserRepositoryImpl implements UserRepository {

    async createUser(user: User): Promise<void>{
        try {
          const insertUserQuery =
            `INSERT INTO tb_users (
                id,
                email, 
                password,
                username,
                bio,
                profile_picture
                ) 
                VALUES ($1, $2, $3, $4, $5, $6)`;
    
          const insertUserValues = [
              user.id, 
              user.email,
              user.password, 
              user.username, 
              user.bio, 
              user.profile_picture];
    
          await pool.query(insertUserQuery, insertUserValues);
        } catch (error) {
            console.error(`Error on createUser: ${error}`)
            throw new Error(`Error inserting user into the database.`);
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            const getUserQuery = `Select * FROM tb_users WHERE id = $1` 
            const values = [id]
            const result = await pool.query(getUserQuery, values)

            if (result.rows.length > 0) {
                return result.rows[0] as User
            }

            return null
        } catch (error) {
            console.error(`Error on getUserById: ${error}`)
            throw new Error(`Error retrieving user from the database.`)
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const getUserQuery = `Select * FROM tb_users WHERE email = $1` 
            const values = [email]
            const result = await pool.query(getUserQuery, values)

            if (result.rows.length > 0) {
                return result.rows[0] as User
            }

            return null
        } catch (error) {
            console.error(`Error on getUserByEmail: ${error}`)
            throw new Error(`Error retrieving user from the database.`)
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const getAllUsersQuery = `
            SELECT 
                id,
                email,
                username,
                bio,
                is_active,
                profile_picture,
                created_at,
                updated_at
            FROM tb_users WHERE is_active = true`
            
            const result = await pool.query(getAllUsersQuery)

            return result.rows as User[];
        } catch (error) {
            console.error(`Error on getAllUsers: ${error}`)
            throw new Error(`Error retrieving users from the database.`)
        }
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
        try {
            const keys = Object.keys(updates); 
            const values = Object.values(updates); 
            
            if (keys.length === 0) {
                return null;
            }
    
            keys.push('updated_at');
            values.push(new Date()); 
            const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
            const query = `
                UPDATE tb_users
                SET ${setQuery}
                WHERE id = $${keys.length + 1}
                RETURNING *;
            `;
    
            const result = await pool.query(query, [...values, id]);
    
            if (result.rows.length > 0) {
                return result.rows[0]; 
            }
            return null;
            
        } catch (error) {
            console.error(`Error on updateUser: ${error}`);
            throw new Error(`Error updating user in the database.`);
        }
    }
    
    async updatePassword(id: string, password: string): Promise<void> {
        try {
            const updatePasswordQuery = `
                UPDATE tb_users
                SET password = $1
                WHERE id = $2;
            `;
            const values = [password, id]
            await pool.query(updatePasswordQuery, values)     
        } catch (error) {
            console.error(`Error on updatePassword: ${error}`);
            throw new Error(`Error updating password in the database.`);
        }
    }

    async changeUserStatus(id: string, status: boolean): Promise<void> {
        try {
            const changeUserStatusQuery = `
            UPDATE tb_users
            SET is_active = $1, updated_at = NOW()
            WHERE id = $2
            `
            const values = [status, id]
            await pool.query(changeUserStatusQuery, values)
        } catch (error) {
            console.error(`Error on changeUserStatus: ${error}`)
            throw new Error(`Error changing user status.`)
        }
    }
}

export function createUserRepository(): UserRepository {
    return new UserRepositoryImpl();
}