const Announcement = require('../models/announcement'); 
const User = require('../models/user'); 
const Notification = require('../models/notification'); 

exports.getAllAnnouncements = async (req, res) => {
  try {
    let query = Announcement.find();

    const { limit, offset } = req.query;
    // Add any additional query parameters you need, e.g., sorting, selecting specific fields
    // if (req.query.sort) {
    //   query = query.sort(req.query.sort);
    // }

    // You can add more query parameters as needed
    const totalCount = await Announcement.countDocuments(query);

    const allAnnouncements = await Announcement.find(query).sort({ createdAt: -1 }) 
    .limit(parseInt(limit)) // Limit the number of tasks per page
    .skip(parseInt(offset)) // Offset to handle pagination


    res.status(200).json({allAnnouncements: allAnnouncements,totalCount: totalCount});
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    // Check if the user has the "Admin" role
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
    }
    // Extract the announcement details from the request body
    const { description, announcer} = req.body;

    // Process the uploaded image using multer
    let imgPath = null;
    if (req.file) {
      imgPath = "http://localhost:5000/uploads/" + req.file.filename// Store the image path on the server
    }

    // Create a new instance of the Announcement model
    const newAnnouncement = new Announcement({
      description,
      img: imgPath, 
      announcer,
    });
    const users = await User.find();
    for (const user of users) {
      const content = `New Announcement is added by Admin.`;

      const newNotification = new Notification({
        type: 'new_announcement',
        content,
        recipient: user._id,
        task: newAnnouncement._id,
        read: false,
      });

      await newNotification.save();
      console.log(newNotification)
    }

    // Save the new announcement to the database
    const createdAnnouncement = await newAnnouncement.save();

    res.status(201).json({ message: 'Announcement is added.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.deleteAnnouncement = async (req, res) => {
    try {
      // Check if the user has the "Admin" role
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
      }
  
      // Find the announcement by ID and delete it
      const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
  
      if (!deletedAnnouncement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      const users = await User.find();
      for (const user of users) {
        const content = `Announcement section is updated.`;
  
        const newNotification = new Notification({
          type: 'delete_announcement',
          content,
          recipient: user._id,
          task: deletedAnnouncement._id,
          read: false,
        });
  
        await newNotification.save();
        console.log(newNotification)
      }
  
      res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  exports.updateAnnouncement = async (req, res) => {
    try {
      // Check if the user has the "Admin" role
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
      }
  
      // Extract the announcement details from the request body
      const { description, announcer } = req.body;
  
      // Find the announcement by ID
      const announcement = await Announcement.findById(req.params.id);
  
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      let imgPath = null;
      if (req.file) {
        imgPath = "http://localhost:5000/uploads/" + req.file?.filename 
      }else{
        imgPath = announcement.img
      }
  
      // Update the announcement fields
      announcement.description = description;
      announcement.img = imgPath;
      announcement.announcer = announcer;
  
      // Save the updated announcement to the database
      const updatedAnnouncement = await announcement.save();

      const users = await User.find();
      for (const user of users) {
        const content = `Announcement section is updated.`;
  
        const newNotification = new Notification({
          type: 'update_announcement',
          content,
          recipient: user._id,
          task: updatedAnnouncement._id,
          read: false,
        });
  
        await newNotification.save();
        console.log(newNotification)
      }
  
      res.status(200).json({message: 'Announcement is updated'});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };


  
  