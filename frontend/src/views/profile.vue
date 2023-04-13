<template>
    <div id="settingVue" style="height: 100%; overflow-y: scroll;">
        <layoutVue
            ref="layoutVue">
            <template v-slot:body>
                <div id="backgroundImage" 
                style="display: flex; flex-direction: column; height: 100%; justify-content: end;
                    background-color: #aaa;
                    background-repeat: no-repeat; background-attachment: fixed; background-size: 100% 100%;"
                    :style="{backgroundImage: $store.state.host + $store.state.couple.backgroundImage}"
                    @click="clickImage">
                    <div style="height: 100%;" class="pa-md">
                        <div style="color: white; ">
                            <van-uploader :before-read="beforeRead">
                                <van-icon name="back-top" style="transform: rotate(180deg);" />
                            </van-uploader>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <div class="pr-md">
                            <template v-if="user.image">
                                <van-image :src="$store.state.host + user.image" fit="cover"
                                    style="width: 60px; height: 60px; border-radius: 15px;" round />
                            </template>
                            <template v-else>
                                <van-image :src="$store.state.host + '/images/default_avatar.png'" fit="cover"
                                    style="width: 60px; height: 60px; border-radius: 15px;" round />
                            </template>
                            <div style="color: white;" class="w100p text-center">{{ user.userName }}</div>
                        </div>
                        <div>
                            <template v-if="couple.image">
                                <van-image :src="$store.state.host + couple.image" fit="cover"
                                    style="width: 60px; height: 60px; border-radius: 15px;" round />
                            </template>
                            <template v-else>
                                <van-image :src="$store.state.host + '/images/default_avatar.png'" fit="cover"
                                    style="width: 60px; height: 60px;" round />
                            </template>
                            <div style="color: white;" class="w100p text-center">{{ couple.userName }}</div>
                        </div>
                    </div>
                    <van-divider style="background-color: #aaa;"></van-divider>
                    <div style="min-height: 50px; display: flex; align-items: center; justify-content: center;">
                        <van-uploader :before-read="beforeReadMyImage">
                            <div style="display:flex; flex-direction: column; align-items: center;"
                                class="pr-md">
                                <div>
                                    <van-icon name="edit" style="color: white;" size="25" />
                                </div>
                                <div class="text-white ft-xs">프로필 편집</div>
                            </div>
                        </van-uploader>
                        <div style="display:flex; flex-direction: column; align-items: center;"
                            @click="logOut">
                            <div>
                                <van-icon name="cross" style="color: white;" size="25" />
                            </div>
                            <div class="text-white ft-xs" >로그아웃</div>
                        </div>
                    </div>
                </div>
            </template>
        </layoutVue>
    </div>
</template>

<script>
import layoutVue from "@/components/Layout.vue"
import axios from 'axios';
import { showNotify } from 'vant';
export default {
    name: 'settingVue',
    components: {
        layoutVue
    },
    data() {
        return {
            isShow: false,
            actions: [
                { name: 'English' },
                { name: 'Korea' },
            ],
        }
    },
    computed: {
        user: function() {
            return this.$store.state.user;
        },
        couple: function() {
            return this.$store.state.couple;
        },
    },
    methods: {
        clickImage: function() {
            let vm = this;
        },
        /* background-image */
        beforeRead: function(file) {
            let vm = this;
            let form_data = new FormData();
            form_data.append('file', file);
            form_data.append('token', vm.$store.state.token);
            form_data.append('coupleInfoId', vm.$store.state.user.coupleInfoId);
            axios.post(`${vm.$store.state.host}/api/user/upload/backImage`, form_data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                let data = res.data;
                if(data.success) {
                    vm.$store.state.notify('success', data.message);
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'message')) {
                        vm.$store.state.notify('danger', data.message);
                    }
                }
            });
        },
        /* personal-image */
        beforeReadMyImage: function(file) {
            let vm = this;
            let form_data = new FormData();
            form_data.append('file', file);
            form_data.append('token', vm.$store.state.token);
            axios.post(`${vm.$store.state.host}/api/user/upload/image`, form_data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                let data = res.data;
                if(data.success) {
                    vm.$store.state.user.image = data.image_path;
                    vm.$store.state.notify('success', data.message);
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'message')) {
                        vm.$store.state.notify('danger', data.message);
                    }
                }
            });
        },
        onSelect: function(arg) {
            let vm = this;
            let name = arg.name;
            if(name == 'English') {
                vm.$i18n.locale = 'en';
            } else {
                vm.$i18n.locale = 'ko';
            }
            showNotify({ type: 'success', message: '변경 완료!' });
            vm.isShow = false;
        },
        logOut: function() {
            let vm = this;
            vm.$store.commit("logOut");
        },  
        i18Change: function() {
            let vm = this;
            vm.isShow = true;
        },
    },
    mounted() {
        let vm = this;
        if(!vm.$store.state.user.socketId) {
            vm.$router.push('/login');
        }
        if(vm.$store.state.couple.backgroundImage) {
            document.getElementById("backgroundImage").style.backgroundImage = 
               `url('${vm.$store.state.host}${vm.$store.state.couple.backgroundImage}`;
        }
        vm.socket = vm.$store.state.socket;
        vm.socket.on("/client/profile/change/image", (data) => {
            if(data.type == 'back') {
                document.getElementById("backgroundImage").style.backgroundImage = 
                    `url('${vm.$store.state.host}${vm.$store.state.couple.backgroundImage}`;
                vm.$store.state.couple.backgroundImage = data.image_path;
            } else {
                vm.$store.state.couple.image = data.image_path;
            }
        });

    }
}
</script>