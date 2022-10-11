const boom = require('@hapi/boom');
let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'some_unknown_key';

exports.ensureAuth = (req, res, next) => {
    if(!req.headers.authorization) next(boom.forbidden('PETITION HAS NO AUTHENTICATION HEADER'));
    let token = req.headers.authorization.replace(/['"]+/g, '');
    let payload = undefined;
    try {
        payload = jwt.decode(token, secret);
        if(payload.exp <= moment.unix()) {
            next(boom.unauthorized('TOKEN HAS EXPIRED'));
        }
    }
    catch(err) {
        next(boom.badRequest('TOKEN IS NOT VALID!'));
    }

    if(payload) {
        req.user = payload;
        next();
    }
}