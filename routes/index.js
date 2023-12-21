const express = require('express');
const router = express.Router();

const homeController = require('../controller/home_controller');

router.get('/', homeController.home);
router.post('/uploadFile', homeController.uploadFile);
router.get('/viewFile', homeController.viewFile);
router.get('/deleteFile', homeController.deleteFile);


module.exports = router;