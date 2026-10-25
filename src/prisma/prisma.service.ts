import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config'; // هذه لضمان قراءة الرابط من ملف .env

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // جلب رابط الاتصال من الخزنة
    const connectionString = process.env.DATABASE_URL;
    
    // إنشاء جسر الاتصال
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // إخبار Prisma باستخدام هذا الجسر
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}