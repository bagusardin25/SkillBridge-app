import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// Mock prisma
vi.mock("../lib/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

// Import after mocking
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = "test-secret";

function createMockReq(authHeader?: string): Partial<Request> {
    return {
        headers: {
            authorization: authHeader,
        } as any,
    };
}

function createMockRes(): Partial<Response> {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe("authMiddleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = JWT_SECRET;
    });

    it("should return 401 if no Authorization header", async () => {
        const req = createMockReq();
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if Authorization header does not start with Bearer", async () => {
        const req = createMockReq("Basic some-token");
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    });

    it("should return 401 for invalid token", async () => {
        const req = createMockReq("Bearer invalid-token-here");
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    });

    it("should return 401 for expired token", async () => {
        // Create an already-expired token by backdating iat
        const token = jwt.sign(
            { userId: "user-1", email: "test@test.com", iat: Math.floor(Date.now() / 1000) - 3600 },
            JWT_SECRET,
            { expiresIn: "1s" }
        );

        const req = createMockReq(`Bearer ${token}`);
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        // jsonwebtoken v9 treats this as JsonWebTokenError
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringMatching(/Invalid token|Token expired/) })
        );
    });

    it("should return 401 if user not found in database", async () => {
        const token = jwt.sign(
            { userId: "nonexistent-user", email: "test@test.com" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        (prisma.user.findUnique as any).mockResolvedValue(null);

        const req = createMockReq(`Bearer ${token}`);
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should set req.user and call next() for valid token", async () => {
        const mockUser = {
            id: "user-1",
            email: "test@test.com",
            name: "Test User",
            role: "USER",
            tier: "FREE",
        };

        const token = jwt.sign(
            { userId: "user-1", email: "test@test.com" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const req = createMockReq(`Bearer ${token}`);
        const res = createMockRes();
        const next = vi.fn();

        await authMiddleware(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalled();
        expect((req as any).user).toEqual(mockUser);
    });
});
