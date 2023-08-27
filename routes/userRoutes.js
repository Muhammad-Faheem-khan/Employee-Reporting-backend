const express = require('express');
const { getUser, getAllUsers, createUser, loginUser, updateUser, toggleUserStatus, deleteUser, resetPassword} = require('../controllers/userController');
const {authenticateJWT} = require('../controllers/jwtController')

const router = express.Router();
const upload = require('../helper/upload')

router.post('/login', loginUser)
router.post('/resetPassword', resetPassword)
router.use(authenticateJWT);

router.get('/', getAllUsers);
router.get('/:id', getUser)
router.post('/signup', createUser)
router.put('/update/:id',upload.single('img'), updateUser)
router.put('/userStatus/:id', toggleUserStatus)
router.delete('/delete/:id', deleteUser)


module.exports = router;