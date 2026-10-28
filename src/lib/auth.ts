import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import argon2 from "argon2";
import { db } from "@/lib/db";

const COOKIE = "codetrack_session";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const normalizeUserId = (value: string) => value.trim().toLowerCase();
export const passwordOptions = { type: argon2.argon2id as 2, memoryCost: 19456, timeCost: 2, parallelism: 1 };
export const hashPassword = (password: string) => argon2.hash(password, passwordOptions);

export async function issueSession(userId: string, remember = false) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (remember ? 30 * 86400 : 12 * 3600) * 1000);
  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: expiresAt, path: "/" });
}

export async function clearSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await db.session.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  (await cookies()).delete(COOKIE);
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return db.user.findFirst({ where: { status: "ACTIVE", sessions: { some: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } } } }, select: { id: true, userId: true, fullName: true, role: true, mustChangePassword: true } });
}

export async function requireUser() {
  const user = await currentUser();
  if (!user || user.role !== "USER") redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  return user;
}
