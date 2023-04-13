let appRoot = require("app-root-path");
let path = appRoot.path;
let CRT_ERROR_CODE = require(`${path}/error_code`);
let knex = require(`${path}/db`);

module.exports = function(socket) {
    socket.on("/socket/message/send", async (data, callback) => {
        let user_dict = require(`${path}/app`)["user_dict"];
        let io = require(`${path}/bin/www`)["io"];
        let redisCli = require(`${path}/bin/www`)["redisCli"];

        if(!user_dict.hasOwnProperty(data.user.phoneNumber)) {
            io.to(socket.id).emit(`/error`, {
                success: 0,
                code: "LOGIN_ERROR",
                message: CRT_ERROR_CODE["LOGIN_ERROR"],
            });
            return;
        }
        /* 만약 커플이 로그인 되어 있으면 정보 줘야 함 */
        if(!data.user.spousePhoneNumber) { 
            io.to(socket.id).emit(`/error`, {
                success: 0,
                code: "LOGIN_ERROR",
                message: CRT_ERROR_CODE["LOGIN_ERROR"],
            });
            return;
        }
        if(!data.user.phoneNumber) { 
            io.to(socket.id).emit(`/error`, {
                success: 0,
                code: "LOGIN_ERROR",
                message: CRT_ERROR_CODE["LOGIN_ERROR"],
            });
            return;
        }

        if(!data.message) {
            return callback({
                success: 0,
                message: '입력할 메시지를 적어주세요.'
            });
        }

        let message_list = JSON.parse(await redisCli.get(`/${data.user.coupleInfoId}`));
        let message = {
            userName: data.user.userName,
            message: data.message,
            sendDate: new Date(), 
        };
        message_list.push(message);

        await redisCli.set(`/${data.user.coupleInfoId}`, JSON.stringify(message_list));

        io.to(`/${data.user.coupleInfoId}`).emit("/client/message/receive", message);
        return callback({
            success: 1,
            message: '전송 완료'
        });
    });
};