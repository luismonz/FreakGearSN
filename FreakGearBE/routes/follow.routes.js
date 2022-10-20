const express = require("express");
const router = express.Router();
const FollowController = require('../controllers/follow.controller');
const {validatorHandler} = require('../middlewares/validator.handler');
const { FollowedBodySchema } = require('../models/follow')

router.get('/testing', async(req, res, next) => {
    try {
        let getMsg = FollowController.test();
        res.status(200).json(getMsg);
    }
    catch(err) {
        next(err);
    }
})

router.post('/follow', validatorHandler(FollowedBodySchema, 'body'), async(req, res, next) => {
    try {
        const body = req.body;
        const sub = req.user.sub;
        let getMsg = await FollowController.saveFollow(body, sub);
        res.status(200).json(getMsg);
    }
    catch(err) {
        next(err);
    }
})

module.exports = router;