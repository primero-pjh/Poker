let appRoot = require("app-root-path");
let path = appRoot.path;
let CRT_ERROR_CODE = require(`${path}/error_code`);

module.exports = function(socket) {
    socket.on("/socket/user/connect", async (data, callback) => {
        let user_dict = require(`${path}/app`)["user_dict"];
        let io = require(`${path}/bin/www`)["io"];

        if(!data.user.socketId) {
            return callback({
                success: 0,
                code: "SOCKET",
                message: CRT_ERROR_CODE["SOCKET"],
            });
        }
        if(!data.user.phoneNumber) {
            return callback({
                success: 0,
                code: "LOGIN_ERROR",
                message: CRT_ERROR_CODE["LOGIN_ERROR"],
            });
        }

        /* 관리자에게 유저 정보 전달 */
        io.to("admin").emit(`/client/admin/connect/user`, {
            phoneNumber: data.user.phoneNumber,
            socketId: data.user.socketId,
        });
        if(data.user.phoneNumber && data.user.socketId) {
            user_dict[data.user.phoneNumber] = {
                socketId: data.user.socketId,
                userName: data.user.userName,
                coupleInfoId: data.user.coupleInfoId > 0 ? data.user.coupleInfoId : 0,
            };
        }

        /* 만약 커플이 로그인 되어 있으면 정보 줘야 함 */
        if(user_dict.hasOwnProperty(data.user.spousePhoneNumber) ) {
            let key = user_dict[data.user.spousePhoneNumber].socketId;
            io.to(key).emit(`/client/couple/login`, {
                socketId: socket.id,
            });
        }
        if(data.user.coupleInfoId != 0) {
            /* couple 전용 room 으로 입장 */
            socket.join(`/${data.user.coupleInfoId}`);
        }
        return callback({
            success: 1,
        });
    });
};