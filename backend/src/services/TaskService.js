const { randomUUID } = require('crypto');

const { pool } = require('../database/mysql');

const allowedTaskStatuses = ['pending', 'in-progress', 'hold', 'done'];

function isValidDeadline(deadline) {
  if (!deadline) {
    return true;
  }

  if (typeof deadline !== 'string') {
    return false;
  }

  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = deadline.match(datePattern);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

class TaskService {
  static async GetTasksService(userId, query = {}) {
    try {
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 10;
      const status = query.status ? String(query.status).trim().toLowerCase() : null;
      const search = query.search ? String(query.search).trim() : null;

      if (!Number.isInteger(page) || page < 1) {
        const error = new Error('Invalid page');
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        const error = new Error('Invalid limit');
        error.statusCode = 400;
        throw error;
      }

      if (status && !allowedTaskStatuses.includes(status)) {
        const error = new Error('Invalid task status');
        error.statusCode = 400;
        throw error;
      }

      const offset = (page - 1) * limit;
      const whereConditions = ['user_id = ?'];
      const values = [userId];

      if (status) {
        whereConditions.push('status = ?');
        values.push(status);
      }

      if (search) {
        whereConditions.push('title LIKE ?');
        values.push(`%${search}%`);
      }

      const whereQuery = `WHERE ${whereConditions.join(' AND ')}`;

      const [countResult] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM tasks
         ${whereQuery}`,
        values,
      );

      const total = Number(countResult[0].total);
      const totalPages = Math.ceil(total / limit);

      const [tasks] = await pool.execute(
        `SELECT id, title, description, status, deadline, user_id, created_at, updated_at
         FROM tasks
         ${whereQuery}
         ORDER BY created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        values,
      );

      return {
        tasks,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async CreateTaskService(payload, userId) {
    try {
      const id = randomUUID();
      const title = payload.title;
      const description = payload.description || null;
      const status = payload.status || 'pending';
      const deadline = payload.deadline || null;

      if (!title) {
        const error = new Error('Title is required');
        error.statusCode = 400;
        throw error;
      }

      if (!allowedTaskStatuses.includes(status)) {
        const error = new Error('Invalid task status');
        error.statusCode = 400;
        throw error;
      }

      if (!isValidDeadline(deadline)) {
        const error = new Error('Invalid deadline format. Use YYYY-MM-DD');
        error.statusCode = 400;
        throw error;
      }

      await pool.execute(
        `INSERT INTO tasks (id, title, description, status, deadline, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, title, description, status, deadline, userId],
      );

      return {
        id,
        title,
        description,
        status,
        deadline,
        user_id: userId,
      };
    } catch (error) {
      throw error;
    }
  }

  static async UpdateTaskService(taskId, payload, userId) {
    try {
      const taskPayload = {
        ...payload,
      };

      if (taskPayload.title !== undefined) {
        if (taskPayload.title === null || String(taskPayload.title).trim() === '') {
          const error = new Error('Title is required');
          error.statusCode = 400;
          throw error;
        }

        taskPayload.title = String(taskPayload.title).trim();
      }

      if (taskPayload.description === '') {
        taskPayload.description = null;
      }

      if (taskPayload.deadline === '') {
        taskPayload.deadline = null;
      }

      if (taskPayload.status !== undefined && !allowedTaskStatuses.includes(taskPayload.status)) {
        const error = new Error('Invalid task status');
        error.statusCode = 400;
        throw error;
      }

      if (taskPayload.deadline && !isValidDeadline(taskPayload.deadline)) {
        const error = new Error('Invalid deadline format. Use YYYY-MM-DD');
        error.statusCode = 400;
        throw error;
      }

      const fields = Object.keys(taskPayload);

      if (fields.length === 0) {
        const error = new Error('At least one field is required');
        error.statusCode = 400;
        throw error;
      }

      const setQuery = fields.map((field) => `${field} = ?`).join(', ');
      const values = fields.map((field) => taskPayload[field]);

      const [result] = await pool.execute(
        `UPDATE tasks
         SET ${setQuery}
         WHERE id = ? AND user_id = ?`,
        [...values, taskId, userId],
      );

      if (result.affectedRows === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      const [tasks] = await pool.execute(
        `SELECT id, title, description, status, deadline, user_id, created_at, updated_at
         FROM tasks
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [taskId, userId],
      );

      return tasks[0];
    } catch (error) {
      throw error;
    }
  }

  static async DeleteTaskService(taskId, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, userId],
      );

      if (result.affectedRows === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      return {
        id: taskId,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaskService;
