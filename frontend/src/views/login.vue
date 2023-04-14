<template>
    <div id="loginVue">
        <div>
            <q-input filled placeholder="아이디를 입력하세요." dense
                label="아이디"
                :error="(formError.userId)?true:false" :error-message="formError.userId" />
            <q-input filled placeholder="패스워드를 입력하세요." dense
                label="패스워드"
                :error="(formError.password)?true:false" :error-message="formError.password" />
            <q-btn label="LOGIN" color="primary" style="width: 100%;" />
            <q-btn class="q-mt-sm" label="QUSET LOGIN" color="primary" style="width: 100%;" 
                @click="goto_home" />
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { io } from "socket.io-client";

export default {
    name: 'loginVue',
    components: {
    },
    data() {
        return {
            showSplash: false,
            host: process.env.VUE_APP_HOST,

            appUser: {
                userId: '',
                password: '',
                rememberMe: true,
                couple: '',
                phoneNumber: '',
            },
            formError: {
                userId: '',
                password: '',
            },
            isLoading: false,
        }
    },
    methods: {
        goto_home() {
            let vm = this;
            vm.$router.push("/home");
        },
        onLogin: function() {
            let vm = this;
        },
    },
    mounted: function() {
        let vm = this;
        let token = vm.$store.state.getCookie("token");
        if(token === 'undefined' || !token) { return; }
        
        if(token) {
            axios.get('/api/user/check', {
                params: { 
                    token,
                }
            }).then((res) => {
                let data = res.data;
                if(data.success) {
                    vm.$store.commit("setUser", data.user);
                    vm.$store.commit("setToken", token);
                    vm.setSocket(token, function() {
                        if(data.user.spousePhoneNumber && data.user.coupleInfoId > 0) {
                            vm.$store.commit("setCouple", data.couple);
                            if(data.coupleSocketId) {
                                vm.$store.commit("setCoupleSocketId", data.coupleSocketId);
                            }
                            setTimeout(() => { vm.$router.push('/home'); }, 1000);
                            /* local test 시에만 
                                => 원래는 서버에서 처리하는데 
                                    port 번호가 다르기 때문에
                                    local 환경에서 저장이 안됨 
                            */
                            vm.$store.state.setCookie("token", token, "3600m");
                        } else {
                            setTimeout(() => { vm.$router.push("/waiting"); }, 1000);
                        }
                    });
                } 
            });
        }
    },
    created: function() {
        let vm = this;
        vm.$router.push("/home");
        let token = vm.$store.state.getCookie("token");
        /* 자동로그인을 위한 splash 화면 */
        if(token) { vm.showSplash = true; }
    },
}
</script>
