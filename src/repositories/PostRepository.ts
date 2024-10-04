import { Post, PostRepository } from "../interfaces/Post";
import { pool } from '../index';
import { VisibilityStatus } from "../interfaces/Post";

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

            const queryParams = [
                post.id,
                post.user_id,
                post.image,
                post.description
            ]

            const result = await pool.query(insertPostQuery, queryParams);
            return result.rows[0] as Post
        } catch (error) {
            console.error(`Error on createPost: ${error}`)
            throw new Error(`Error inserting post into the database.`);
        }
    }

    async getPostById(id: string): Promise<Post | null> {
        try {
            const getPostQuery = `Select * FROM tb_posts WHERE id = $1 AND deleted_at IS NULL` 
            const queryParams = [id]
            const result = await pool.query(getPostQuery, queryParams)

            if (result.rows.length > 0) {
                return result.rows[0] as Post
            }

            return null
        } catch (error) {
            console.error(`Error on getPostById: ${error}`)
            throw new Error(`Error retrieving post from the database.`)
        }
    }

    async getUserPosts(id: string, limit: number, offset: number, visibility?: VisibilityStatus): Promise<Post[]> {
        try {
            const queryParams: any[] = [];
            let getUserPostsQuery = `
                SELECT *
                FROM tb_posts
                WHERE user_id = $1
                  AND deleted_at IS NULL
            `;
    
            queryParams.push(id);
            if (visibility) {
                getUserPostsQuery += ` AND visibility_status = $2`;
                queryParams.push(visibility);
            }
    
            getUserPostsQuery += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
            queryParams.push(limit, offset);

            const result = await pool.query(getUserPostsQuery, queryParams);
    
            return result.rows as Post[];
        } catch (error) {
            console.error(`Error on getUserPosts: ${error}`);
            throw new Error(`Error retrieving posts from the database.`);
        }
    }
    
    async countUserPosts(id: string, visibility?: VisibilityStatus): Promise<number> {
        try {
            let countUserPostsQuery = `
                SELECT COUNT(*)
                FROM tb_posts
                WHERE user_id = $1
                  AND deleted_at IS NULL
            `;
    
            const queryParams = [id];
            if (visibility) {
                countUserPostsQuery += ` AND visibility_status = $2`;
                queryParams.push(visibility);
            }
    
            const result = await pool.query(countUserPostsQuery, queryParams);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error(`Error on countUserPosts: ${error}`);
            throw new Error(`Error counting posts from the database.`);
        }
    }
    
    async updatePost(id: string, description: string): Promise<Post | null> {
        try {
            const updatePostQuery = `
                UPDATE tb_posts
                SET description = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *;
            `;
            const queryParams = [description, id];

            const result = await pool.query(updatePostQuery, queryParams);
    
            return result.rows.length > 0 ? result.rows[0] as Post : null;
        } catch (error) {
            console.error(`Error on updatePost: ${error}`);
            throw new Error(`Error updating post on the database.`);
        }
    }

    async updatePostVisibility(id: string, visibility: VisibilityStatus): Promise<Post | null> {
        try {
            const updatePostVisibilityQuery = `
                UPDATE tb_posts
                SET visibility_status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *;
            `;
            const queryParams = [visibility, id];

            const result = await pool.query(updatePostVisibilityQuery, queryParams);
    
            return result.rows.length > 0 ? result.rows[0] as Post : null;
        } catch (error) {
            console.error(`Error on updatePostVisibility: ${error}`);
            throw new Error(`Error updating post visibility on the database.`);
        }
    }

    async deletePost(id: string): Promise<void> {
        try {
            const deletePostQuery = `
                UPDATE tb_posts
                SET deleted_at = NOW()
                WHERE id = $1;
            `;
            const queryParams = [id];

           await pool.query(deletePostQuery, queryParams);
        } catch (error) {
            console.error(`Error on deletePost: ${error}`);
            throw new Error(`Error deleting post on the database.`);
        }
    }
}

export function createPostRepository(): PostRepository {
    return new PostRepositoryImpl();
}