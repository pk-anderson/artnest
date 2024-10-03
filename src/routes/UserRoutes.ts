import express from 'express';
import multer from 'multer';
import { createUserHandler } from '../handlers/UserHandler';
import { validateToken } from '../middlewares/auth';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const userHandler = createUserHandler();

const router = express.Router();

router.post('/signup', upload.single('file'), (req, res) => userHandler.createUser(req, res));
router.post('/login', (req, res) => userHandler.login(req, res));
router.get('/find/:id', validateToken, (req, res) => userHandler.findUser(req, res));
router.get('/list', validateToken, (req, res) => userHandler.listUsers(req, res));
router.put('/update', validateToken, upload.single('file'), (req, res) => userHandler.updateUser(req, res));
router.put('/change-password', validateToken, (req, res) => userHandler.changePassword(req, res));
router.put('/activate', validateToken, (req, res) => userHandler.activateUser(req, res));
router.put('/deactivate', validateToken, (req, res) => userHandler.deactivateUser(req, res));

export default router;