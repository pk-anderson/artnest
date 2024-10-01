import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/UserRoutes';

export function init() {
    const app = express()
    app.use(cors())
    app.use(express.json())

    app.use('/users', userRoutes);

    return app
}

