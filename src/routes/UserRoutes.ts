import express from 'express';
import multer from 'multer';
import { createUserHandler } from '../handlers/UserHandler';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const userHandler = createUserHandler();

const router = express.Router();

router.post('/signup', upload.single('file'), (req, res) => userHandler.createUser(req, res));
router.get('/list', (req, res) => userHandler.listAllUsers(req, res));

export default router;