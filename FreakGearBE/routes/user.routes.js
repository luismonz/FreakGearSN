const express = require("express");
const UserController = require('../controllers/user.controller');
const {getUserSchema, getPaginatedUsersSchema, UpdateUserJoiSchema } = require('../models/user');
const { validatorHandler, imageValidatorHandler } = require('../middlewares/validator.handler');
const router = express.Router();
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});


router.get('/testing', async(req, res, next) => {
    try {
        res.status(200).json({MSG: 'JUST TESTING SOME JWT...'});
    }
    catch(err) {
        next(err);
    }
})

router.get('/user/:user_id', validatorHandler(getUserSchema, 'params'), async(req, res, next) => {
    try {
        const id = req.params.user_id;
        const getUser = await UserController.getUser(id);
        res.status(201).json(getUser);
    }
    catch(error) {
        next(error);
    }
});

router.get('/:page?', validatorHandler(getPaginatedUsersSchema, 'params'), async(req, res, next) => {
    try {
        const sub = req.user.sub;
        const page = req.params.page;
        const getPaginatedUsers = await UserController.getUsers(page, sub);
        res.status(201).json(getPaginatedUsers);
    }
    catch(error) {
        next(error);
    }
});

router.patch('/update-user/:user_id', validatorHandler(getUserSchema, 'params'), validatorHandler(UpdateUserJoiSchema, 'body'), async(req, res, next) => {
    try {
        const userId = req.params.user_id;
        const userBody = req.body;
        const sub = req.user.sub;
        delete userBody.user_password;
        const updatedUser = await UserController.updateUser(userId, sub, userBody);
        res.status(201).json(updatedUser);
    }
    catch(error) {
        next(error);
    }
});

router.post('/upload-image/:user_id', validatorHandler(getUserSchema, 'params'), md_upload, imageValidatorHandler(), async(req, res, next) => {
    try {
        const userId = req.params.user_id;
        const sub = req.user.sub;
        const fileReq = req.files;
        const uploadedImage = await UserController.uploadImage(userId, sub, fileReq);
        res.status(201).json(uploadedImage);
    }
    catch(error) {
        next(error);
    }
});


module.exports = router;