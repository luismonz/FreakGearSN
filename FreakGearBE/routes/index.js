const express = require("express");
const usersRouter = require('./user.routes');
const auth_mw = require('../middlewares/authenticated');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/users', auth_mw.ensureAuth, usersRouter);
}

module.exports = routerApi;