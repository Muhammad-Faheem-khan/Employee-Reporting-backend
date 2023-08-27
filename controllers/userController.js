const User = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const SECRETE_KEY = process.env.SECRETE_KEY ;

exports.getAllUsers = async (req, res) => {
  try {

    let query = User.find();
    if (req.query.sort) {
      query = query.sort(req.query.sort)
    }
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
  
    const allUsers = await query.exec();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
    try {

      if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
      }

    const {id} = req.params
    const user = await User.findById(id);
      if (!user) {
        return res.status(404).send('User not found');
      }else{
       res.status(200).json(user)
      }
    }catch(error) {
        res.status(404).json({message: error.message})
    }
}

exports.createUser = async (req, res) => {

    const { name, email, employeeCode, role } = req.body
    try {

      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
      }
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
        let password = "";
        
        for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset.charAt(randomIndex);
        }
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }
    
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            employeeCode,
            password: hashedPassword,
            role,
        });
    
        await user.save();
        
        // Return a success response
      res.status(201).json({ message: 'User registered successfully', newUser: {name, email, password} });

    }catch(error) {
      res.status(500).json({ message: 'An error occurred while registering the user' });
    }
}

exports.loginUser = async (req, res) => {
    try {
        // Extract user input from request body
        const { email, password } = req.body;
        // Retrieve the user from the database based on the provided email
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Compare the hashed password with the input password using bcrypt
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Generate a JSON Web Token (JWT) with user data and any necessary roles
        const token = jwt.sign({ userId: user._id, email: user.email }, SECRETE_KEY );
      
        // Return the token as a response
        res.json({ token, user });
      } catch (error) {
        res.status(500).json({ message: 'An error occurred during login' });
      }
}

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Check if the user has the "Admin" role or if they're updating their own profile
    if (req.user.role !== 'Admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      // Another user already has this email
      return res.status(409).json({ message: 'Email already exists for another user.' });
    }
    
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(req.body.password){

      // Hash the password using bcrypt
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    let imgPath = null;
    if (req.file) {
      imgPath = "http://localhost:5000/uploads/" + req.file?.filename 
    }else{
      imgPath = user.img
    }
    // Update the user fields
    user.name = req.body.name;
    user.email = req.body.email;
    user.img = imgPath;
    user.departmentName = req.body.departmentName;
    user.designation = req.body.designation;
    user.jobDescription = req.body.jobDescription;
    user.employeeReportingTo = req.body.employeeReportingTo;
    user.employeeStatus = req.body.employeeStatus;
    user.salary = req.body.salary;
    user.joiningDate = req.body.joiningDate;
    user.gender = req.body.gender;
    user.dob = req.body.dob;
    user.employeeCode = req.body.employeeCode;
    user.cnic = req.body.cnic;
    user.mobilePersonal = req.body.mobilePersonal;
    user.mobileCompany = req.body.mobileCompany;
    user.address = req.body.address;
    user.role = req.body.role;

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.status(200).json({ message: 'User profile is updated', user: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    // Check if the user has the "Admin" role
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
    }

    const userId = req.params.id; // Assuming you pass the user ID in the request body
    const isActive = req.body.isActive;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Toggle the isActive property based on the value provided in the request body
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for isActive' });
    }

    user.isActive = !isActive;

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.status(200).json({message: 'User Status Changed', updatedUser});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
    }
    // Extract the user ID from the request parameters
    const userId = req.params.id;

    // Check if the user ID is valid
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(userId);

    // Check if the user was found and deleted
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while deleting the user.' });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // Another user already has this email
      return res.status(409).json({ message: 'Invalid Email' });
    }else{
      const user = await User.findById(existingUser._id);
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
      let password = "";
      
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
      }
      user.password = await bcrypt.hash(password, 10);
      const updatedUser = await user.save();
      res.status(200).json({ message: 'Email is reset.',  newUser: {name: updatedUser.name, email: updatedUser.email, password} });
    }
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};