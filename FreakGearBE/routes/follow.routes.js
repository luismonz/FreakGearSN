const express = require("express");
const router = express.Router();
const FollowController = require('../controllers/follow.controller');
const {validatorHandler} = require('../middlewares/validator.handler');
const { getUserSchema } = require('../models/user');
const { FollowedBodySchema, queryFollowSchema } = require('../models/follow')

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

router.delete('/unfollow/:user_id', validatorHandler(getUserSchema, 'params'), async(req, res, next) => {
    try {
        const userId = req.user.sub;
        const followId = req.params.user_id;
        let getMsg = await FollowController.deleteFollow(userId, followId);
        res.status(200).json(getMsg);
    }
    catch(err) {
        next(err);
    }
})

router.get('/get-following/:user_id?', validatorHandler(queryFollowSchema, 'query'), validatorHandler(getUserSchema, 'params'), async(req, res, next) => {
    try {
        let userId = req.user.sub;

        if(req.params.user_id) userId = req.params.user_id;

        const followingList = await FollowController.getFollowingUsers(userId, req.query);

        res.status(200).json(followingList);
    }
    catch(err) {
        next(err);
    }
})

router.get('/get-followers/:user_id?', validatorHandler(getUserSchema, 'params'), validatorHandler(queryFollowSchema, 'query'), async(req, res, next) => {
    try {
        let userId = req.user.sub;

        if(req.params.user_id) userId = req.params.user_id;

        const followingList = await FollowController.getFollowers(userId, req.query);

        res.status(200).json(followingList);
    }
    catch(err) {
        next(err);
    }
})

router.get('/get-my-follows', async(req, res, next) => {
    try {
        let userId = req.user.sub;

        const myFollows = await FollowController.getMyFollows(userId);

        res.status(200).json(myFollows);
    }
    catch(err) {
        next(err);
    }
})

module.exports = router;