const { pool } = require('../database/mysql');
const ResponseHandler = require('../helpers/response');

async function TaskOwnerMiddleware(req, res, next) {
  try {
    const taskId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHandler.error(res, {
        message: 'Authorization token is required',
        statusCode: 401,
      });
    }

    const [tasks] = await pool.execute(
      'SELECT id, user_id FROM tasks WHERE id = ? AND user_id = ? LIMIT 1',
      [taskId, userId],
    );

    if (tasks.length === 0) {
      return ResponseHandler.error(res, {
        message: 'Task not found',
        statusCode: 404,
      });
    }

    req.task = tasks[0];

    return next();
  } catch (error) {
    return ResponseHandler.error(res, error);
  }
}

module.exports = TaskOwnerMiddleware;
