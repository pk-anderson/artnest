import bcrypt from 'bcryptjs';

export async function encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
} 

export async function checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
}