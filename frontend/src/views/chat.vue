<template>
    <div id="chatVue" style="height: 100%;">
        <layoutVue
            ref="layoutVue">
            <template v-slot:body>
                <div style="display: flex; flex-direction: column; height: 100%; background-color: #eee;">
                    <template v-if="isLoading">
                        <div style="position: absolute; bottom: 130px; width: 200px; border-radius: 13px; opacity: 0.5; left: 50%; transform: translate(-50%, 0);"
                            class="w100p ft-xs bg-white text-center">
                            <van-loading size="24px">
                                {{ $store.state.couple.userName }}님이 입력중입니다.
                            </van-loading>
                        </div>
                    </template>
                    <div style="position: absolute; bottom: 130px; opacity: 0.5; padding: 5px; width: 25px; background-color: white; border-radius: 30px; right: 10px;"
                        class="w100p ft-xs text-right" @click="scrollMove"
                        v-if="(
                            nowScrollHeight - scrollHeight < 0
                        )
                        ">
                        <van-icon name="back-top" size="25" 
                            style="color: black; transform: rotate(180deg);" />
                    </div>
                    <div style="height: 100%; overflow-y: scroll;" class="pa-md" id="chatBox">
                        <template v-for="(message,idx) in message_list" :key="idx">
                            <template v-if="message.userName == $store.state.user.userName">
                                <div style="display: flex; justify-content: end;" class="w100p">
                                    <div style="display: flex; flex-direction: column; margin-left: 5px;">
                                        <div>
                                            <template v-if="
                                                ( 
                                                    (idx-1 < 0)
                                                    ||
                                                    ( idx-1>=0 && message_list[idx-1].userName != $store.state.user.userName)
                                                )
                                            ">
                                                <div class="w100p text-white" style="text-align: right">
                                                    {{ message.userName }}
                                                </div>
                                            </template>
                                            <div class="bg-white mt5" 
                                                style="border-radius: 10px; padding: 5px 10px; text-align: right;">
                                                {{ message.message }}
                                            </div>
                                            <template v-if="
                                                (
                                                    (idx == message_list.length-1)
                                                    ||
                                                    ( idx+1 < message_list.length-1 && message_list[idx+1].userName != $store.state.user.userName)
                                                )
                                            ">
                                                <div class="ft-xs w100p text-white" style="text-align: right;">
                                                    {{ message.sendDateView }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div style="display: flex;">
                                    <template v-if="
                                        ( 
                                            (idx-1 < 0)
                                            ||
                                            ( idx-1>=0 && message_list[idx-1].userName != $store.state.couple.userName)
                                        )
                                    ">
                                        <div>
                                            <van-image round width="50" height="50" fit="cover"
                                                :src="$store.state.host + $store.state.couple.image "/>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div style="width: 50px;"></div>
                                    </template>
                                    <div style="display: flex; flex-direction: column; margin-left: 5px;">
                                        <div>
                                            <template v-if="
                                                ( 
                                                    (idx-1 < 0)
                                                    ||
                                                    ( idx-1>=0 && message_list[idx-1].userName != $store.state.couple.userName)
                                                )
                                            ">
                                                <div class="ft-sm text-white">{{ message.userName }}</div>
                                            </template>
                                            <div class="bg-white mt5" 
                                                style="border-radius: 10px; padding: 5px 10px;">
                                                {{ message.message }}
                                            </div>
                                            <template v-if="
                                                (
                                                    (idx == message_list.length-1)
                                                    ||
                                                    ( 
                                                        ( idx + 1 < message_list.length )
                                                        && 
                                                        ( message_list[idx+1].userName != $store.state.couple.userName )
                                                    )
                                                )
                                            ">
                                                <div class="ft-xs w100p text-white" style="text-align: right;">
                                                    {{ message.sendDateView }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </template>
                            
                    </div>
                    <div class="w100p">
                        <van-field v-model="message" center clearable 
                            @focus="onFocus" @blur="onBlur"
                            @keyup.enter="onSend">
                            <template #left-icon>
                                <van-icon name="link-o" size="30" @click="openMoreItem"/>
                            </template>
                            <template #button>
                                <van-icon name="guide-o" size="30" @click="onSend"/>
                            </template>
                        </van-field>
                    </div>
                </div>
            </template>
        </layoutVue>
        <act_more_item ref="act_more_item" />
    </div>
</template>

<script>
import layoutVue from "@/components/Layout.vue"
import act_more_item from "@/views/chat/act_more_item.vue"
export default {
    name: 'chatVue',
    components: {
        layoutVue,
        act_more_item,
    },
    data() {
        return {
            nowScrollHeight: 0,
            scrollHeight: 0,
            socket: null,
            message: '',
            item: [],

            isLoading: false,

            message_list: [],
            currentUser: {
                id: 1,
                type: {},
                required: true
            },
            value: '',
        }
    },
    methods: {
        openMoreItem: function() {
            let vm = this;
            vm.$refs.act_more_item.open(function() {
                
            });
        },
        scrollMove: function() {
            let vm = this;
            vm.$nextTick(() => {
                vm.scrollHeight = document.getElementById("chatBox").offsetHeight;
                document.getElementById("chatBox").scrollTo(0, vm.scrollHeight+3000);
            });
        },

        onFocus: function() {
            let vm = this;
            vm.socket.emit('/socket/chat/user/event', {
                type: 'focus',
                coupleSocketId: vm.$store.state.couple.socketId,
            }, (data, err) => {
                
            });
        },
        onBlur: function() {
            let vm = this;
            vm.socket.emit('/socket/chat/user/event', {
                type: 'blur',
                coupleSocketId: vm.$store.state.couple.socketId,
            }, (data, err) => {
                
            });
        },
        onSend: function() {
            let vm = this;
            if(!vm.message) { return; }
            vm.socket.emit(`/socket/message/send`, {
                user: vm.$store.state.user,
                message: vm.message,
            }, (data, err) => {
                if(data.success) {
                    vm.message = '';
                    vm.scrollMove();
                } else {
                    vm.$store.state.notify('danger', data.message);
                }
            });
        },

        load_message_list: function() {
            let vm = this;
            vm.socket.emit('/socket/user/message/get_all', {
                user: vm.$store.state.user
            }, (data, err) => {
                if(data.success) {
                    let row = data.message_list;
                    row.map((x) => {
                        x.sendDateView = vm.$c.formatDate(x.sendDate, "date_2");
                    });
                    vm.message_list = row;
                    if(!vm.message_list) {
                        vm.message_list = [];
                    }
                    vm.scrollMove();
                }
            });
        },
    },
    mounted: function() {
        let vm = this;
        vm.socket = vm.$store.state.socket;
        if(!vm.$store.state.user.socketId) {
            vm.$router.push('/login');
            return;
        }
        vm.socket.on('/client/message/receive', (data) => {
            data.sendDateView = vm.$c.formatDate(data.sendDate, "date_2");
            vm.message_list.push(data);
            vm.scrollMove();
        });
        vm.socket.on('/client/chat/user/event/watch', (data) => {
            if(data.type == 'focus') {
                vm.isLoading = true;
            } else if (data.type == 'blur') {
                vm.isLoading = false;
            }
        });

        document.getElementById("chatBox").style.backgroundImage =
            `url("${vm.$store.state.host}${vm.$store.state.couple.backgroundImage}")`;
        document.getElementById("chatBox").style.backgroundRepeat = 'no-repeat';
        document.getElementById("chatBox").style.backgroundSize = "100% 100%";
        vm.load_message_list();

        document.getElementById("chatBox").addEventListener("scroll", (event) => {
            vm.nowScrollHeight = parseInt(document.getElementById("chatBox").scrollTop - 10);
        });
    },
    unmounted: function() {
        this.socket.off('/client/message/receive');
    }
}
</script>