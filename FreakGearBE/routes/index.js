const express = require("express");
const usersRouter = require('./user.routes');
const usersNonAuthRouter = require('./user_non_auth.routes');
const followsRouter = require('./follow.routes');
const auth_mw = require('../middlewares/authenticated');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/non-auth', usersNonAuthRouter);
    router.use('/users', auth_mw.ensureAuth, usersRouter);
    router.use('/follows', auth_mw.ensureAuth, followsRouter)
}

module.exports = routerApi;