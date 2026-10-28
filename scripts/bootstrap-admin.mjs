import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const userId = process.env.INITIAL_ADMIN_USER_ID?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
if (!/^[a-z0-9_-]{3,32}$/.test(userId ?? "") || !password || password.length < 12) throw new Error("Set a valid INITIAL_ADMIN_USER_ID and 12+ character INITIAL_ADMIN_PASSWORD.");
const db = new PrismaClient();
try {
  const existing = await db.user.count({ where: { role: "ADMIN" } });
  if (existing) console.log("An admin already exists; bootstrap skipped.");
  else await db.user.create({ data: { userId, fullName: "Initial Administrator", passwordHash: await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 }), role: "ADMIN", status: "ACTIVE" } });
} finally { await db.$disconnect(); }
