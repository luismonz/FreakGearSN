let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'some_unknown_key';

exports.createToken = (user) => {
    let payload = {
        sub: user._id,
        name: user.user_name,
        surname: user.user_surname,
        nickname: user.user_nickname,
        email: user.user_email,
        role: user.user_role,
        image: user.user_image,
        iat: moment().unix(),
        exp: moment().add(2, 'hour').unix()
    };

    return jwt.encode(payload, secret);
};