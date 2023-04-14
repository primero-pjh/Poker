const express = require('express');
const fs = require('fs');
let appRoot = require("app-root-path");
let path = appRoot.path;
const router = express.Router();
const knex = require(`${path}/db`);
const cfg = require(`${path}/config`);
const jwtFunc = require(`${path}/jwt`);
let CRT_ERROR_CODE = require(`${path}/error_code`);
const { v4 } = require('uuid');

/* image: 임시저장 */
router.get('/api/initDecks', async (req, res, next) => {
    let token = req.body.token;
    let file = req.file;
    // let info = await jwtFunc.verify(token);
    let decks = await knex.table('initDecks');
    
    return res.json({
        success: 1,
        decks
    });
});

module.exports = router;
