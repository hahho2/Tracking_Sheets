"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { clearSession, hashPassword, issueSession, normalizeUserId, passwordOptions } from "@/lib/auth";
import { currentUser } from "@/lib/auth";

const credentials = z.object({ userId: z.string().trim().regex(/^[A-Za-z0-9_-]{3,32}$/), password: z.string().min(12).max(128) });
export async function register(input: unknown) {
  const data = credentials.extend({ fullName: z.string().trim().min(2).max(100), confirmPassword: z.string() }).parse(input);
  if (data.password !== data.confirmPassword) return { error: "Passwords do not match." };
  try { await db.user.create({ data: { fullName: data.fullName, userId: normalizeUserId(data.userId), passwordHash: await hashPassword(data.password), status: "PENDING" } }); }
  catch { return { error: "That User ID is not available." }; }
  return { success: "Registration request submitted. Your account requires Admin approval." };
}
export async function login(input: unknown) {
  const data = credentials.extend({ remember: z.boolean().optional() }).parse(input);
  const user = await db.user.findUnique({ where: { userId: normalizeUserId(data.userId) } });
  const valid = await argon2.verify(user?.passwordHash ?? await hashPassword("invalid-password-value"), data.password).catch(() => false);
  if (!user || !valid) return { error: "Invalid User ID or password." };
  if (user.status !== "ACTIVE") return { error: "This account cannot sign in. Contact an administrator." };
  await db.$transaction([db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })]);
  await issueSession(user.id, data.remember);
  return { redirect: user.mustChangePassword ? "/change-password" : user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard" };
}
export async function logout() { await clearSession(); redirect("/login"); }
export async function changePassword(input: unknown) {
  const user = await currentUser(); if (!user) return { error: "Your session has expired." };
  const data = z.object({ currentPassword: z.string().min(1), password: z.string().min(12).max(128), confirmPassword: z.string() }).parse(input);
  if (data.password !== data.confirmPassword) return { error: "Passwords do not match." };
  const account = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!await argon2.verify(account.passwordHash, data.currentPassword)) return { error: "Current password is incorrect." };
  await db.$transaction([db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(data.password), mustChangePassword: false } }), db.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
  await issueSession(user.id); return { redirect: user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard" };
}
