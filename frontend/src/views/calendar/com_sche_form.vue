<template>
  <div id="com_sche_form" >
        <van-action-sheet v-model:show="isOpen">
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: white; border-bottom: 1px solid #eee;" 
                class="pa-md">
                <div @click="isOpen=false;" class="text-grey">취소</div>
                <div class="text-bold">스케줄<van-icon name="smile-o" color="red" /></div>
                <div @click="onSave" class="text-grey">저장</div>
            </div>
            
            <div style="height: 100%; background-color: #f2f2f2;">
                <div style="min-height: 300px; max-height: 300px; overflow-y: scroll;">
                    <div class="pt-md">
                        <van-field v-model="schedule.title" 
                            name="title" placeholder="제목 *"
                            :error="form_error.title.length > 0" :error-message="form_error.title"
                        />
                    </div>
                    <div class="pt-md" style="position: relative;">
                        <van-collapse v-model="colorActive" >
                            <van-collapse-item name="1" >
                                <template #title>
                                    <div style="display: flex; justify-content: space-between;">
                                        <div>색깔</div>
                                        <div>{{ schedule.color }}</div>
                                    </div>
                                </template>
                                <template v-for="(row,idx) in color_list" :key="idx">
                                    <div style="height: 20px; padding: 10px 16px; display: flex; align-items: center;"
                                        @click="clickColor(row)">
                                        <div class="pr-sm">{{ row }}</div>
                                        <div style="width:10px;height:10px;border-radius: 15px;"
                                            :style="{backgroundColor: row}">
                                        </div>
                                    </div>
                                </template>
                            </van-collapse-item>
                        </van-collapse>
                    </div>
                    <div class="pt-md" style="position: relative;">
                        <div style="width: 100%;" class="bg-white">
                            <div style="padding: 10px 16px; font-size: 14px; height: 24px; display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    시작일 *
                                </div>
                                <div style="padding-right: 20px;">
                                    {{ schedule.startDate }}
                                </div>
                            </div>
                        </div>
                        <van-collapse v-model="dateActive" style="background-color: red;">
                            <van-collapse-item name="1" style="background-color: yellow;">
                                <template #title>
                                    <div style="display: flex; justify-content: space-between;">
                                        <div>종료일 *</div>
                                        <div>{{ schedule.endDate.join("-") }}</div>
                                    </div>
                                </template>
                                <van-date-picker v-model="schedule.endDate" 
                                    :show-toolbar="false" :min-date="minDate" :max-date="maxDate">
                                </van-date-picker>
                            </van-collapse-item>
                        </van-collapse>
                    </div>
                    <div class="pt-md">
                        <van-field v-model="schedule.memo" 
                            name="title"
                            placeholder="메모 ( 500자 이내 )" 
                            type="textarea"
                            autosize 
                            maxlength="500" show-word-limit
                            rows="1" />
                    </div>
                    <van-divider></van-divider>
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
export default {
    name: 'com_sche_form',
    data() {
        return {
            isOpen: false,
            callback: null,
            standardDate: new Date(),

            schedule: {
                title: '',
                color: '',
                startDate: '',
                endDate:  [],
                memo: '',
            },
            form_error: {
                title: '',
                startDate: '',
                endDate: ''
            },

            color_list: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink'],

            
            colorActive: [],
            dateActive: [],
            minDate: new Date(2023, 1, 1),
            maxDate: new Date(2023, 12, 28),
        }
    },
    methods: {
        clearForm: function() {
            let vm = this;
            vm.schedule.title = '';
            vm.schedule.startDate = '';
            vm.schedule.endDate = [];
            vm.schedule.memo = '';
        },
        open: function(selectDate, callback) {
            let vm = this;
            vm.$store.state.clearError(vm.form_error);
            /* error check */
            let arr_date = selectDate.split('-');
            if(arr_date.length != 3) {
                vm.isOpen = false;
                vm.$store.state.notify('danger', '날짜 선택이 잘못되었습니다. 다시 시도해주세요.');
                return;
            }
            if(callback) { vm.callback = callback; }
            /* 시작일 설정 */
            vm.schedule.startDate = selectDate;
            /* 종료일 설정 */
            vm.schedule.endDate = [arr_date[0], arr_date[1], arr_date[2]];

            /* min, max 정의 */
            let date = new Date(selectDate);
            vm.minDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            vm.maxDate = new Date(date.getFullYear(), 12, 0);
            
            vm.$nextTick(() => {
                vm.isOpen = true;
            });
        },
        onClick: function(args) {
            let vm = this;
            vm.$nextTick(() => {
                if(vm.standardDate) {
                    vm.$store.state.clearError(vm.form_error);
                    vm.isOpen = true;
                }
                vm.schedule.startDate = vm.$c.formatDate(vm.standardDate, "date");
            });
        },
        clickColor: function(row) { this.schedule.color = row; },
        onSave: function() {
            let vm = this;
            vm.$store.state.clearError(vm.form_error);
            let socket = vm.$store.state.socket;
            socket.emit(`/socket/schedule/register/*`, {
                title: vm.schedule.title,
                color: vm.schedule.color,
                coupleInfoId: vm.$store.state.couple.coupleInfoId,
                startDate: vm.schedule.startDate,
                endDate: vm.schedule.endDate.join("-"),
                memo: vm.schedule.memo,
            }, (data, err) => {
                if(data.success) {
                    vm.$store.state.notify('success', data.message);
                    vm.clearForm();
                    vm.callback(data.schedule);
                    vm.isOpen = false;
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'error')) {
                        vm.$store.state.setError(vm.form_error, data.error);
                    }
                    if(Object.prototype.hasOwnProperty.call(data, 'message')) {
                        vm.$store.state.notify('danger', data.message);
                    }
                }
            });
        },
        change_start_date: function(value)  {
            let vm = this;
        }
    },
    components: {
    },
    mounted: function() {
        let vm = this;
        
    },
}
</script>