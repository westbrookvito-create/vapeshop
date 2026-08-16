import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export function parseInitData(initData: string): { user: TelegramUser | null; valid: boolean } {
  const botToken = process.env.BOT_TOKEN || "";
  const devSkip = process.env.DEV_SKIP_AUTH === "true";

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash") || "";
    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    let valid = false;
    if (botToken && hash) {
      const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
      const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
      valid = computedHash === hash;
    }

    const userRaw = params.get("user");
    const user = userRaw ? (JSON.parse(userRaw) as TelegramUser) : null;

    if (devSkip) valid = true;

    return { user, valid };
  } catch {
    return { user: null, valid: false };
  }
}

export function getAdminIds(): number[] {
  return (process.env.ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
}

export function isAdminUser(id: number | undefined | null): boolean {
  if (!id) return false;
  return getAdminIds().includes(id);
}

/** Attaches req.tgUser from x-telegram-init-data header. Does not block on invalid signature in dev. */
export function telegramAuth(req: Request, _res: Response, next: NextFunction) {
  const initData = (req.header("x-telegram-init-data") || "") as string;
  const { user } = parseInitData(initData);
  (req as any).tgUser = user;
  next();
}
