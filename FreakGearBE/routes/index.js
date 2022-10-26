const express = require("express");
const usersRouter = require('./user.routes');
const usersNonAuthRouter = require('./user_non_auth.routes');
const followsRouter = require('./follow.routes');
const postsRouter = require('./posts.routes');
const auth_mw = require('../middlewares/authenticated');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerSpect = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SOCIAL NETWORK API",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ['./routes/*.js']
};

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(swaggerSpect)))
    router.use('/non-auth', usersNonAuthRouter);
    router.use('/users', auth_mw.ensureAuth, usersRouter);
    router.use('/follows', auth_mw.ensureAuth, followsRouter)
    router.use('/posts', auth_mw.ensureAuth, postsRouter)
}

module.exports = routerApi;