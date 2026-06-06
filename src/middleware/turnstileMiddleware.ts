import { Request, Response, NextFunction } from "express";
import axios from "axios";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.method === 'GET') {
      return next();
    }
    
    const token = req.body.turnstileToken || req.headers["x-turnstile-token"];

    if (process.env.TURNSTILE_SKIP_VERIFICATION === "true") {
      return next();
    }

    if (!token) {
      return res.status(400).json({
        error: "Turnstile token is required",
      });
    }

    if (!TURNSTILE_SECRET) {
      console.error("TURNSTILE_SECRET_KEY is not configured");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const response = await axios.post<TurnstileResponse>(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        secret: TURNSTILE_SECRET,
        response: token,
        remoteip: req.ip || req.socket.remoteAddress,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );

    if (!response.data.success) {
      console.error(
        "Turnstile verification failed:",
        response.data["error-codes"],
      );
      return res.status(403).json({
        error: "Turnstile verification failed",
        details: response.data["error-codes"],
      });
    }

    next();
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return res.status(500).json({
      error: "Failed to verify Turnstile token",
    });
  }
};
