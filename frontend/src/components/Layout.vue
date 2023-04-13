<template>
    <div id="layoutVue" style="height: 100%;" ref="layoutVue" >
        <div style="display: flex; flex-direction: column; height: 100%;">
            <slot name="header">
                <div v-if="!unShowPage.hasOwnProperty($route.name)" 
                    style="border-bottom: 1px solid #aaa;">
                    <van-nav-bar :title="item_list[active].label" 
                        left-arrow @click-left="onClickLeft"/>
                </div>
            </slot>
            <div style="height: 100%;" :style="{height: (height-(46+72))+'px'}">
                <slot name="body">

                </slot>
            </div>
        </div>
        <div v-if="!unShowPage.hasOwnProperty($route.name)">
            <van-tabbar v-model="active" style="border-top: 1px solid #aaa; height: 72px;"
                @change="onChange" ref="footer">
                <template v-for="(row, idx) in item_list" >
                    <template v-if="row.hasOwnProperty('isCustom') && row.isCustom">
                        <van-tabbar-item :key="idx">
                            <template #icon="props">
                                <template v-if="$store.state.couple.socketId">
                                    <van-badge :content="100" max="99">
                                        <img :src="$store.state.host + '/images/doge_v3.png'" style="width: 50px !important; height: 50px !important;" 
                                            alt="doge_v3" />
                                    </van-badge>
                                </template>
                                <template v-else>
                                    <van-badge :content="200" max="99">
                                        <img :src="$store.state.host + '/images/도지.png'" 
                                            style="width: 50px !important; height: 50px !important;"
                                            alt="도지" />
                                    </van-badge>
                                </template>
                            </template>
                        </van-tabbar-item>
                    </template>
                    <template v-else>
                        <van-tabbar-item :icon="row.icon" :key="idx">{{row.label}}</van-tabbar-item>
                    </template>
                </template>
            </van-tabbar>
        </div>
    </div>
</template>

<script>
export default {
    name: 'layoutVue',
    data() {
        return {
            height: 0,
            isShow: true,
            unShowPage: {
                login: true,
                error: true,
                waiting: true,
                admin: true,
            },
            item_list: [
                { icon: 'home-o', label: '홈', url: '/home', name: 'home', },
                { icon: 'calendar-o', label: '캘린더', url: '/calendar', name: 'calendar' },
                { icon: 'chat-o', label: '채팅', url: '/chat', name: 'chat', isCustom: true },
                { icon: 'friends-o', label: '커뮤니티', url: '/community', name: 'community',},
                { icon: 'smile-o', label: '프로필', url: '/profile', name: 'profile', },
            ],
            active: 0,
        }
    },
    props: {
    },
    computed: {
        isAdmin: function() {
            return this.$store.state.user.isAdmin;
        },
    },
    methods: {
        onChange: function(idx) {
            let vm = this;
            let item = vm.item_list[idx];
            vm.$router.push(item.url);
        },
        onClickLeft: function() {
            let vm = this;
            let back_route = vm.$router.options.history.state.back;
            if(back_route == '/login') { return; }
            vm.$router.back();
        },
    },
    mounted: function() {
        let vm = this;
        let routeName = vm.$router.currentRoute.value.name;
        let idx = vm.item_list.findIndex(x => x.name == routeName);
        vm.active = idx;
    },
    created() {
        let vm = this;
        vm.height = vm.$store.state.height;
    }
}
</script>