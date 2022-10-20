const express = require("express");
const UserController = require('../controllers/user.controller');
const { UserJoiSchema, UserLoginJoiSchema} = require('../models/user');
const { uploadImageSchema } = require('../models/image');
const {validatorHandler} = require('../middlewares/validator.handler');
const router = express.Router();
const path = require('path');

router.post('/register', validatorHandler(UserJoiSchema, 'body'), async(req, res, next) => {
    try {
        const body = req.body;
        const newuser = await UserController.SaveUser(body);
        res.status(201).json(newuser);
    }
    catch(error) {
        next(error);
    }
});

router.post('/login', validatorHandler(UserLoginJoiSchema, 'body'), async(req, res, next) => {
    try {
        const body = req.body;
        const loggedUser = await UserController.loginUser(body);
        res.status(201).json(loggedUser);
    }
    catch(error) {
        next(error);
    }
});

router.get('/get-image-user/:imageFile', validatorHandler(uploadImageSchema, 'params'), async(req, res, next) => {
    try {
        const imageFile = req.params.imageFile;
        const uploadedImage = await UserController.getImageFile(imageFile);
        res.sendFile(path.resolve(uploadedImage))
    }
    catch(error) {
        next(error);
    }
});

module.exports = router;