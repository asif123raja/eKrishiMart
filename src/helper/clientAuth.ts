// helper/clientAuth.ts
import jwt from 'jsonwebtoken';

export const getClientAuthData = (): { userId?: string, token?: string } => {
    try {
        // Get token from cookies
        const token = document.cookie.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        
        if (!token) return {};

        // Decode without verification (since we don't have SECRET on client)
        const decoded = jwt.decode(token) as { id?: string };
        return {
            userId: decoded?.id,
            token
        };
    } catch (error) {
        console.error("Client auth error:", error);
        return {};
    }
};