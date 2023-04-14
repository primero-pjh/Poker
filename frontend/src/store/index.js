import { createStore } from "vuex";

// state, getters, mutations, actions, modules
const store = createStore({
    state : {
        socket: null,
        token: null,
        host: process.env.VUE_APP_HOST,
        height: window.screen.height,

        initDecks: [],

        user: {
            userId: '',
            userName: '',
            phoneNumber: '',
            coverImage: '',
            socketId: '',
            isAdmin: '',
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
        },
        
        tempObj: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        notify: function(type, message) {
        },
        toast: function(type, message) {
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