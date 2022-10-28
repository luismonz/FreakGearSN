const {UserModel} = require('../models/user');
const { FollowModel } = require('../models/follow.js');
const { PostModel } = require('../models/posts');
const mongoosePagination = require('mongoose-pagination');
const boom = require('@hapi/boom');
const moment = require('moment');

async function savePost(userId, body) {
    let post = new PostModel();
    post.post_user = userId;
    post.post_text = body.post_text;
    if(body.post_file) post.post_file = body.post_file;
    else post.post_file = "";
    post.post_created_at = moment().unix();
    let postStored = await savePostDB(post);
    return postStored;
}

async function getPostsFromPeopleIFollow(userId, query) {
    let page = query.page ? query.page : 1;

    let itemsPerPage = 10;

    let getPeople = await getPeopleIFollow(userId);
    let getPosts = await getPostByPeopleIFollow(userId, getPeople, page, itemsPerPage);

    return getPosts;

}

async function getMyPosts(userId, query) {

    let foundUser = await UserModel.findById(userId);

    if (!foundUser) {
        throw boom.notFound('USER DOES NOT EXISTS!');
    }

    let page = query.page ? query.page : 1;

    let itemsPerPage = 10;

    let getPosts = await getPostsFromUser(userId, page, itemsPerPage);

    return getPosts;

}

async function getPostById(postId) {
    let getPost = await getPostFromDB(postId);
    return getPost;
}

async function deletePostById(userId, postId) {
    try {
        let getPostById = await getPostFromDB(postId);
        if(getPostById.post_user != userId) throw boom.unauthorized("NO PUEDES ELIMINAR POSTS DE OTRAS PERSONAS");
        let deletedPost = await removePostFromDB(postId);
        return deletedPost;
    }
    catch(err) {
        throw err;
    }
}

async function uploadImagePost(userId, postId, fileReq) {
    let getPostById = await getPostFromDB(postId);
    if(getPostById.post_user != userId) throw boom.unauthorized("NO PUEDES EDITAR POSTS DE OTRAS PERSONAS");

    if(fileReq) {
        let file_path = fileReq.image.path;
        let file_name = file_path.split('\\')[2];

        let updatedPost = updateUserImageDB(postId, file_name);
        
        return updatedPost;
    }

    throw boom.notFound("NO HAY IMAGENES PARA SUBIR");
    
}

function savePostDB(publicationObj) {
    return new Promise((resolve, reject) => {
        true ? publicationObj.save((err, postStored) => {
            if(err) reject(err);
            if(!postStored) reject(boom.internal("ERROR AL GUARDAR POST"));
            resolve({post: postStored});
        }) : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30001"));
    });
}

function getPeopleIFollow(userId) {
    return new Promise((resolve, reject) => {
        true ? FollowModel.find({fw_user: userId}).populate('fw_followed').exec((err, follows) => {
            if(err) reject(err);
            let follows_clean = [];
            follows.forEach((follow) => {
                follow.fw_followed.user_password = undefined;
                follows_clean.push(follow.fw_followed);
            });
            resolve(follows_clean);
        }) : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30002"));
    });
}

function getPostByPeopleIFollow(userId, peopleIFollow, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        true ? PostModel.find({post_user: {"$in": peopleIFollow}}).sort('post_created_at').populate('post_user')
                                .paginate(page, itemsPerPage, (err, posts, totalPosts) => {
                                    if(err) reject(err);
                                    if(!posts) reject(boom.notFound("NO SE ENCONTRARON POSTS"));
                                    posts.forEach(post => post.post_user.user_password = undefined);
                                    resolve({total_items: totalPosts, posts, page: parseInt(page), TotalPages: Math.ceil(totalPosts/itemsPerPage)});
    }) : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30003"));
    });
}

function getPostsFromUser(userId, page, itemsPerPage) {
    return new Promise((resolve, reject) => {
        true ? PostModel.find({post_user: userId}).sort('post_created_at').populate('post_user')
                                .paginate(page, itemsPerPage, (err, posts, totalPosts) => {
                                    if(err) reject(err);
                                    if(!posts) reject(boom.notFound("NO SE ENCONTRARON POSTS"));
                                    posts.forEach(post => post.post_user.user_password = undefined);
                                    resolve({total_items: totalPosts, posts, page: parseInt(page), TotalPages: Math.ceil(totalPosts/itemsPerPage)});
    }) : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30003"));
    });
}

async function getPostFromDB(postId) {
    return new Promise((resolve, reject) => {
        true ? PostModel.findById(postId, (err, post) => {
            if(err) reject(err);
            if(!post) reject(boom.notFound("NO EXISTE EL POST QUE BUSCAS"));
            resolve(post);
        }) : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30004"));
    });
}

async function removePostFromDB(postId) {
    return new Promise((resolve, reject) => {
        true ? PostModel.findByIdAndRemove(postId, (err, postRemoved) => {
            if(err) reject(err);
            if(!postRemoved) reject(boom.internal("NO SE PUDO ELIMINAR EL POST"));
            resolve({message: 'POST ELIMINADO EXITOSAMENTE'});
        })
        : reject(new Error("HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 30005"));
    });
}

function updateUserImageDB(postId, file_name) {
    return new Promise((resolve, reject) => {
        true ? PostModel.findByIdAndUpdate(postId, {post_file: file_name}, {new: true}, (err, postUpdated) => {
            if(err) reject(err);
            if(!postUpdated) reject(boom.notFound("NO SE PUDO REALIZAR LA ACTUALIZACION"));
            resolve({post: postUpdated});
        }) : reject(new Error('HA OCURRIDO UN ERROR EN UNA VALIDACION INTERNA. 10004'))
    });
}

module.exports = { savePost, getPostsFromPeopleIFollow, getPostById, deletePostById, uploadImagePost, getMyPosts }