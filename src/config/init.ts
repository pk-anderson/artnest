import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/UserRoutes';
import postRoutes from '../routes/PostRoutes'

export function init() {
    const app = express()
    app.use(cors())
    app.use(express.json())

    app.use('/users', userRoutes);
    app.use('/posts', postRoutes)

    return app
}

