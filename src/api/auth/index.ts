import express from 'express';
import { signUp } from './signup';
import { signIn } from './signin';
import { signout } from './signout';
import { googleAuth } from './google';
import { verifyToken } from './verify';

const router = express.Router();

// Auth routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signout);
router.post('/google', googleAuth);
router.get('/verify', verifyToken);

export default router;