const express = require('express');
const { getAllAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement} = require('../controllers/announcementController');
const {authenticateJWT} = require('../controllers/jwtController')
const upload = require('../helper/upload')

const router = express.Router();

router.use(authenticateJWT);
router.get('/', getAllAnnouncements);
router.post('/create',upload.single('img'), createAnnouncement)
router.delete('/delete/:id', deleteAnnouncement);
router.put('/update/:id', upload.single('img'), updateAnnouncement)

module.exports = router;
