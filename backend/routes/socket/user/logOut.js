let appRoot = require("app-root-path");
let path = appRoot.path;
let CRT_ERROR_CODE = require(`${path}/error_code`);

module.exports = function(socket) {
    socket.on("/socket/user/logOut", async (data, callback) => {
        let user_dict = require(`${path}/app`)["user_dict"];
        let io = require(`${path}/bin/www`)["io"];

        if(user_dict.hasOwnProperty(data.couple.phoneNumber)) {
            io.to(user_dict[data.couple.phoneNumber].socketId).emit('/client/couple/logOut');
        }

        // let map = io.sockets.adapter.rooms;
    });
};