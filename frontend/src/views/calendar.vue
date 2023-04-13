<template>
    <div id="calenderVue" style="height: 100%;">
        <layoutVue
            ref="layoutVue">
            <template v-slot:header>
                <van-nav-bar title="캘린더" 
                        left-arrow>
                    <template #right>
                        <van-icon name="setting-o" size="20" @click="open_setting" />
                    </template>
                </van-nav-bar>
            </template>
            <template v-slot:body>
                <div style="height: 100%; overflow-y: scroll;">
                    <template v-if="type == 'list'">
                        <com_type_list ref="com_type_list" 
                            :sche_list="sche_list" 
                            @onDetail="onDetail" @onDelete="onDelete" />
                    </template>
                    <template v-else-if="type == 'viewer'">
                        <v-date-picker v-model="standardDate" style="width: 100%;"
                            @dayclick="onClick($event)" :rows="datePickerRows"
                            :attributes="attrs" />
                        <template v-if="schedules.length != 0">
                            <van-cell-group inset v-for="(schedule,idx) in schedules" :key="idx">
                                <van-divider>
                                    {{ schedule.title }}
                                </van-divider>
                                <van-sticky >
                                    <div class="bg-white" 
                                    style="height: 45px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px;">
                                        <div></div>
                                        <div>
                                            <van-button plain type="success" size="small" 
                                                @click="onSave(idx)">저장</van-button>
                                        </div>
                                    </div>
                                </van-sticky>
                                <van-field v-model="schedule.title" label="제목 *" :disabled="schedule.scheduleId==0"
                                    :error="form_error.length >= idx && form_error[idx]['title'].length > 0" :error-message="form_error[idx].title" />
                                <van-collapse v-model="colorActive[idx]" >
                                    <van-collapse-item name="1" :disabled="schedule.scheduleId==0">
                                        <template #title>
                                            <div style="display: flex; align-items: center;">
                                                <div>색깔</div>
                                                <div style="padding-left: 70px;" v-if="schedule.color">
                                                    <div style="width: 10px; height: 10px; border-radius: 15px; border: 1px solid black;"
                                                        :style="{backgroundColor: schedule.color}"></div>
                                                </div>
                                            </div>
                                        </template>
                                        <template v-for="(row,colorIdx) in color_list" :key="colorIdx">
                                            <div style="height: 20px; padding: 10px 16px; display: flex; align-items: center;"
                                                @click="clickColor(row, idx)">
                                                <div class="pr-sm">{{ row }}</div>
                                                <div style="width:10px;height:10px;border-radius: 15px;"
                                                    :style="{backgroundColor: row}">
                                                </div>
                                            </div>
                                        </template>
                                    </van-collapse-item>
                                </van-collapse>
                                <van-collapse v-model="dateActive[idx]">
                                    <van-collapse-item name="1" :disabled="schedule.scheduleId==0">
                                        <template #title>
                                            <div style="display: flex;">
                                                <div>시작일 *</div>
                                                <div style="padding-left: 45px;">{{ schedule.startDate.join("-") }}</div>
                                            </div>
                                        </template>
                                        <van-date-picker v-model="schedule.startDate" @change="changeStartDate($event, idx)"
                                            :show-toolbar="false" :min-date="minMax[idx].startMinDate" :max-date="minMax[idx].startMaxDate">
                                        </van-date-picker>
                                    </van-collapse-item>
                                    <van-collapse-item name="2" :disabled="schedule.scheduleId==0">
                                        <template #title>
                                            <div style="display: flex;">
                                                <div>종료일 *</div>
                                                <div style="padding-left: 45px;">{{ schedule.endDate.join("-") }}</div>
                                            </div>
                                        </template>
                                        <van-date-picker v-model="schedule.endDate" 
                                            :show-toolbar="false" :min-date="minMax[idx].endMinDate" :max-date="minMax[idx].endMaxDate">
                                        </van-date-picker>
                                    </van-collapse-item>
                                </van-collapse>
                                <van-field v-model="schedule.memo" :disabled="schedule.scheduleId==0"
                                    name="title" placeholder="메모 ( 500자 이내 )" 
                                    type="textarea" autosize rows="2" />
                            </van-cell-group>
                        </template>
                    </template>
                </div>
                <com_sche_form ref="com_sche_form" />
                <com_sche_detail ref="com_sche_detail" />
                <act_setting ref="act_setting" :type="type" />
            </template>
        </layoutVue>
    </div>
</template>

<script>
import layoutVue from "@/components/Layout.vue"
import com_sche_form from "./calendar/com_sche_form.vue";
import act_setting from "./calendar/act_setting.vue";
import com_type_list from "./calendar/com_type_list.vue";
import com_sche_detail from "./calendar/com_sche_detail.vue";
export default {
    name: 'calenderVue',
    components: {
        layoutVue,
        com_sche_form,
        act_setting,
        com_type_list,
        com_sche_detail,
    },
    data() {
        return {
            socket: null,
            callback: null,

            type: 'viewer',

            datePickerRows: 2,
            colorActive: [[]],
            color_list: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink'],

            dateActive: [[]],

            minMax: [],
            
            standardDate: new Date(),

            sche_list: new Array(),
            schedules: [],               // detail
            form_error: [],

            attrs: [],  // calendar datasets
        }
    },
    methods: {
        clickColor: function(row, idx) { this.schedules[idx].color = row; },
        open_setting: function() {
            let vm = this;
            vm.$refs.act_setting.open(function(type) {
                vm.type = type;
            });
        },
        /* change */
        changeStartDate: function(options, idx) {
            let vm = this;
            let date_list = options.selectedValues;
            let selectDate = date_list.join("-");
            /* max date 설정 해야됩니다. */
            let date = new Date(selectDate);
            vm.minMax[idx].startMinDate = new Date(date.getFullYear()-1, 1, 1);
            vm.minMax[idx].startMaxDate = new Date(date.getFullYear()+1, 1, 1);
            vm.minMax[idx].endMinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            vm.minMax[idx].endMaxDate = new Date(date.getFullYear(), 12, 0);
        },

        /* event */
        onClick: function(args) {
            let vm = this;
            vm.schedules = [];
            vm.datePickerRows = 2;
            if(vm.standardDate) {
                let attributes = args.attributes;
                /* 일정이 있는 날짜를 클릭했을 때 */
                if(attributes.length > 0) {
                    /* 상세보기 값 삽입 */
                    vm.datePickerRows = 1;
                    if(vm.standardDate) {
                        /* min, max 정의 */
                        
                        vm.minMax = [];
                        vm.schedules = [];
                        vm.form_error = [];
                        vm.dateActive = [];
                        vm.colorActive = [];
                        for(let i=0; i<attributes.length; i++) {
                            let schedule = vm.sche_list.find(x=>x.scheduleId == attributes[i].key);
                            let date = new Date(schedule.startDate);
                            vm.minMax.push({
                                startMinDate: new Date(date.getFullYear()-1, 1, 1),
                                startMaxDate: new Date(date.getFullYear(), 12, 0),
                                endMinDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                                endMaxDate: new Date(date.getFullYear(), 12, 0),
                            });
                            
                            vm.schedules.push(schedule);
                            vm.form_error.push({title: ''});
                            vm.dateActive.push([]);
                            vm.colorActive.push([]);
                        }
                        return;
                        /* 상세보기 값 삭제 */
                    } else {
                        vm.minMax = [];
                        vm.schedules = [];
                        vm.form_error = [];
                    }
                } else {
                    /* 일정이 없고, 새로운 값을 삽입할 때 */
                    let select_date = args.id;
                    vm.$refs.com_sche_form.open(select_date, function(data) {
                        vm.sche_list.push(data);
                        vm.make_attr(vm.sche_list);
                    });
                }
            } else {
                /* 선택을 해제 하였을 때 */
                vm.datePickerRows = 2;
                vm.minMax = [];
                vm.schedules = [];
                vm.form_error = [];
            }
        },
        onSave: function(idx) {
            let vm = this;
            let schedule = vm.schedules[idx];
            vm.$store.state.clearError(vm.form_error[idx]);
            let form_data = {
                scheduleId: schedule.scheduleId,
                coupleInfoId: schedule.coupleInfoId,
                title: schedule.title,
                color: schedule.color,
                startDate: schedule.startDate.join("-"),
                endDate: schedule.endDate.join("-"),
                memo: schedule.memo,
            };

            vm.socket.emit('/socket/schedule/update/*', form_data, (data, err) => {
                if(data.success) {
                    vm.$store.state.notify('success', data.message);
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'error')) {
                        vm.$store.state.setError(vm.form_error[idx], data.error);
                    }
                }
            });
        },
        onDetail: function(schedule) {
            let vm = this;
            vm.$refs.com_sche_detail.open(schedule, function() {
                
            });
        },
        onDelete: function(schedule) {
            let vm = this;
            let coupleInfoId = vm.$store.state.couple.coupleInfoId;
            vm.$store.state.socket.emit('/socket/schedule/delete/*', {
                coupleInfoId,
                scheduleId: schedule.scheduleId,
            }, (data, err) => {
                if(data.success) {
                    vm.$store.state.notify('success', data.message);
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, "message")) {
                        vm.$store.state.toast('danger', data.message);
                    }
                }
            });
        },

        /* schedule-> attrs datasets에 맞게 제작 */
        make_attr: function(list) {
            let vm = this;
            let attrs = new Array();
            list.map((x) => {
                /* dot */
                if(x.startDate[0] == x.endDate[0] && x.startDate[1] == x.endDate[1] && x.startDate[2] == x.endDate[2]) {
                    let dict = new Object();
                    let startDate = new Date(x.startDate);
                    dict['key'] = x.scheduleId;
                    dict['dot'] = x.color ? x.color : true;
                    dict['dates'] = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    attrs.push(dict);
                }
                /* highlight */
                else {
                    let dict = new Object();
                    let startDate = new Date(x.startDate);
                    let endDate = new Date(x.endDate);
                    dict['key'] = x.scheduleId;
                    dict['highlight'] = {
                        start: { color: x.color ? x.color : 'gray', fillMode: 'light' },
                        base: { color: x.color ? x.color : 'gray', fillMode: 'light' },
                        end: { color: x.color ? x.color : 'gray', fillMode: 'light' },
                    };
                    dict['dates'] = {
                        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                        end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
                    };
                    attrs.push(dict);
                }
            });
            vm.attrs = attrs;
        },

        load_sche_list: function() {
            let vm = this;
            vm.socket.emit('/socket/schedule/get_all', {
                coupleInfoId: vm.$store.state.couple.coupleInfoId
            }, (data, err) => {
                if(data.success) {
                    let row = data.sche_list;
                    row.map((x) => {
                        x.startDate = x.startDate.split('-');
                        x.endDate = x.endDate.split('-');
                    });
                    vm.sche_list = row;
                    vm.make_attr(row);
                }
            });
        },
    },
    mounted: function() {
        let vm = this;
        if(!vm.$store.state.user.socketId) {
            return vm.$router.push('/login');
        }
        vm.socket = vm.$store.state.socket;
        vm.load_sche_list();

        /* 커플이 일정을 추가, 수정, 삭제하였을 때 event */
        vm.socket.on("/client/schedule/watch/*", (data) => {
            if(data.type == 'register') {
                vm.load_sche_list();
                vm.$store.state.notify(
                    'success', `${vm.$store.state.couple.userName}님이 새 일정을 추가하였습니다.`
                );
            } else if (data.type == 'update') {
                vm.load_sche_list();
                vm.$store.state.notify(
                    'success', `${vm.$store.state.couple.userName}님이 일정을 변경하였습니다.`
                );
            } else if (data.type == 'delete') {
                vm.load_sche_list();
                vm.$store.state.notify(
                    'success', `${vm.$store.state.couple.userName}님이 일정을 삭제하였습니다.`
                );
            }
        });
    },
    unmounted: function() {
        let vm = this;
        vm.socket.off("/client/schedule/watch/*");
    },
}
</script>