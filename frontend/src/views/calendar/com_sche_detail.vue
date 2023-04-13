<template>
  <div id="com_sche_detail" >
        <van-action-sheet v-model:show="isOpen">
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: white; border-bottom: 1px solid #eee;" 
                class="pa-md">
                <div @click="isOpen=false;" class="text-grey">닫기</div>
                <div class="text-bold">스케줄<van-icon name="smile-o" color="red" /></div>
                <div class="text-grey" style="visibility: hidden;">닫기</div>
            </div>
            
            <div style="height: 100%; background-color: #f2f2f2;">
                <div style="min-height: 300px; max-height: 300px; overflow-y: scroll;">
                    <div class="pt-md">
                        <van-field v-model="schedule.title" disabled
                            name="title" placeholder="제목 *"
                            :error="form_error.title.length > 0" :error-message="form_error.title"
                        />
                    </div>
                    <div class="pt-md ">
                        <div style="display: flex; justify-content: space-between; padding: 10px 16px; align-items: center;" 
                            class="bg-white">
                            <div style="color: #c8c9cc">색깔</div>
                            <div :style="{backgroundColor: schedule.color}" style="width: 15px; height: 15px; border-radius: 15px;"></div>
                        </div>
                    </div>
                    <div class="pt-md" style="position: relative;">
                        <div style="width: 100%; color: #c8c9cc;" class="bg-white">
                            <div style="padding: 10px 16px; font-size: 14px; height: 24px; display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    시작일 *
                                </div>
                                <div style="padding-right: 20px;">
                                    {{ schedule.startDate.join('-') }}
                                </div>
                            </div>
                        </div>
                        <div style="width: 100%; color: #c8c9cc;" class="bg-white">
                            <div style="padding: 10px 16px; font-size: 14px; height: 24px; display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    종료일 *
                                </div>
                                <div style="padding-right: 20px;">
                                    {{ schedule.endDate.join('-') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pt-md">
                        <van-field v-model="schedule.memo" disabled
                            name="title" placeholder="메모" 
                            type="textarea" autosize rows="2" />
                    </div>
                    <van-divider></van-divider>
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
export default {
    name: 'com_sche_detail',
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
        setForm: function(schedule) {
            let vm = this;
            vm.schedule.title = schedule.title;
            vm.schedule.startDate = schedule.startDate;
            vm.schedule.endDate = schedule.endDate;
            vm.schedule.memo = schedule.memo;
            vm.schedule.color = schedule.color;
        },
        open: function(schedule, callback) {
            let vm = this;
            vm.clearForm();
            vm.$store.state.clearError(vm.form_error);
            if(callback) { vm.callback = callback; }
            vm.setForm(schedule);
            vm.$nextTick(() => {
                vm.isOpen = true;
            });
        },
    },
    mounted: function() {
        let vm = this;
    },
}
</script>