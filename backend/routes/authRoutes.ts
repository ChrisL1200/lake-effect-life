import { Router, Request, Response } from 'express';
import { registerUser, authenticateUser, confirmUser } from '../service/authService';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const data = await registerUser(email, password);
        res.status(201).json({ message: 'User registered', data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Confirm Registration
router.post('/confirm', async (req: Request, res: Response) => {
    const { email, code } = req.body;
    try {
        await confirmUser(email, code);
        res.status(200).json({ message: 'User confirmed' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const authData = await authenticateUser(email, password);
        res.status(200).json({ message: 'Authenticated', data: authData.AuthenticationResult });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

