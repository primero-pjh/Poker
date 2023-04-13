<template>
    <div id="waitingVue" style="background-color: #eff2f5; height: 100%; position: relative; padding-top: 30px;">
        <van-form @submit="onConfirm">
            <van-cell-group inset style="border: 1px solid #aaa;">
                <van-field
                    v-model="phoneNumber" 
                    required
                    name="phoneNumber"
                    :label="$t('phoneNumber')"
                    :placeholder="$t('phoneNumber')"
                    :rules="[{ required: true, message: $t('RequiredPhoneNumber') }]"
                    :error="form_error.phoneNumber.length > 0"
                    :error-message="form_error.phoneNumber"
                />
                <van-button style="width: 100%;"  @click="onConfirm" 
                    :loading="isLoading" loading-text="상대방에게 요청을 보냈습니다..">
                    {{$t('Confirm')}}
                </van-button>
                <div class="w100p text-center">
                    <p>요청이 오기를 기다리거나, 요청을 하세요.
                        
                    </p>
                    <van-button v-if="isLoading==true" @click="isLoading=false;">취소</van-button>
                </div>
            </van-cell-group>
        </van-form>
    </div>
</template>

<script>
// import axios from 'axios';
import { showFailToast, showConfirmDialog } from 'vant';

export default {
    name: 'waitingVue',
    data() {
        return {
            phoneNumber: '',
            isLoading: false,
            form_error: {
                phoneNumber: '',
            },
        }
    },
    methods: {
        onConfirm: function() {
            let vm = this;
            vm.$store.state.clearError(vm.form_error);
            vm.isLoading = true;
            let socket = vm.$store.state.socket;
            let form_data = new Object();
            form_data["socketId"] = vm.$store.state.user.socketId;
            form_data["user"] = vm.$store.state.user;
            form_data["phoneNumber"] = vm.phoneNumber;
            socket.emit(`/socket/couple/request`, form_data, function(data, err) {
                if(data.success) {
                    // console.log(data);
                } else {
                    vm.$store.state.setError(vm.form_error, data.error);
                    vm.isLoading = false;
                }
            });
        },
        
    },
    mounted: function() {
        let vm = this;
        let socket = vm.$store.state.socket;
        /* 상대방이 커플 신청 요청 */
        socket.on(`/client/couple/request`, (data) => {
            showConfirmDialog({
                title: '요청',
                message: `${data.phoneNumber}님으로 부터 신청! \n수락하시겠어요?`,
                'confirm-button-text': "수락"
            }).then(() => {
                socket.emit(`/socket/couple/request/confirm`, {
                    isConfirm: 1,
                    myPhone: vm.$store.state.user.phoneNumber,
                    otherPhone: data.phoneNumber,
                }, (data, err) => {
                    if(data.success) {
                        vm.$store.commit("setCouple", data.couple);
                        vm.$store.commit("setCoupleSocketId", data.coupleSocketId);
                        vm.$router.push('/calendar');
                    }
                });
            }).catch(() => {
                socket.emit(`/socket/couple/request/confirm`, {
                    isConfirm: 0,
                    myPhone: vm.$store.state.user.phoneNumber,
                    otherPhone: data.phoneNumber,
                }, (data, err) => {
                    
                });
            });
        });

        /* 커플 신청 결과 반환 */
        socket.on(`/client/couple/request/confirm`, (data) => {
            if(data.success) {
                vm.$store.commit("setCouple", data.couple);
                vm.$store.commit("setCoupleSocketId", data.coupleSocketId);
                vm.$router.push('/calendar');
            } else {
                vm.isLoading = false;
                showFailToast('상대방이 신청을 거절하였습니다.');
            }
        });
    }
}
</script>
