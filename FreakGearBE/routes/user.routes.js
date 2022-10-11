const express = require("express");
const UserController = require('../controllers/user.controller');
const { UserJoiSchema, UserLoginJoiSchema, getUserSchema } = require('../models/user');
const validatorHandler = require('../middlewares/validator.handler');
const router = express.Router();

router.get('/testing', async(req, res, next) => {
    try {
        res.status(200).json({MSG: 'JUST TESTING SOME JWT...'});
    }
    catch(err) {
        next(err);
    }
})

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


module.exports = router;