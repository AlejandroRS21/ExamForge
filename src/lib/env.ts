// ExamForge — production environment guard.
// Fails fast at server boot when a critical variable is missing, instead of
// letting the app start half-configured (silent 500s, mis-signed JWTs).
// No-op outside production so local dev / CI builds keep working without
// a full .env.

const REQUIRED_PRODUCTION_VARS = ["DATABASE_URL", "AUTH_SECRET"] as const;

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  const missing = REQUIRED_PRODUCTION_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}. ` +
        "Set them before starting the server (see .env.example).",
    );
  }
}
