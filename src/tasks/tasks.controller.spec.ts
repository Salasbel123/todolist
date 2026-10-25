import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  const tasksService = {
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the authenticated user ID to findOne', async () => {
    const request = { user: { userId: 7 } };

    await controller.findOne(request as never, '12');

    expect(tasksService.findOne).toHaveBeenCalledWith(12, 7);
  });

  it('passes the authenticated user ID to update', async () => {
    const request = { user: { userId: 7 } };
    const updateTaskDto = { title: 'Updated task' };

    await controller.update(request as never, '12', updateTaskDto);

    expect(tasksService.update).toHaveBeenCalledWith(12, 7, updateTaskDto);
  });

  it('passes the authenticated user ID to remove', async () => {
    const request = { user: { userId: 7 } };

    await controller.remove(request as never, '12');

    expect(tasksService.remove).toHaveBeenCalledWith(12, 7);
  });
});
