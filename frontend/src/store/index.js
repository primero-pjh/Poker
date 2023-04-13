import { createStore } from "vuex";
import { showSuccessToast, showFailToast } from 'vant';
import { showNotify, closeNotify } from 'vant';

// state, getters, mutations, actions, modules
const store = createStore({
    state : {
        socket: null,
        token: null,
        host: process.env.VUE_APP_HOST,
        height: window.screen.height,

        initDecks: [],

        user: {
            coupleInfoId: 0,
            userId: '',
            userName: '',
            phoneNumber: '',
            image: '',
            socketId: '',
            isAdmin: '',
            spousePhoneNumber: '',
        },

        couple: {
            coupleInfoId: 0,
            userId: '',
            userName: '',
            phoneNumber: '',
            image: '',
            socketId: '',
        },

        /* useful function */
        getCookie: function (name) {
            let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return value? value[2] : null;
        },
        setCookie: function (name, value, exp) {
            let date = new Date();
            date.setTime(date.getTime() + exp*24*60*60*1000);
            document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
        },
        setError: function(obj, err) {
            for(let key in err) {
                if(Object.prototype.hasOwnProperty.call(obj, key)) { 
                    obj[key] = err[key];
                }
            }
        },
        clearError: function(obj) {
            for(let key in obj) {
                obj[key] = "";
            }
        },
        axiosError: function(data) {
            /* socket id가 지정이 되지 않았을 때 */
            if(data.code == "SOCKET") {
                showFailToast({
                    message: data.message,
                    wordBreak: 'break-all',
                });
                window.location.reload();
                return;
            }
            if(data.code == "LOGIN_ERROR") {
                showFailToast({
                    message: data.message,
                    wordBreak: 'break-all',
                });
                window.location.reload();
                return;
            }
            if(!data.code) {
                showFailToast({
                    message: data.message,
                    wordBreak: 'break-all',
                });
            }
        },
        
        tempObj: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        notify: function(type, message) {
            showNotify({ 
                type,
                message,
            });
        },
        toast: function(type, message) {
            if(type == 'success') {
                message = message ? message : '성공!';
                showSuccessToast(message);
            } else if (type == 'fail' || type == 'danger') {
                message = message ? message : '실패!';
                showSuccessToast(message);
            }
        }
    },
    getters: {
        getSocket(state) { return state.socket; },
        getUser(state) { return state.user; },
    },
    mutations: {
        setSocket(state, socket) {
            state.socket = socket;
        },
        setToken(state, token) {
            state.token = token;
        },
        /* user function */
        setUser(state, user) {
            if(!user) {
                state.user.coupleInfoId = 0;
                state.user.userId = "";
                state.user.userName = "";
                state.user.image = "";
                state.user.phoneNumber = "";
                state.user.spousePhoneNumber = "";
                state.user.isAdmin = "";
            } else {
                state.user.coupleInfoId = user.coupleInfoId;
                state.user.userId = user.userId;
                state.user.userName = user.userName;
                state.user.image = user.image;
                state.user.phoneNumber = user.phoneNumber;
                state.user.spousePhoneNumber = user.spousePhoneNumber;
                state.user.isAdmin = user.isAdmin;
            }
        },
        setSocketId(state, id) {
            state.user.socketId = id;
        },

        /* couple function */
        setCouple(state, couple) {
            if(!couple) {
                state.couple.coupleInfoId = 0;
                state.couple.userId = "";
                state.couple.userName = "";
                state.couple.image = "";
                state.couple.phoneNumber = "";
                state.couple.socketId = "";
                state.couple.backgroundImage = "";
            } else {
                state.couple.coupleInfoId = couple.coupleInfoId;
                state.couple.userId = couple.userId;
                state.couple.userName = couple.userName;
                state.couple.image = couple.image;
                state.couple.phoneNumber = couple.phoneNumber;
                state.couple.socketId = couple.socketId;
                state.couple.backgroundImage = couple.backgroundImage;
            }
        },
        setCoupleSocketId(state, id) {
            state.couple.socketId = id;
        },
        logOut: function(state) {
            if(state.socket) {
                let socket = state.socket;
                socket.emit('/socket/user/logOut', {
                    user: state.user,
                    couple: state.couple,
                });
            }

            state.user.coupleInfoId = 0;
            state.user.userId = "";
            state.user.userName = "";
            state.user.image = "";
            state.user.phoneNumber = "";
            state.user.spousePhoneNumber = "";
            state.user.isAdmin = "";

            state.couple.coupleInfoId = 0;
            state.couple.userId = "";
            state.couple.userName = "";
            state.couple.image = "";
            state.couple.phoneNumber = "";
            state.couple.socketId = "";
            state.couple.backgroundImage = "";
            
            state.token = '';
            state.setCookie('token', '');
            
            window.location.reload();
        },
    },
});

export default store;