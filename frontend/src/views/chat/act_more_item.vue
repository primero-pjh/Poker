<template>
  <div id="act_more_item" >
        <van-action-sheet v-model:show="isOpen">
            <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between;" class="pa-md">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div>
                            <van-icon name="photo-o" size="40"/>    
                        </div>
                        <div class="ft-xs">
                            이미지 선택
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div>
                            <van-icon name="video-o" size="40"/>    
                        </div>
                        <div class="ft-xs">
                            영상 선택
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div>
                            <van-icon name="link-o" size="40"/>    
                        </div>
                        <div class="ft-xs">
                            공유하기
                        </div>
                    </div>
                </div>
                
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
export default {
    name: 'act_more_item',
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