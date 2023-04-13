<template>
    <div id="loginVue" 
        style="background-color: #eff2f5; height: 100%; width: 100%; padding-top: 30px;">
        <van-form @submit="onLogin">
            <van-cell-group inset>
                <van-field v-model="appUser.userId" required 
                    name="Username" :label="$t('userId')"
                    placeholder="Username" :rules="[{ required: true, message: $t('RequireduserId') }]"
                    :error="formError.userId.length > 0" :error-message="formError.userId"
                />
                <van-field v-model="appUser.password" required
                    type="password" name="Password" :label="$t('password')"
                    placeholder="Password" :rules="[{ required: true, message: $t('Requiredpassword') }]"
                    :error="formError.password.length > 0" :error-message="formError.password"
                />
                <van-cell center :title="$t('RememberMe')">
                    <template #right-icon>
                        <van-switch v-model="appUser.rememberMe" />
                    </template>
                </van-cell>
            </van-cell-group>
            <div style="margin: 16px; text-align: center;">
                <van-space direction="vertical" fill style="display: flex; align-items: center;">
                    <van-button block 
                        type="primary" native-type="submit"
                        style="width: 278px; max-width: 278px;"
                        :disabled="!appUser.userId || !appUser.password"
                        :loading="isLoading"
                        :loading-text="$t('Loading')">
                        {{$t('Login')}}
                    </van-button>
                    <van-button block 
                        type="primary" @click="onLoginGuest"
                        style="width: 278px; max-width: 278px;"
                        :loading="isLoading"
                        :loading-text="$t('Loading')">
                        게스트 로그인
                    </van-button>
                </van-space>
                </div>
                <van-row justify="space-between" style="padding: 0px 16px;">
                    <van-col span="12">
                        <p style="text-decoration: underline;" class="text-grey ft-xs">
                            {{$t('ForgetId')}}
                        </p>
                    </van-col>
                    <van-col span="12" style="text-align: right;">
                        <p style="text-decoration: underline;" class="text-grey ft-xs">
                            {{$t('Signup')}}
                        </p>
                    </van-col>
                </van-row>
            </van-form>
        <DialogRegisterCouple ref="DialogRegisterCouple" />
        <van-overlay :show="showSplash" @click="show=false">
            <div @click.stop 
                style="background-color: white; width: 100%; height: 100%; display: flex;
                        align-items: center;
                        justify-content: center;">
                <div class="block">
                    <van-image width="100" height="100" :src="host + '/images/doge_v3.png'" />
                    <br/>
                </div>
            </div>
        </van-overlay>
    </div>
</template>

<script>
import axios from 'axios';
import DialogRegisterCouple from '../components/DialogRegisterCouple.vue';
import { io } from "socket.io-client";
import { showFailToast, showConfirmDialog } from 'vant';
import { showNotify } from 'vant';

export default {
    name: 'loginVue',
    components: {
        DialogRegisterCouple,
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
        onLogin: function() {
            let vm = this;
            vm.showSplash = true;
            vm.isLoading = true;
            axios.get(`/api/user/login`, {
                params: {
                    userId: vm.appUser.userId,
                    password: vm.appUser.password,
                    rememberMe: (vm.appUser.rememberMe) ? 1 : 0,
                }
            }).then(function(res) {
                let data = res.data;
                if(data.success) {
                    vm.$store.commit("setUser", data.user);
                    vm.$store.commit("setToken", data.token);
                    vm.setSocket(data.token, function() {
                        if(data.user.isAdmin) {
                            return showConfirmDialog({
                                title: '확인',
                                message: '어드민 페이지로 이동하시겠어요?',
                            }).then(() => {
                                window.location.href = 'https://admin.pritras.com';
                            }).catch(() => {
                                setTimeout(() => {
                                    vm.$router.push('/home');
                                }, 1000);
                            });
                        }
                        if(data.user.spousePhoneNumber) {
                            vm.$store.commit('setCouple', data.couple);
                            if(data.coupleSocketId) {
                                vm.$store.commit('setCoupleSocketId', data.coupleSocketId);
                            }
                            setTimeout(() => {
                                vm.$router.push('/home');
                            }, 1000);
                            
                            /* local test 시에만 
                                => 원래는 서버에서 처리하는데 
                                    port 번호가 다르기 때문에
                                    local 환경에서 저장이 안됨 
                            */
                            vm.$store.state.setCookie('token', data.token, '3600m');
                        } else {
                            vm.$router.push('/waiting');
                        }
                    });
                    
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'error')) {
                        vm.$store.state.setError(vm.formError, data.error);
                    }
                    if(Object.prototype.hasOwnProperty.call(data, 'message')) {
                        vm.$store.state.axiosError(data);     
                    }
                }
                // vm.isLoading = false;
                // vm.showSplash = false;
            });
        },
        onLoginGuest: function() {
            let vm = this;
            vm.$router.push('/home');
        },
        setSocket: function(token, callback) {
            let vm = this;
            let socket = io(`${process.env.VUE_APP_HOST}`, {
                auth: { token: `Bearer ${token}` },
            });
            socket.on("connection", (socket_id) => {
                vm.$store.commit("setSocketId", socket_id);
                socket.emit("/socket/user/connect", {
                    user: vm.$store.state.user,
                }, function(data, err) {
                    if(data.success) {
                        if(callback) { callback(); }
                    } else {
                        vm.$store.state.axiosError(data);
                        
                    }
                });
            });

            /* admin => 강제 종료 */
            socket.on(`disconnected`, () => {
                vm.$store.state.setCookie("token", "");
                window.location.reload();
            });
        
            /* middle ware check next */
            socket.on(`/error`, (data) => {
                showFailToast({
                    message: data.message,
                    wordBreak: 'break-all',
                    className: 'w90p',
                });
                vm.$store.commit("setSocket", null);
                vm.$store.commit("setToken", null);
                vm.$store.commit("setUser", null);
                vm.$store.commit("setCouple", null);
                vm.$store.state.setCookie("token", "");
                vm.$router.push("/login");
            });

            /* 커플이 connect or login 하였을 때 */
            socket.on(`/client/couple/login`, (data) => {
                vm.$store.state.notify('success', `${vm.$store.state.couple.userName}님이 접속하였습니다.`);
                vm.$store.commit("setCoupleSocketId", data.socketId);
            });
            /* 커플이 disconnect or logout 하였을 때 */
            socket.on(`/client/couple/logOut`, (data) => {
                // vm.$store.state.notify('success', `${vm.$store.state.couple.userName}님이 로그아웃하셨습니다.`);
                vm.$store.state.couple.socketId = '';
            });
        
            vm.$store.commit("setSocket", socket);
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
                        if(data.user.isAdmin) {
                            return showConfirmDialog({
                                title: '확인',
                                message: '어드민 페이지로 이동하시겠어요?',
                            }).then(() => {
                                window.location.href = 'https://admin.pritras.com';
                            }).catch(() => {
                                vm.$router.push('/home');
                            });
                        }
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
        let token = vm.$store.state.getCookie("token");
        /* 자동로그인을 위한 splash 화면 */
        if(token) { vm.showSplash = true; }
    },
}
</script>
