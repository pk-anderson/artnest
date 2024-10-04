import { VisibilityStatus } from './../interfaces/Post';
import { Request, Response } from 'express';
import { createPostService } from "../services/PostService";
import { Post, PostHandler, PostService } from '../interfaces/Post';

const visibilityOptions: VisibilityStatus[] = ['public', 'private', 'friends-only'];
function isValidVisibility(value: any): value is VisibilityStatus {
    return visibilityOptions.includes(value);
}

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

    async findPost(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const result = await this.postService.findPost(id)

            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.post : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in findPost: ${error}` 
            });
        }
    }

    async listPosts(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const visibility = req.query.visibility as string;  
   
            if (!visibility || !isValidVisibility(visibility)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid visibility value. Expected one of ${visibilityOptions.join(', ')}.`,
                })
                return
            }
    
            const visibilityStatus: VisibilityStatus = visibility; 
    
            const result = await this.postService.listPosts(userId, limit, page, visibilityStatus)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data : undefined,
                error: !result.success ? result.data?.error : undefined
            })
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in listPosts: ${error}` 
            })
        }
    }

    async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const decodedToken = req.decodedToken  
            const { description } = req.body

            const result = await this.postService.updatePost(id, decodedToken!.id, description)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.post : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in updatePost: ${error}` 
            });
        }
    }

    async changePostVisibility(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const decodedToken = req.decodedToken;
            const visibility = req.body.visibility as string;  
   
            if (!visibility || !isValidVisibility(visibility)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid visibility value. Expected one of ${visibilityOptions.join(', ')}.`,
                })
                return
            }
    
            const visibilityStatus: VisibilityStatus = visibility; 
    
            const result = await this.postService.changeVisibility(id, decodedToken!.id, visibilityStatus);
            
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.post : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in updatePost: ${error}` 
            });
        }
    }

    async removePost(req:Request, res:Response): Promise<void> {
        try {
            const decodedToken = req.decodedToken;
            const id = req.params.id;

            const result = await this.postService.removePost(id, decodedToken!.id)
            res.status(result.statusCode).json({
                success: result.success,
                data: result.success ? result.data?.message : undefined,
                error: !result.success ? result.data?.error : undefined
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: `Internal error on Handler in removePost: ${error}` 
            });
        }
    }
    
}

export function createPostHandler(): PostHandler {
    const postService = createPostService();
    return new PostHandlerImpl(postService);
}