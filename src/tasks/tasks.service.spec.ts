import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  const prisma = {
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds a task only for the authenticated user', async () => {
    const task = { id: 12, userId: 7 };
    prisma.task.findUnique.mockResolvedValue(task);

    await expect(service.findOne(12, 7)).resolves.toBe(task);

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 12, userId: 7 },
      include: { user: true },
    });
  });

  it('throws NotFoundException when the user cannot find the task', async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(service.findOne(12, 7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates only a task owned by the authenticated user', async () => {
    const task = { id: 12, userId: 7 };
    const updateTaskDto = { title: 'Updated task' };
    prisma.task.update.mockResolvedValue(task);

    await expect(service.update(12, 7, updateTaskDto)).resolves.toBe(task);

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 12, userId: 7 },
      data: updateTaskDto,
    });
  });

  it('throws NotFoundException when updating a missing or unowned task', async () => {
    prisma.task.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.update(12, 7, { title: 'Updated task' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes only a task owned by the authenticated user', async () => {
    const task = { id: 12, userId: 7 };
    prisma.task.delete.mockResolvedValue(task);

    await expect(service.remove(12, 7)).resolves.toBe(task);

    expect(prisma.task.delete).toHaveBeenCalledWith({
      where: { id: 12, userId: 7 },
    });
  });

  it('throws NotFoundException when deleting a missing or unowned task', async () => {
    prisma.task.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(service.remove(12, 7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rethrows unexpected Prisma errors', async () => {
    const error = new Error('Database unavailable');
    prisma.task.update.mockRejectedValue(error);

    await expect(service.update(12, 7, { title: 'Updated task' })).rejects.toBe(
      error,
    );
  });
});
