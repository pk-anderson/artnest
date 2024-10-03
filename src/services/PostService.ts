import { APIResponse } from "../interfaces/APIResponse";
import { createPostRepository } from "../repositories/PostRepository";
import { Post, PostService, PostRepository } from "../interfaces/Post";
import { generateUUID } from "../utils/generateUUID";

export class PostServiceImpl implements PostService {
    private postRepository: PostRepository

    constructor(postRepository: PostRepository) {
        this.postRepository = postRepository;
    }

    async createPost(post: Post): Promise<APIResponse> {
        try {
            if (!post.image) {
                return {
                    success: false, 
                    data: {
                        error: `Post image is required.`
                    },
                    statusCode: 400
                }
            }

            post.id = generateUUID()

            const result = await this.postRepository.createPost(post)
            return {
                success: true,
                data: {
                    post: result
                },
                statusCode: 201
            }
        } catch (error) {
            console.error('Error in PostService while creating post:', error);
            return {
                success: false,
                data: {
                    error: `Error creating post on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }
}


export function createPostService(): PostService {
    const postRepository = createPostRepository();
    return new PostServiceImpl(postRepository);
}