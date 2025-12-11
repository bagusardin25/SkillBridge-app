import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail, generateToken } from "../services/email.js";
import {
  generateState,
  getGoogleAuthUrl,
  getGoogleTokens,
  getGoogleUserInfo,
  getGitHubAuthUrl,
  getGitHubToken,
  getGitHubUserInfo,
  type OAuthUserInfo,
} from "../services/oauth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

function generateJwtToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors
      });
    }

    const { email, password, name } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: true, // Skip email verification for now
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        createdAt: true,
      },
    });

    const token = generateJwtToken(user.id, user.email);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateJwtToken(user.id, user.email);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// GET /api/auth/me - Get current user (protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        subscriptionEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

// GET /api/auth/verify-email/:token - Verify email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyExpires: null,
      },
    });

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const validation = resendVerificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors
      });
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: "If your email is registered, you will receive a verification link." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const verifyToken = generateToken();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyExpires },
    });

    await sendVerificationEmail(email, verifyToken);

    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors
      });
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: "If your email is registered, you will receive a password reset link." });
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "If your email is registered, you will receive a password reset link." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors
      });
    }

    const { token, password } = validation.data;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    res.json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Store OAuth states temporarily (in production, use Redis or database)
const oauthStates = new Map<string, { provider: string; createdAt: number }>();

// Clean up old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates) {
    if (now - data.createdAt > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(state);
    }
  }
}, 10 * 60 * 1000);

// Helper function to find or create OAuth user
async function findOrCreateOAuthUser(userInfo: OAuthUserInfo) {
  // First, try to find by provider and providerId
  let user = await prisma.user.findFirst({
    where: {
      provider: userInfo.provider,
      providerId: userInfo.id,
    },
  });

  if (user) {
    // Update user info if changed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: userInfo.name || user.name,
        avatarUrl: userInfo.avatarUrl || user.avatarUrl,
      },
    });
    return user;
  }

  // Check if email already exists with different provider
  const existingUser = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (existingUser) {
    // Link OAuth to existing account
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        provider: userInfo.provider,
        providerId: userInfo.id,
        avatarUrl: userInfo.avatarUrl || existingUser.avatarUrl,
        isVerified: true,
      },
    });
    return user;
  }

  // Create new user
  user = await prisma.user.create({
    data: {
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      provider: userInfo.provider,
      providerId: userInfo.id,
      isVerified: true,
    },
  });

  return user;
}

// GET /api/auth/google - Redirect to Google OAuth
router.get("/google", (req, res) => {
  try {
    const state = generateState();
    oauthStates.set(state, { provider: "google", createdAt: Date.now() });
    
    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth redirect error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// GET /api/auth/google/callback - Handle Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("Google OAuth error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_request`);
    }

    // Verify state
    const storedState = oauthStates.get(state as string);
    if (!storedState || storedState.provider !== "google") {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
    }
    oauthStates.delete(state as string);

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code as string);
    
    // Get user info
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    
    // Find or create user
    const user = await findOrCreateOAuthUser(userInfo);
    
    // Generate JWT
    const token = generateJwtToken(user.id, user.email);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// GET /api/auth/github - Redirect to GitHub OAuth
router.get("/github", (req, res) => {
  try {
    const state = generateState();
    oauthStates.set(state, { provider: "github", createdAt: Date.now() });
    
    const authUrl = getGitHubAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error("GitHub OAuth redirect error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// GET /api/auth/github/callback - Handle GitHub OAuth callback
router.get("/github/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("GitHub OAuth error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_request`);
    }

    // Verify state
    const storedState = oauthStates.get(state as string);
    if (!storedState || storedState.provider !== "github") {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
    }
    oauthStates.delete(state as string);

    // Exchange code for token
    const accessToken = await getGitHubToken(code as string);
    
    // Get user info
    const userInfo = await getGitHubUserInfo(accessToken);
    
    // Find or create user
    const user = await findOrCreateOAuthUser(userInfo);
    
    // Generate JWT
    const token = generateJwtToken(user.id, user.email);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

export default router;
