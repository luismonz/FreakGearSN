const { UserModel } = require('../models/user');
const { FollowModel } = require('../models/follow.js');
const { PostModel } = require('../models/posts');
const bcrypt = require('bcrypt-nodejs');
const boom = require('@hapi/boom');
const jwtService = require('../services/jwt');
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');


async function SaveUser(body) {

    const user = new UserModel();
    user.user_name = body.user_name;
    user.user_nickname = body.user_nickname;
    user.user_email = body.user_email;
    user.user_birthdate = body.user_birthdate;

    if(!body.user_role) user.user_role = "ROLE_USER";
    else user.user_role = body.user_role;

    if(body.user_image) user.user_image = body.user_image;
    else user.user_image = "";

    user.user_bio = "";
    user.user_uid_fb = "";
    user.user_visits_today = 0;

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

async function getUser(userId, sub) {
    let foundUser = await UserModel.findById(userId);
    let DoIFollow = false;
    let DoFollowsMe = false;

    if (!foundUser) {
        throw boom.notFound('USER DOES NOT EXISTS!');
    }

    if(userId != sub) foundUser.user_visits_today += 1;

    let updatedUser = await updateUserDB(userId, foundUser);

    updatedUser.user_password = undefined;

    // CHECK IF YOU FOLLOW THAT USER
    let FollowedBy = await FollowModel.findOne({ "fw_user": sub, "fw_followed": userId });
    let FollowsMe = await FollowModel.findOne({ "fw_user": userId, "fw_followed": sub });
    if(FollowedBy) DoIFollow = { follow: true, follow_id: FollowedBy._id };
    if(FollowsMe) DoFollowsMe = true;

    return { userProfile: updatedUser, DoIFollow, DoFollowsMe };
}

async function getUsers(page, user_sub) {
    let defaultPage = page ? page : 1;

    let itemsPerPage = 5;

    let users_follow_me = await followedUsersPagination(user_sub);
    let users_following = await followingUsersPagination(user_sub);
    let paginatedUsers = await getPaginatedUsers(defaultPage, itemsPerPage, user_sub);

    return {paginatedUsers, users_following, users_follow_me};

}

async function updateUser(userId, jwt_sub, userDataToUpdate) {

    if(userId != jwt_sub) {
        throw boom.forbidden("NO TIENES PERMISOS PARA REALIZAR ESTA ACCION!");
    }

    let foundUser = await UserModel.findById(userId);

    if (!foundUser) {
        throw boom.notFound('USER DOES NOT EXISTS!');
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

async function getImageFile(imageFile, path) {
    const path_file = path+imageFile;
    let file_name = await getImageFilePromise(path_file);
    if(file_name) return file_name;
    throw boom.notFound("IMAGEN NO EXISTE");
}

async function getCounters(user_id) {

    let foundUser = await UserModel.findById(user_id);

    if (!foundUser) {
        throw boom.notFound('USER DOES NOT EXISTS!');
    }

    let getCountFollowVar = await getCountFollow(user_id);
    let getCountFollowedVar = await getCountFollowed(user_id);
    let postsCount = await postsCounting(user_id);
    let visitsToday = foundUser.user_visits_today;

    return {
        following: getCountFollowVar,
        followed: getCountFollowedVar,
        posts: postsCount,
        visitsToday
    }

}

async function getMostVisitedUsers() {
    let users = await getMostVisitedUsersDB();
    if(!users) throw boom.notFound("NO EXISTEN USUARIOS PARA HACER ESTO");
    return users;
}

async function getCoincidencesUsers(user_to_find) {
    defaultPage = 1;
    itemsPerPage = 10;
    let getCoincidences = await getCoincidencesUsersDB(user_to_find, defaultPage, itemsPerPage);
    if(!getCoincidences) throw boom.notFound("NO HAY COINCIDENCIAS PARA TU BUSQUEDA");
    return getCoincidences;
}

async function getCoincidencesUsersDB(user_to_find, defaultPage, itemsPerPage) {
    const regex = new RegExp(user_to_find, 'i');
    return new Promise((resolve, reject) => {
        true ? UserModel.find({ $or: [ { user_name: {$regex: regex} }, { user_nickname: {$regex: regex} }, { user_email: {$regex: regex} } ] })
                        .sort('_id').paginate(defaultPage, itemsPerPage, (err, users, total) => {
            if(err) reject(err);
            if(!users) reject(boom.notFound("NO HAY USUARIOS DISPONIBLES"));
            users.forEach(user => { user.user_password = undefined; });
            resolve({users,
                total: users.length, 
                pages: parseInt(defaultPage)})
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10002'))
    });
}

async function getCountFollow(user_id) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.count({"fw_user": user_id}).exec((err, count) => {
            if(err) reject(err);
            resolve(count);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10008'))
    });
}

async function getCountFollowed(user_id) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.count({"fw_followed": user_id}).exec((err, count) => {
            if(err) reject(err);
            resolve(count);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10008'))
    });
}

function comparePasswords(receivedPwd, storedPwd) {
    return new Promise((resolve, reject) => {
        true ? bcrypt.compare(receivedPwd, storedPwd, (err, match) => {
            if(err) reject(err);
            resolve(match)
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10001'))
    });
}

async function getPaginatedUsers(defaultPage, itemsPerPage, sub) {
    return new Promise((resolve, reject) => {
        true ? UserModel.find().sort('_id').paginate(defaultPage, itemsPerPage, (err, users, total) => {
            if(err) reject(err);
            if(!users) reject(boom.notFound("NO HAY USUARIOS DISPONIBLES"));
            users.forEach(user => { user.user_password = undefined; });
            resolve({users,
                total: users.length, 
                pages: parseInt(defaultPage)})
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10002'))
    });
}

function updateUserDB(userId, dataToUpdate) {
    return new Promise((resolve, reject) => {
        true ? UserModel.findByIdAndUpdate(userId, dataToUpdate, {new: true}, (err, userUpdated) => {
            if(err) reject(err);
            if(!userUpdated) reject(boom.notFound("NO SE PUDO REALIZAR LA ACTUALIZACION"));
            userUpdated.user_password = undefined;
            resolve({user: userUpdated});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10003'))
    });
}

function updateUserImageDB(userId, file_name) {
    return new Promise((resolve, reject) => {
        true ? UserModel.findByIdAndUpdate(userId, {user_image: file_name}, {new: true}, (err, userUpdated) => {
            if(err) reject(err);
            if(!userUpdated) reject(boom.notFound("NO SE PUDO REALIZAR LA ACTUALIZACION"));
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
            resolve(undefined);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10005'))
    });
}

async function followingUsersPagination(user_id) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({"fw_user":user_id}).select({'_id':0, '__v':0, 'fw_user':0}).exec((err, follows) => {
            let follows_clean = [];
            follows.forEach((follow) => {
                console.log(follow);
                follows_clean.push(follow.fw_followed);
            });
            resolve(follows_clean);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10006'))
    });
}

async function followedUsersPagination(user_id) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({"fw_followed":user_id}).select({'_id':0, '__v':0, 'fw_followed':0}).exec((err, follows) => {
            let follows_clean = [];
            follows.forEach((follow) => {
                follows_clean.push(follow.fw_user);
            });
            resolve(follows_clean);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10007'))
    });
}

async function postsCounting(user_id) {
    return new Promise((resolve, reject) => {
        true ? PostModel.count({"post_user":user_id}).exec((err, count) => {
            if(err) reject(err);
            resolve(count);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10008'));
    });
}

async function getMostVisitedUsersDB() {
    const sortUsers = {user_visits_today: -1};
    return new Promise((resolve, reject) => {
        true ? UserModel.find().sort(sortUsers).limit(5).exec((err, users) => {
            if(err) reject(err);
            if(!users) throw boom.notFound("NO SE ENCONTRARON USUARIOS");
            users.forEach((user) => user.user_password = undefined);
            resolve(users);
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10007'))
    });
}

module.exports = {
    SaveUser, loginUser, getUser, getUsers, updateUser, uploadImage, getImageFile, getCounters, getMostVisitedUsers, getCoincidencesUsers
}