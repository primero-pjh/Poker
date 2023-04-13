<template>
    <div id="communityVue" style="height: 100%;">
        <layoutVue
            ref="layoutVue">
            <template v-slot:header>
                <van-nav-bar title="커뮤니티" 
                        left-arrow>
                    <template #right>
                        <van-icon name="add-o" color="black" size="20" @click="goto_add" />
                    </template>
                </van-nav-bar>
            </template>
            <template v-slot:body>
                <van-list
                    v-model:loading="loading"
                    :finished="finished"
                    finished-text="마지막 페이지"
                    @load="onLoad">
                    <template v-for="(item,idx) in cmu_list" :key="idx">
                        <com_card_insta ref="com_card_insta" :item="item"></com_card_insta>
                    </template>
                </van-list>
            </template>
        </layoutVue>
    </div>
</template>

<script>
import layoutVue from "@/components/Layout.vue"
import com_card_insta from "@/views/community/com_card_insta.vue"

export default {
    name: 'communityVue',
    components: {
        layoutVue,
        com_card_insta,
    },
    data() {
        return {
            socket: null,   
            loading: false,
            finished: false,

            cmu_list: [],
        }
    },
    methods: {
        open_setting: function() {
            let vm = this;
            vm.$refs.act_more_item.open(function() {

            });
        },
        goto_add: function() {
            let vm = this;
            vm.$router.push('/community/add');
        },

        onLoad: function(args1) {
            let vm = this;
            console.log("args1:", args1);
        },

        /* load */
        load_cmu_list: function() {
            let vm = this;
            vm.loading = true;
            vm.socket.emit('/socket/community/get_all', {
                
            }, (data, err) => {
                if(data.success) {
                    let row = data.cmu_list;
                    vm.cmu_list = row;
                }
                vm.loading = false;
                vm.finished = true;
            });
        },
    },
    mounted: function() {
        let vm = this;
        if(!vm.$store.state.user.socketId) {
            vm.$router.push('/login');
        }
        vm.socket = vm.$store.state.socket;

        vm.load_cmu_list();
    },
}
</script>