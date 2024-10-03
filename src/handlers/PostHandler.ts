import { Request, Response } from 'express';
import { createPostService } from "../services/PostService";
import { Post, PostHandler, PostService } from '../interfaces/Post';

export class PostHandlerImpl implements PostHandler {
    private postService: PostService

    constructor(postService: PostService) {
        this.postService = postService
    }

    async createPost(req: Request, res: Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken  
            const post: Post = req.body
            post.user_id = decodedToken!.id

            const image = req.file;
            if (image) {
            post.image = image.buffer
            }

            const result = await this.postService.createPost(post)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.post : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in createPost: ${error}` 
            });
        }
    }
}

export function createPostHandler(): PostHandler {
    const postService = createPostService();
    return new PostHandlerImpl(postService);
}