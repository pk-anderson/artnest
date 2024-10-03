import { Post, PostRepository } from "../interfaces/Post";
import { pool } from '../index';

export class PostRepositoryImpl implements PostRepository {

    async createPost(post: Post): Promise<Post | null> {
        try {
            const insertPostQuery =
            `INSERT INTO tb_posts (
                id,
                user_id, 
                image,
                description
                ) 
                VALUES ($1, $2, $3, $4)
                RETURNING *;`;

            const insertPostValues = [
                post.id,
                post.user_id,
                post.image,
                post.description
            ]

            const result = await pool.query(insertPostQuery, insertPostValues);
            return result.rows[0] as Post
        } catch (error) {
            console.error(`Error on createPost: ${error}`)
            throw new Error(`Error inserting post into the database.`);
        }
    }

}

export function createPostRepository(): PostRepository {
    return new PostRepositoryImpl();
}