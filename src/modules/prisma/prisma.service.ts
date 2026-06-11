import "dotenv/config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as Prisma.PrismaClientOptions);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
