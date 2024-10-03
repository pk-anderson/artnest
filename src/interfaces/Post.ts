import { APIResponse } from "./APIResponse";
import { Request, Response } from "express";

export type VisibilityStatus = 'public' | 'private' | 'friends-only';

export interface PostHandler {
    createPost(req: Request, res: Response): Promise<void>
}

export interface PostService {
    createPost(post: Post): Promise<APIResponse>
}

export interface PostRepository {
    createPost(post: Post): Promise<Post | null>
    getPostById(id: string): Promise<Post | null>
    getUserPosts(id: string, limit: number, offset: number, visibility?: string): Promise<Post[]>
    countUserPosts(id: string, visibility?: string): Promise<number>
    updatePost(id: string, description: string): Promise<Post | null> 
    updatePostVisibility(id: string, visibility: string): Promise<Post | null>
    deletePost(id: string): Promise<void> 
}

export interface Post {
    id: string;
    user_id: string;
    image: Uint8Array;
    description?: string;
    visibility_status: 'public' | 'private' | 'friends_only';
    likes_count?: number;
    comments_count?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
