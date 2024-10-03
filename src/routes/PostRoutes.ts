import express from 'express';
import multer from 'multer';
import { createPostHandler } from '../handlers/PostHandler';
import { validateToken } from '../middlewares/auth';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const postHandler = createPostHandler();

const router = express.Router();

router.post('/create', validateToken, upload.single('file'), (req, res) => postHandler.createPost(req, res));

export default router;