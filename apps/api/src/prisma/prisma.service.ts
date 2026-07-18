import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

console.log("[startup] PRISMA: creating adapter, DATABASE_URL set:", !!process.env.DATABASE_URL);
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
console.log("[startup] PRISMA: adapter created");

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    console.log("[startup] PRISMA: connecting...");
    await this.$connect();
    console.log("[startup] PRISMA: connected");
  }
}