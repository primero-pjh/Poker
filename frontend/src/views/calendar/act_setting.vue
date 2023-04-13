<template>
  <div id="act_setting" >
        <van-action-sheet v-model:show="isOpen">
            <div>
                <div style="display: flex; flex-direction: column; width: 100%;">
                    <div class="pa-md ft-md" @click="onClick('list')">
                        <div style="display: flex; justify-content: space-between;">
                            <div>목록형</div>
                            <div v-if="type == 'list'">
                                <van-icon name="success" size="20" />
                            </div>
                        </div>
                        
                    </div>
                    <van-divider style="background-color: #eee; margin: 0;"></van-divider>
                    <div class="pa-md ft-md" @click="onClick('viewer')">
                        <div style="display: flex; justify-content: space-between;">
                            <div>뷰어형</div>
                            <div v-if="type == 'viewer'">
                                <van-icon name="success" size="20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
export default {
    name: 'act_setting',
    props: ['type'], // list, viewer
    data() {
        return {
            isOpen: false,
            callback: null,  
        }
    },
    methods: {
        open: function(callback) {
            let vm = this;
            if(callback) { vm.callback = callback }
            vm.isOpen = true;
        },
        onClick: function(type) {
            let vm = this;
            vm.callback(type);
            vm.isOpen = false;
        },
    },
    components: {
    },
    mounted: function() {
        let vm = this;
        
    },
}
</script>