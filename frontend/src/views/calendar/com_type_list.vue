<template>
    <div id="com_type_list" style="height: 100%; overflow-y: scroll; border-top: 1px solid #eee;">
        <van-list v-model:loading="loading" :finished="finished"
            @load="onLoad"
            finished-text="Finished">
            <template v-for="(schedule,idx) in sche_list" :key="idx">
                <van-swipe-cell>
                <!-- <template #left>
                    <van-button square type="primary" text="Select" />
                </template> -->
                <div style="display: flex; justify-content: space-between; align-items: center;" 
                    class="pa-sm">
                    <div style="width: calc(100% - 150px);">
                        <div 
                            style="width: 100%; text-overflow: ellipsis; overflow: hidden; white-space:nowrap;">
                            {{ schedule.title }}
                        </div>
                        <template v-if="schedule.memo">
                            <div class="ft-xs w100p mt-xs" 
                                style="width: 100%; text-overflow: ellipsis; min-height: 17px; max-height: 17px; overflow: hidden; white-space:nowrap;">
                                {{ schedule.memo }}
                            </div>
                        </template>
                        <template v-else>
                            <div class="ft-xs w100p mt-xs">
                                메모 없음
                            </div>
                        </template>
                    </div>
                    <div style="min-width: 130px;">
                        <van-count-down :time="time" format="DD Day, HH:mm:ss" />
                    </div>
                </div>
                <template #right >
                    <van-button square plain type="danger" text="삭제" style="height: 100%;" 
                        @click="onDelete(schedule)" />
                    <van-button square plain text="상세" style="height: 100%;"
                        @click="onDetail(schedule)" />
                </template>
                </van-swipe-cell>
                
                <van-divider style="margin: 0; background-color: #eee;" />
            </template>
            
        </van-list>
    </div>
</template>

<script>
export default {
    name: 'com_type_list',
    props: ['sche_list'],
    data() {
        return {
            callback: null,  
            loading: false,
            finished: false,

            time: (30 * 60 * 60 * 1000),
        }
    },
    methods: {
        onLoad: function() {
            let vm = this;
        },

        onDelete: function(schedule) {
            let vm = this;
            vm.$emit("onDelete", schedule);
        },
        onDetail: function(schedule) {
            let vm =this;
            vm.$emit("onDetail", schedule);  
        },
    },
    mounted: function() {
        let vm = this;
    },
}
</script>