const express = require("express");
const path = require('path');
const fs = require('fs');
const { validatorHandler, imageValidatorHandler } = require('../middlewares/validator.handler');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/posts'});
const router = express.Router();
const { PostBodySchema, getPaginatedPostsSchema, postIdSchema } = require('../models/posts');
const PostController = require('../controllers/posts.controller');

router.post('/', validatorHandler(PostBodySchema, 'body'), async(req, res, next) => {
    try {
        const userId = req.user.sub;
        const getPost = await PostController.savePost(userId, req.body);
        res.status(200).json(getPost);
    }
    catch(err) {
        next(err);
    }
})

router.get('/', validatorHandler(getPaginatedPostsSchema, 'query'), async(req, res, next) => {
    try {
        const userId = req.user.sub;
        const getPosts = await PostController.getPostsFromPeopleIFollow(userId, req.query);
        res.status(200).json(getPosts);
    }
    catch(err) {
        next(err);
    }
})

router.get('/:post_id', validatorHandler(postIdSchema, 'params'), async(req, res, next) => {
    try {
        const getPost = await PostController.getPostById(req.params.post_id);
        res.status(200).json(getPost);
    }
    catch(err) {
        next(err);
    }
})

router.delete('/:post_id', validatorHandler(postIdSchema, 'params'), async(req, res, next) => {
    try {
        const getPost = await PostController.deletePostById(req.user.sub, req.params.post_id);
        res.status(200).json(getPost);
    }
    catch(err) {
        next(err);
    }
})

router.post('/upload-image/:post_id', validatorHandler(postIdSchema, 'params'), md_upload, imageValidatorHandler(), async(req, res, next) => {
    try {
        const userId = req.user.sub;
        const fileReq = req.files;
        const post_id = req.params.post_id;
        const uploadedImage = await PostController.uploadImagePost(userId, post_id, fileReq);
        res.status(201).json(uploadedImage);
    }
    catch(error) {
        next(error);
    }
});

module.exports = router;