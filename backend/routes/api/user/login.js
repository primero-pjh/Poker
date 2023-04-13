const express = require('express');
let appRoot = require("app-root-path");
let path = appRoot.path;
const router = express.Router();
const knex = require(`${path}/db`);
const cfg = require(`${path}/config`);
const jwt = require('jsonwebtoken');
let CRT_ERROR_CODE = require(`${path}/error_code`);

/* 
    user의 login controller
*/
router.get('/api/user/login', async function(req, res, next) {
    let user_dict = require(`${path}/app`)["user_dict"];
    let userId = req.query.userId;
    let password = req.query.password;
    let rememberMe = req.query.rememberMe;
    
    let error = new Object();
    if(!userId) { error["userId"] = "필수입력 항목입니다!"; }
    if(!password) { error["password"] = "필수입력 항목입니다!"; }
    if(Object.keys(error).length > 0) {
        return res.json({
            success: 0,
            error: error,
        });
    }

    let user = await knex.table('appUsers as u')
        .select('u.userId', 'u.UID', 'u.spousePhoneNumber', 'u.phoneNumber', 'u.image', 'u.userName',
            'u.isAdmin', 'u.coupleInfoId')
        .where("u.userId", userId)
        .andWhere("u.password", password).first();

    /* user null check */
    if(!user) {
        error["userId"] = "존재하지 않는 아이디!";
        return res.json({
            success: 0,
            error,
        });
    }

    /* get couple info */
    let couple = null;
    if(user.spousePhoneNumber) {
        couple = await knex.table('appUsers as u')
        .select('u.userId', 'u.UID', 'u.spousePhoneNumber', 'u.phoneNumber', 'u.image', 
            'u.userName', 'u.coupleInfoId', 'ci.backgroundImage')
        .join('coupleInfos as ci', 'u.coupleInfoId', '=', 'ci.coupleInfoId')
        .where('u.phoneNumber', user.spousePhoneNumber).first();
    }
    
    /* set cookie */
    let token = null;
    if(rememberMe == 1) {
        token = jwt.sign({ 
            userId: userId,
            UID: user.UID
        }, 
        cfg.jwtKey, 
        {
            expiresIn: "1 days",
        });
        res.cookie('token', token);
    }

    /* couple socketId */
    let coupleSocketId = "";
    if(couple) {
        if(user_dict.hasOwnProperty(couple.phoneNumber)) {
            coupleSocketId = user_dict[couple.phoneNumber].socketId;
        }
    }

    return res.json({
        success: 1,
        token,
        user,
        couple,
        coupleSocketId,
    });
});

module.exports = router;
