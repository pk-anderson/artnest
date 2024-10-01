export interface APIResponse<T = any> {
    success: boolean;
    data?: T; 
    statusCode: number;
}
