const {UserModel} = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const boom = require('@hapi/boom');
const jwtService = require('../services/jwt');


async function SaveUser(body) {

    const user = new UserModel();
    user.user_name = body.user_name;
    user.user_surname = body.user_surname;
    user.user_nickname = body.user_nickname;
    user.user_email = body.user_email;
    user.user_role = body.user_role;
    user.user_image = body.user_image;

    const oneUser = await UserModel.find({$or: [
        {user_email: user.user_email.toLowerCase()},
        {user_nickname: user.user_nickname.toLowerCase()}
    ]});

    if(oneUser && oneUser.length >=1) {
        throw boom.conflict("USER ALREADY EXISTS!")
    }

    bcrypt.hash(body.user_password, null, null, (err, hash) => {
        user.user_password = hash;

        user.save((err, userStored) => {
            if(userStored) return userStored;
            throw err;
        })
    })

    return user;
}

async function loginUser(body) {
    const user = new UserModel();
    user.user_email = body.user_email;
    user.user_password = body.user_password;
    let isPwd = false;
    let getToken = body.getToken;

    const findUser = await UserModel.findOne({user_email: user.user_email});

    if(findUser) {
        isPwd = await comparePasswords(user.user_password, findUser.user_password);
        if(isPwd) {
            if(getToken) {
                return {token: jwtService.createToken(findUser)}
            }
            findUser.user_password = undefined;
            return findUser
        }
        throw boom.unauthorized('CREDENCIALES NO VALIDAS');
    }

    throw boom.notFound("USUARIO NO REGISTRADO!");
}

async function getUser(userId) {
    try {
        let foundUser = await UserModel.findById(userId);
        if(foundUser) {
            return foundUser;
        }
    }
    catch(err) {
        throw boom.notFound('USER DOES NOT EXISTS!');
    }
}

function comparePasswords(receivedPwd, storedPwd) {
    return new Promise((resolve, reject) => {
        true ? bcrypt.compare(receivedPwd, storedPwd, (err, match) => {
            if(err) throw err;
            resolve(match)
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10001'))
    });
}

module.exports = {
    SaveUser, loginUser, getUser
}