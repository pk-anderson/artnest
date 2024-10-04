import { APIResponse } from "../interfaces/APIResponse";
import { createPostRepository } from "../repositories/PostRepository";
import { Post, PostService, PostRepository, VisibilityStatus } from "../interfaces/Post";
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

    async findPost(id: string): Promise<APIResponse> {
        try {
            const result = await this.postRepository.getPostById(id)

            if (!result) {
                return {
                    success: false, 
                    data: {
                        error: `Post not found.`
                    },
                    statusCode: 404
                }
            }

            return {
                success: true, 
                data: {
                    post: result
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error finding post on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }

    async listPosts(id: string, limit: number, page: number, visibility?: VisibilityStatus): Promise<APIResponse> {
        try {
            const offset = (page - 1) * limit
            const result = await this.postRepository.getUserPosts(id, limit, offset, visibility)

            const totalPosts = await this.postRepository.countUserPosts(id, visibility)

            return {
                success: true, 
                data: {
                    posts: result,
                    pagination: {
                        page,     
                        limit,      
                        totalResults: totalPosts 
                    }
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error listing posts on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }

    async updatePost(id: string, description: string): Promise<APIResponse> {
        try {
            if (!id || !description) {
                return {
                    success: false, 
                    data: {
                        error: `All fields are required.`
                    },
                    statusCode: 400
                }
            }

            const post = await this.postRepository.getPostById(id)
            if (!post) {
                return {
                    success: false, 
                    data: {
                        error: `Post not found.`
                    },
                    statusCode: 404
                }
            }

            const result = await this.postRepository.updatePost(id, description)
            return {
                success: true, 
                data: {
                    post: result
                },
                statusCode: 200
            }

        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error updating post on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }

    async changeVisibility(id: string, visibility: VisibilityStatus): Promise<APIResponse> {
        try {
            const post = await this.postRepository.getPostById(id)
            if (!post) {
                return {
                    success: false, 
                    data: {
                        error: `Post not found.`
                    },
                    statusCode: 404
                }
            }

            if (visibility == post.visibility_status) {
                return {
                    success: false, 
                    data: {
                        error: `Post visibility is already ${visibility}.`
                    },
                    statusCode: 400
                }
            }

            const result = await this.postRepository.updatePostVisibility(id, visibility)
            return {
                success: true, 
                data: {
                    post: result
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error updating post visibility on service layer: ${error}`
                },
                statusCode: 500
            }
        }
    }

    async removePost(id: string): Promise<APIResponse> {
        try {
            const post = await this.postRepository.getPostById(id)
            if (!post) {
                return {
                    success: false, 
                    data: {
                        error: `Post not found.`
                    },
                    statusCode: 404
                }
            }

            await this.postRepository.deletePost(id)
            return {
                success: true,
                data: {
                    message: `Post removed successfully.`
                },
                statusCode: 200
            }
        } catch (error) {
            return {
                success: false,
                data: {
                    error: `Error removing post on service layer: ${error}`
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