const express = require("express");
const UserController = require('../controllers/user.controller');
const {getUserSchema, getPaginatedUsersSchema, UpdateUserJoiSchema, nonRequiredUserId } = require('../models/user');
const { validatorHandler, imageValidatorHandler } = require('../middlewares/validator.handler');
const router = express.Router();
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});

/* SCHEMAS */
/**
* @swagger
* components:
*  schemas:
*      User:
*          type: object
*          properties:
*              user_id:
*                  type: string hex
*                  description: ID OF USER
*          required:
*              - user_id
*          example:
*              user_id: 63573555b871cfbc0ef0cc78
*/

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
*/

router.get('/testing', async(req, res, next) => {
    try {
        res.status(200).json({MSG: 'JUST TESTING SOME JWT...'});
    }
    catch(err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/v1/users/user/{user_id}:
 *  get:
 *      security:
 *          - BearerAuth: []
 *      summary: GET USER BY ID
 *      tags: [User]
 *      parameters:
 *          - in: path
 *            name: user_id
 *            required: true
 *            type: string hex
 *            description: user_id
 *      responses:
 *          200:
 *              description: user got 
 *          404:
 *              description: user not found
*/
router.get('/user/:user_id', validatorHandler(getUserSchema, 'params'), async(req, res, next) => {
    try {
        const id = req.params.user_id;
        const sub = req.user.sub;
        const getUser = await UserController.getUser(id, sub);
        res.status(200).json(getUser);
    }
    catch(error) {
        next(error);
    }
});

router.get('/', validatorHandler(getPaginatedUsersSchema, 'query'), async(req, res, next) => {
    try {
        const sub = req.user.sub;
        const page = req.query.page;
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

router.get('/user/get/counters/:user_id?', validatorHandler(nonRequiredUserId, 'params'), async(req, res, next) => {
    try {
        let userId = req.user.sub;
        if(req.params.user_id) {userId = req.params.user_id;}
        const counters = await UserController.getCounters(userId);
        res.status(201).json(counters);
    }
    catch(error) {
        next(error);
    }
});


module.exports = router;