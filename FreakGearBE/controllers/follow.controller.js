const path = require('path');
const fs = require('fs');
const mongoosePaginate = require('mongoose-pagination');
const {UserModel} = require('../models/user');
const { FollowModel } = require('../models/follow.js');
const boom = require('@hapi/boom');

function test() {
    return "new test on follows";
}

async function saveFollow(body, sub) {
    if(body.followed == sub) throw boom.badData("NO PUEDES SEGUIRTE A TI MISMO");
    const findUser = await UserModel.findOne({_id: body.followed});
    if(!findUser) throw boom.notFound("USUARIO QUE INTENTA SEGUIR, NO EXISTE.");
    const findFollower = await FollowModel.findOne({fw_followed: body.followed, fw_user: sub});
    if(findFollower) throw boom.badData("YA SIGUES A ESTE USUARIO");
    let storedFollower = await saveFollowerDB(body, sub);
    return storedFollower;
}

async function deleteFollow(userId, followId) {
    let response = await deleteFollowerDB(userId, followId);
    return response;
}

async function getFollowingUsers(userId, query) {

    let page = 1;

    if(query.page) {
        page = query.page;
    }

    let itemsPerPage = 4;

    let getFollowingUserList = getFollowingUsersList(userId, page, itemsPerPage);

    return getFollowingUserList;
}

async function getFollowers(userId, query) {
    let page = 1;

    if(query.page) {
        page = query.page;
    }

    let itemsPerPage = 4;

    let getFollowingUserList = getFollowersUserList(userId, page, itemsPerPage);

    return getFollowingUserList;
}

async function getMyFollows(userId) {

    let myFollows = getMyFollowersUserList(userId);

    return myFollows;
}

function saveFollowerDB(body, sub) {
    return new Promise((resolve, reject) => {
        let follow = new FollowModel();
        follow.fw_user = sub;
        follow.fw_followed = body.followed;
    
        true ? follow.save((err, followStored) => {
            if(err) reject(err);
            if(!followStored) reject(boom.notFound("NO SE PUDO GUARDAR EL FOLLOWER"));
            resolve({follow: followStored})
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20001'));
    });
}

function deleteFollowerDB(userId, followedId) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({'fw_user': userId, 'fw_followed': followedId}).remove(err => {
            if(err) reject(err);
            resolve({message: 'FOLLOWER ELIMINADO'});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20002'));
    });
}

function getFollowingUsersList(userId, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({fw_user: userId}).populate({path: 'fw_followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
            if(err) reject(err);
            if(!follows) reject(boom.notFound("NO SE ENCONTRARON USUARIOS QUE SIGUE"));
            follows.forEach(follow => {follow.fw_followed.user_password = undefined; });
            resolve({total, page: parseInt(page), follows});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20003'));
    });
}

function getFollowersUserList(userId, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({fw_followed: userId}).populate('fw_user').paginate(page, itemsPerPage, (err, follows, total) => {
            if(err) reject(err);
            if(!follows) reject(boom.notFound("NO SE ENCONTRARON USUARIOS QUE SIGUE"));
            follows.forEach(follow => {follow.fw_user.user_password = undefined; });
            resolve({total, page: parseInt(page), follows});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20003'));
    });
}

function getMyFollowersUserList(userId) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({fw_user: userId}).populate('fw_user fw_followed').exec((err, follows) => {
            if(err) reject(err);
            if(!follows) reject(boom.notFound("NO SIGUES A NINGUN USUARIO"));
            follows.forEach(follow => {follow.fw_followed.user_password = undefined; follow.fw_user.user_password = undefined; });
            resolve({ follows 
            });
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20003'));
    });
}

module.exports = {
    test, saveFollow, deleteFollow, getFollowingUsers, getFollowers, getMyFollows
}