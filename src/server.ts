import app from "./app";
import dotenv from "dotenv";
import { client, db } from "./drizzle/db";
import { sql } from "drizzle-orm";

dotenv.config();

const PORT = process.env.PORT || 3000;

const cleanupStaleData = async () => {
  try {
    const now = new Date();

    const subResult = await db.execute(
      sql`UPDATE "subscriptions" SET "status" = 'expired', "updated_at" = NOW() WHERE "expires_at" < NOW() AND "status" = 'active'`,
    );
    if (subResult.rowCount > 0) {
      console.log(`Marked ${subResult.rowCount} expired subscription(s)`);
    }

    const tokenResult = await db.execute(
      sql`UPDATE "users" SET "reset_password_token_hash" = NULL, "reset_password_expires_at" = NULL WHERE "reset_password_expires_at" <= NOW()`,
    );
    if (tokenResult.rowCount > 0) {
      console.log(`Cleaned ${tokenResult.rowCount} expired reset token(s)`);
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

const startServer = async () => {
  try {
    await client.connect();
    console.log("Database connected successfully");

    await cleanupStaleData();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });

    process.on("SIGINT", async () => {
      console.log("\\nShutting down...");
      await client.end();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
