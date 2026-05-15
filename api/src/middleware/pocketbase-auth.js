import pocketbaseClient from '../utils/pocketbaseClient.js';

export const pocketbaseAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Fallback for internal localhost calls
        const remoteAddress = req.socket.remoteAddress;
        if (remoteAddress === '::1' || remoteAddress === '127.0.0.1') {
            return next();
        }
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // 1. Manually set the token in the store
        pocketbaseClient.authStore.save(token, null);

        // 2. IMPORTANT: Verify the token is actually valid by calling the 'authRefresh' 
        // or checking the authStore specifically. 
        if (pocketbaseClient.authStore.isValid) {
            // In some versions, the model might not be hydrated yet.
            // Let's try to get the ID from the JWT payload directly if model is missing
            const payload = JSON.parse(atob(token.split('.')[1]));
            req.pocketbaseUserId = pocketbaseClient.authStore.model?.id || payload.id;
            
            return next();
        } else {
            return res.status(401).json({ error: 'Token is expired or invalid' });
        }
    } catch (error) {
        console.error('Middleware Auth Error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};