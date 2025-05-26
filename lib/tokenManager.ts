import { redis } from "./redis";
import { sign, verify } from "jsonwebtoken";

export const TokenManager = {
    generateToken: (payload: any, expiresIn: string = "1h") => {
        return sign(payload, process.env.JWT_SECRET!, { expiresIn });
    },

    verifyToken: async (token: string) => {
        // Check cache first
        const cacheKey = `token:${token}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return JSON.parse(cached);
        }

        // Verify and cache if not in cache
        const decoded = verify(token, process.env.JWT_SECRET!);
        await redis.setex(cacheKey, 300, JSON.stringify(decoded)); // Cache for 5 minutes
        
        return decoded;
    },

    invalidateToken: async (token: string) => {
        const cacheKey = `token:${token}`;
        await redis.del(cacheKey);
    },

    checkRateLimit: async (identifier: string) => {
        const rateLimitKey = `rate_limit:${identifier}`;
        const current = await redis.incr(rateLimitKey);
        
        if (current === 1) {
            await redis.expire(rateLimitKey, 60);
        }
        
        return current;
    }
};