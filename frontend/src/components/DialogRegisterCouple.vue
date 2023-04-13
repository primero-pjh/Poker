<template>
    <van-dialog v-model:show="isOpen" title="확인" >
        <van-form @submit="confirm">
            <van-cell-group inset>
                <van-field
                    v-model="phoneNumber" 
                    required
                    name="phoneNumber"
                    :label="$t('phoneNumber')"
                    :placeholder="$t('phoneNumber')"
                    :rules="[{ required: true, message: $t('RequiredPhoneNumber') }]"
                    :error="formError.phoneNumber.length > 0"
                    :error-message="formError.phoneNumber"
                />
            </van-cell-group>
        </van-form>
        <template #footer>
            <van-button style="width: 100%;" 
                @click="confirm" 
                :loading="isLoading" loading-text="상대방에게 요청을 보냈습니다..">
                {{$t('Confirm')}}
            </van-button>
        </template>
    </van-dialog>
  
</template>

<script>
// import axios from 'axios';
export default {
    name: 'DialogRegisterCouple',
    data() {
        return {
            isLoading: false,
            show: true,
            phoneNumber: '',
            isOpen: false,
            formError: {
                phoneNumber: '',
            },
            callback: null,
        }
    },
    methods: {
        open: function(callback) {
            let vm = this;
            if(callback) { vm.callback = callback }
            vm.isOpen = true;
        },  
        confirm: function() {
            let vm = this;
            if(!vm.phoneNumber) {
                vm.formError.phoneNumber = "필수입력 항목입니다.";
                return;
            }
            let regex = /^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/;
            if(regex.test(vm.phoneNumber) == false) {
                vm.formError.phoneNumber = "형식이 틀립니다. 다시 시도해주세요. 예)010-0000-0000";
                return;
            }
            
            for(let k in vm.formError) {
                vm.formError[k] = "";
            }
            vm.isLoading = true;
        
        },  
    },
    mounted: function() {
        
    }
}
</script>