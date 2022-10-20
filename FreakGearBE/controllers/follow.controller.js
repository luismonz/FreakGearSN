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
    let storedFollower = await saveFollowerDB(body, sub);
    return storedFollower;
}

function saveFollowerDB(body, sub) {
    return new Promise((resolve, reject) => {
        let follow = new FollowModel();
        follow.fw_user = sub;
        follow.fw_followed = body.followed;
    
        true ? follow.save((err, followStored) => {
            if(err) throw err;
            if(!followStored) throw boom.notFound("NO SE PUDO GUARDAR EL FOLLOWER");
            resolve({follow: followStored})
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 20001'));
    });
}

module.exports = {
    test, saveFollow
}