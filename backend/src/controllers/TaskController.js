const ResponseHandler = require('../helpers/response');
const { validatePayload } = require('../helpers/payload');
const TaskService = require('../services/TaskService');

class TaskController {
  static async GetTasksController(req, res) {
    try {
      const result = await TaskService.GetTasksService(req.user.id, req.query);

      return ResponseHandler.success(res, result, 200, 'Tasks retrieved successfully');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  static async CreateTaskController(req, res) {
    const taskFields = [
      { key: 'title', required: true },
      { key: 'description', required: false },
      { key: 'status', required: false },
      { key: 'deadline', required: false },
    ];

    try {
      const payload = validatePayload(taskFields, req.body);

      if (!payload.isValid) {
        return ResponseHandler.error(res, { message: payload.error }, 400);
      }

      const task = await TaskService.CreateTaskService(payload.data, req.user.id);

      return ResponseHandler.success(res, {
        task,
      }, 201, 'Task created successfully');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  static async UpdateTaskController(req, res) {
    const taskFields = [
      { key: 'title', required: false },
      { key: 'description', required: false },
      { key: 'status', required: false },
      { key: 'deadline', required: false },
    ];

    try {
      const payload = validatePayload(taskFields, req.body);

      if (!payload.isValid) {
        return ResponseHandler.error(res, { message: payload.error }, 400);
      }

      const task = await TaskService.UpdateTaskService(
        req.params.id,
        payload.data,
        req.user.id,
      );

      return ResponseHandler.success(res, {
        task,
      }, 200, 'Task updated successfully');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  static async DeleteTaskController(req, res) {
    try {
      await TaskService.DeleteTaskService(req.params.id, req.user.id);

      return ResponseHandler.success(res, {}, 200, 'Task has been deleted successfully');
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = TaskController;
