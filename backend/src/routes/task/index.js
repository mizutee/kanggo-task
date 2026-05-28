const express = require('express');
const TaskController = require('../../controllers/TaskController');
const AuthMiddleware = require('../../middleware/auth');
const TaskOwnerMiddleware = require('../../middleware/taskOwner');

const router = express.Router();

router.use(AuthMiddleware);

router.get('/', TaskController.GetTasksController);
router.post('/', TaskController.CreateTaskController);
router.put('/:id', TaskOwnerMiddleware, TaskController.UpdateTaskController);
router.delete('/:id', TaskOwnerMiddleware, TaskController.DeleteTaskController);

module.exports = router;
