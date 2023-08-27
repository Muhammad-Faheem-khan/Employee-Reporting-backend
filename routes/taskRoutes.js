const express = require('express');

const {getAllTasks,  deleteTask, createTask, getTask, changeStatus, submitTask, deleteResponse} = require('../controllers/taskControllers');
const {authenticateJWT} = require('../controllers/jwtController')
const upload = require('../helper/upload')

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getAllTasks)
router.put('/status/:id', changeStatus)
router.get('/:id', getTask)
router.post('/create', upload.array('files', 5), createTask)
router.delete('/delete/:id', deleteTask)
router.post('/:id/response', upload.array('files', 5), submitTask)
router.delete('/:taskId/delete/:responseId', deleteResponse)

module.exports = router;