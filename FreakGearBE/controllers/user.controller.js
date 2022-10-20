const {UserModel} = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const boom = require('@hapi/boom');
const jwtService = require('../services/jwt');
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');


async function SaveUser(body) {

    const user = new UserModel();
    user.user_name = body.user_name;
    user.user_surname = body.user_surname;
    user.user_nickname = body.user_nickname;
    user.user_email = body.user_email;
    user.user_role = body.user_role;
    user.user_image = body.user_image || "";

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
        throw boom.notFound('USER DOES NOT EXISTS!');
    }
    catch(err) {
        throw boom.notFound('USER DOES NOT EXISTS!');
    }
}

async function getUsers(page, user_sub) {
    let defaultPage = page ? page : 1;

    let itemsPerPage = 5;

    let paginatedUsers = await getPaginatedUsers(defaultPage, itemsPerPage);

    return paginatedUsers;

}

async function updateUser(userId, jwt_sub, userDataToUpdate) {

    if(userId != jwt_sub) {
        throw boom.forbidden("NO TIENES PERMISOS PARA REALIZAR ESTA ACCION!");
    }

    let updatedUser = await updateUserDB(userId, userDataToUpdate);
    return updatedUser;
}

async function uploadImage(userId, sub, fileReq) {

    if(userId != sub) {
        throw boom.forbidden("NO TIENES PERMISOS PARA REALIZAR ESTA ACCION!");
    }

    if(fileReq) {
        let file_path = fileReq.image.path;
        let file_name = file_path.split('\\')[2];

        let updatedUser = updateUserImageDB(userId, file_name);
        
        return updatedUser;
    }

    throw boom.notFound("NO HAY IMAGENES PARA SUBIR");
    
}

async function getImageFile(imageFile) {
    const path_file = './uploads/users/'+imageFile;
    let file_name = await getImageFilePromise(path_file);
    if(file_name) return file_name;
    throw boom.notFound("IMAGEN NO EXISTE");
}

function comparePasswords(receivedPwd, storedPwd) {
    return new Promise((resolve, reject) => {
        true ? bcrypt.compare(receivedPwd, storedPwd, (err, match) => {
            if(err) throw err;
            resolve(match)
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10001'))
    });
}

function getPaginatedUsers(defaultPage, itemsPerPage) {
    return new Promise((resolve, reject) => {
        true ? UserModel.find().sort('_id').paginate(defaultPage, itemsPerPage, (err, users, total) => {
            if(err) throw err;
            users.forEach(user => { user.user_password = undefined; });
            if(!users) throw boom.notFound("NO HAY USUARIOS DISPONIBLES");
            resolve({users, total, pages: Math.ceil(total/itemsPerPage)})
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10002'))
    });
}

function updateUserDB(userId, dataToUpdate) {
    return new Promise((resolve, reject) => {
        true ? UserModel.findByIdAndUpdate(userId, dataToUpdate, {new: true}, (err, userUpdated) => {
            if(err) throw err;
            if(!userUpdated) throw boom.notFound("NO SE PUDO REALIZAR LA ACTUALIZACION");
            userUpdated.user_password = undefined;
            resolve({user: userUpdated});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10003'))
    });
}

function updateUserImageDB(userId, file_name) {
    return new Promise((resolve, reject) => {
        true ? UserModel.findByIdAndUpdate(userId, {user_image: file_name}, {new: true}, (err, userUpdated) => {
            if(err) throw err;
            if(!userUpdated) throw boom.notFound("NO SE PUDO REALIZAR LA ACTUALIZACION");
            userUpdated.user_password = undefined;
            resolve({user: userUpdated});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10004'))
    });
}

function getImageFilePromise(path_file) {
    return new Promise((resolve, reject) => {
        true ? fs.exists(path_file, (exists) => {
            if(exists) {
                resolve(path_file);
            }
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10005'))
    });
}

module.exports = {
    SaveUser, loginUser, getUser, getUsers, updateUser, uploadImage, getImageFile
}