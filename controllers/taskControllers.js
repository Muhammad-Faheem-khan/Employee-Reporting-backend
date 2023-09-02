const Task = require('../models/taskModel'); 
const User = require('../models/user');
const Notification = require('../models/notification');

exports.getAllTasks = async (req, res) => {
  try {
   
    // Parse query parameters for filtering, sorting, and pagination
    const { assignedToIds, assignedBy, department, priority, status, limit, offset } = req.query;
    // Create a query object
    const query = {};
    if (assignedToIds) {
      // Use the $in operator to check if assignedTo contains the specific user ID
      query.assignedToIds = { $in: [assignedToIds] };
    }
    if (assignedBy) {
      query.assignedBy = assignedBy;
    }
    if (department) {
      query.department = department.toLowerCase();
    }
    if (priority) {
      query.priority = priority;
    }
    if (status) {
      query.status = status;
    }

    const totalCount = await Task.countDocuments(query);

    // Fetch tasks with the specified criteria, sorted by createdAt in descending order
    const tasks = await Task.find(query)
      .populate('assignedToNames', 'name') // Populate the assignedTo field with user's name
      .populate('assignedBy', 'name')
      .limit(parseInt(limit)) // Limit the number of tasks per page
      .skip(parseInt(offset)) // Offset to handle pagination
      .sort({ createdAt: -1 }); // Sort tasks by createdAt in descending order

    res.status(200).json({tasks: tasks, totalCount: totalCount});
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching tasks.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' ) {
      return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
    }
    const taskId = req.params.id; // Task ID from route parameter

    // Find the task by ID and remove it
    const deletedTask = await Task.findByIdAndDelete(taskId);

    const assignedByUser = await User.findById(req.user._id);
    for (let i = 0; i < deletedTask.assignedToIds.length; i++) {
      const recipient = deletedTask.assignedToIds[i];
      
      const content = `Task ${deletedTask.name} is deleted by ${assignedByUser.name}`;
      
      const newNotification = new Notification({
        type: 'task',
        content,
        recipient,
        task: deletedTask._id,
        read: false,
      });

      await newNotification.save();
    }

    const recipient = deletedTask.assignedBy
    const content = `Task ${deletedTask.name} is deleted by ${assignedByUser.name}`;
  
    const newNotification = new Notification({
      type: 'task',
      content,
      recipient,
      task: deletedTask._id,
      read: false,
    });

      await newNotification.save();

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.status(201).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while deleting the task.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' ) {
      return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
    }
    // Extract task details from the request body
    const { name, assignedToIds, assignedToNames, priority, status, deadline,department, description, assignedBy } = req.body;
    const files = req.files;

    let filesPath = [];
    files.forEach(file => {
      filesPath.push("http://localhost:5000/uploads/" + file.filename);
    });

    const idArray = assignedToIds.split(',');
    const nameArray = assignedToNames.split(',');

    const newTask = new Task({
      name,
      assignedToIds: idArray,
      assignedToNames: nameArray,
      priority,
      status,
      deadline,
      description,
      department: department.toLowerCase(),
      files: filesPath,
      assignedBy,
    });

    // Save the new task to the database
    const createdTask = await newTask.save();

    for (let i = 0; i < idArray.length; i++) {
      const recipient = idArray[i];
      const assignedByUser = await User.findById(assignedBy);
      const content = `You have been assigned a new task by ${assignedByUser.name}`;
      
      const newNotification = new Notification({
        type: 'task',
        content,
        recipient,
        task: createdTask._id,
        read: false,
      });

      await newNotification.save();
    }

    res.status(201).json({message: 'New task is assigned'});
  } catch (error) {
    res.status(400).json({ message: 'An error occurred while creating the task.' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const {id} = req.params
    const task = await Task.findById(id).populate('responses.user'); 
    
    if (!task) {
      return res.status(404).send({message: 'Task not found'});
    }else{
      
      task.assignedBy = await User.findById(task.assignedBy)
        await task.save();
     res.status(200).json(task)
    }
  }catch(error) {
      res.status(404).json({message: error.message})
  }
}

exports.changeStatus = async (req, res) => {
  try {
    const {id} = req.params
    const task = await Task.findById(id)
    
    if (!task) {
      return res.status(404).send({message: 'Task not found'});
    }else{
      task.status =  req.body.status

      const assignedByUser = await User.findById(req.user._id);
      for (let i = 0; i < task.assignedToIds.length; i++) {
        const recipient = task.assignedToIds[i];
        const content = `Task ${task.name} status is changed to ${req.body.status} by ${assignedByUser.name}`;
        
        const newNotification = new Notification({
          type: 'task',
          content,
          recipient,
          task: task._id,
          read: false,
        });

        await newNotification.save();
      }

    const content = `Task ${task.name} status is changed to ${req.body.status} by ${assignedByUser.name}`;
  
    const newNotification1 = new Notification({
      type: 'task',
      content,
      recipient: assignedByUser._id,
      task: task._id,
      read: false,
    });
    await newNotification1.save();

    const newNotification2 = new Notification({
      type: 'task',
      content,
      recipient: task.assignedBy._id,
      task: task._id,
      read: false,
    });
    await newNotification2.save();
    
        await task.save();
     res.status(200).json(task)
    }
  }catch(error) {
      res.status(404).json({message: error.message})
  }
}

exports.submitTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { user, description } = req.body;
    const files = req.files;
    let filesPath = [];
    files.forEach(file => {
      filesPath.push("http://localhost:5000/uploads/" + file.filename);
    });
    // Create a new response object
    const response = {
      user,
      description,
      files: filesPath
    };

    // Find the task by ID and push the new response
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: { responses: response },
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignedByUser = await User.findById(req.user._id);
    for (let i = 0; i < task.assignedToIds.length; i++) {
      const recipient = task.assignedToIds[i];
      const content = `Response is submitted on task ${task.name} by ${assignedByUser.name}`;
      
      const newNotification = new Notification({
        type: 'task',
        content,
        recipient,
        task: task._id,
        read: false,
      });

      await newNotification.save();
    }

  const recipient = task.assignedBy
  const content = `Task ${task.name} status is changed to ${req.body.status} by ${assignedByUser.name}`;

  const newNotification = new Notification({
    type: 'task',
    content,
    recipient,
    task: task._id,
    read: false,
  });
  await newNotification.save();

    return res.json({message: 'Response is submitted'});
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }

}

exports.deleteResponse = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const responseId = req.params.responseId;

    // Find the task by ID and update the responses array using $pull
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: { responses: { _id: responseId } },
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}