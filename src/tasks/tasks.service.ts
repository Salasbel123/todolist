import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // قمنا بإضافة userId هنا وربط المهمة به بشكل صحيح
  async create(createTaskDto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description, // استخدمنا الحقول مباشرة بدلاً من ...createTaskDto
        user: {
          connect: { id: userId }, // نربط المهمة بالمستخدم الحالي
        },
      },
    });
  }

  findAll() {
    return this.prisma.task.findMany({
      include: { user: true },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id, userId },
      include: { user: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    try {
      return await this.prisma.task.update({
        where: { id, userId },
        data: updateTaskDto,
      });
    } catch (error) {
      this.throwIfTaskNotFound(error);
    }
  }

  async remove(id: number, userId: number) {
    try {
      return await this.prisma.task.delete({
        where: { id, userId },
      });
    } catch (error) {
      this.throwIfTaskNotFound(error);
    }
  }

  private throwIfTaskNotFound(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Task not found');
    }

    throw error;
  }
}
