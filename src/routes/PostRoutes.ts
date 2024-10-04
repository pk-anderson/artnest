import express from 'express';
import multer from 'multer';
import { createPostHandler } from '../handlers/PostHandler';
import { validateToken } from '../middlewares/auth';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const postHandler = createPostHandler();

const router = express.Router();

router.post('/create', validateToken, upload.single('file'), (req, res) => postHandler.createPost(req, res));
router.get('/find/:id', validateToken, (req, res) => postHandler.findPost(req, res))
router.get('/list/:userId', validateToken, (req, res) => postHandler.listPosts(req, res))
router.put('/update/:id', validateToken, (req, res) => postHandler.updatePost(req, res))
router.put('/change-visibility/:id', validateToken, (req, res) => postHandler.changePostVisibility(req, res))
router.delete('/remove/:id', validateToken, (req, res) => postHandler.removePost(req, res))

export default router;