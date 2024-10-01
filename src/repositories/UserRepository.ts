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
            FROM tb_users`
            
            const result = await pool.query(getAllUsersQuery)

            return result.rows as User[];
        } catch (error) {
            console.error(`Error on getAllUsers: ${error}`)
            throw new Error(`Error retrieving users from the database.`)
        }
    }
}

export function createUserRepository(): UserRepository {
    return new UserRepositoryImpl();
}