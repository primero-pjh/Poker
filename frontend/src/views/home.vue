<template>
    <div id="homeVue">
        <q-layout view="lhh LpR lff"
            container
            style="height: 500px"
            class="shadow-2 rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
            <q-header reveal :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
                <q-toolbar>
                    <!-- <q-btn flat @click="drawerLeft = !drawerLeft" 
                        round dense icon="menu" /> -->
                    <q-toolbar-title><q-btn label="game start" @click="suffle" color="primary" /></q-toolbar-title>
                    <q-btn flat @click="drawerRight = !drawerRight" 
                        round dense icon="menu" />
                </q-toolbar>
            </q-header>
            <q-drawer
                side="right"
                v-model="drawerRight"
                bordered
                :width="200"
                :breakpoint="1000">
                <q-scroll-area class="fit">
                    <div class="text-right bg-grey">
                        <q-btn icon="close" flat dense @click="drawerRight=!drawerRight" />
                    </div>
                    <div class="q-pa-md">
                        <q-input label="플레이어 수" v-model="playerCount" type="number" 
                            max="4" @blur="blurPlayerCount"
                            :error="playerCount>4" :error-message="'최대 플레이어는 4명입니다.'"
                            @update:model-value="changePlayerCount" />
                    </div>
                </q-scroll-area>
            </q-drawer>
            <q-page-container>
                <q-page class="q-pa-md">
                    <div>
                        <p> 남은 카드: {{ playDecks.length }}장</p>
                        <p>단계 : {{ step }}</p>
                    </div>
                    <div style="display: flex;">
                        <div v-for="row, playerIdx in player" :key="playerIdx" 
                            class="q-pa-sm"
                            style="border: 1px solid #aaa;">
                            <p class="text-bold">player {{ playerIdx + 1 }}의 패</p>
                            <div v-for="item, cardIdx in row.decks" :key="cardIdx"
                                style="display: flex; justify-content: space-between;">
                                <div>
                                    {{ item.key }}
                                </div>
                                <div v-if="step == 1">
                                    <q-btn icon="delete" flat dense size="sm" @click="dropMyCard(playerIdx, cardIdx)" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="step == 3">
                        <q-btn icon="ok" label="콜"></q-btn>
                        <q-btn icon="ok" label="다이"></q-btn>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "homeVue",
    components: {
    },
    data() {
        return {
            step: 0,
            drawerRight: false,
            playerCount: 2,

            playDecks: [],
            decks: [],

            player: [],
        };
    },
    methods: {
        settingInit: function() {
            let vm = this;
            vm.player = [];
            for(let i=0; i<vm.playerCount; i++) {
                vm.player.push({
                    order: (i+1),
                    decks: [],
                    step: 0,
                });
            }

            vm.step = 0;
        },

        /* 같은 숫자 확인 */
        checkSameNum(decks, num) {
            let cnt = 0;
            for(let i=0; i<decks.length; i++) {
                if(decks[i].number == num) { cnt++; }
            }
            return cnt;
        },
        checkSameShape(decks, shape) {
            let cnt = 0;
            for(let i=0; i<decks.length; i++) {
                if(decks[i].shape == shape) { cnt++; }
            }
            return cnt;
        },

        /* 족보 확인 */
        checkPedigree(decks) {
            let vm = this;
            let isStraight = 0;
            let straightMax = 0;                // 연속(5번)해서 이어지는 수의 최대
            let straightMin = 0;                // 연속(5번)해서 이어지는 수의 최소
            // 같은 문양의 수
            let sameShape = {
                spade: 0,
                diamond: 0,
                heart: 0,
                clover: 0,
            }
            let sameNumCnt = 0;                 // 같은 숫자의 수
            for(let i=0; i<decks.length; i++) {
                var result = vm.checkSameNum(decks, decks[i].number);
                sameNumCnt = (sameNumCnt <= result) ? result : sameNumCnt;
                var result = vm.checkSameNum(decks, decks[i].shape);
                sameShape[decks[i].shape] = result;
            }

        },
        returnPedigree(obj) {
            // 로티플
            if(obj.sameShape.spade >= 5 && obj.straightMax == 13) {
                return "Royal Straight Flush";
            }
            // 스티플
            if(
                (
                    obj.sameShape.spade >= 5 || 
                    obj.sameShape.diamond >= 5 || 
                    obj.sameShape.heart >= 5 || 
                    obj.sameShape.clover >= 5
                ) &&
                obj.isStraight) {
                return "Back Straight Flush";
            }
            // 백티플
            // 포카드
            // 풀 하우스
            // 플러쉬
            // 마운틴
            // 백 스트레이트
            // 스트레이트
            // 트리플
            // 투페어
            // 원페어
            // 노페어
        },
        dropMyCard(playerIdx, cardIdx) {
            let vm = this;
            vm.player[playerIdx].decks.splice(cardIdx, 1);
            for(let i=0; i<vm.player.length; i++) {
                if(i != playerIdx) {
                    vm.player[i].decks.splice(vm.getRandomInt(4), 1);
                }
            }
            vm.step++;
            vm.second();
        },
        blurPlayerCount() {
            let vm = this;
            if(vm.playerCount > 4) { vm.playerCount = 4; }
            if(vm.playerCount < 0) { vm.playerCount = 0; }
            vm.settingPlayer();
        },
        changePlayerCount(cnt) {
            let vm = this;
            vm.playerCount = cnt;
            vm.settingPlayer();
        },
        getRandomInt(max) {
            return Math.floor(Math.random() * max);
        },
        
        sendCard(cnt) {
            let vm = this;
            for(let i=0; i<cnt; i++) {
                for(let j=0; j<vm.playerCount; j++) {
                    vm.player[j].decks.push(vm.playDecks.pop());
                }
            }
        },
        /* 
            1. 처음에 카드를 나눠줌(4장) 
            플레이어가 카드를 버림
        */
        first() {
            let vm = this;
            vm.sendCard(4);
            vm.step++;
        },
        /*
            2. 카드를 한장씩 나눠줌
        */
        second() {
            let vm = this;
            vm.sendCard(1);
            vm.step++;
        },
        
        suffle: function() {
            let vm = this;
            vm.settingInit();
            let initLen = 52;
            let temp_decks = vm.$store.state.tempObj(vm.decks);
            let decks = [];
            let number = vm.getRandomInt(initLen);
            for(let i=0; i<initLen; i++) {
                let card = temp_decks[number];
                decks.push(card);
                temp_decks.splice(number, 1);
                number = vm.getRandomInt(temp_decks.length);
            }

            vm.playDecks = decks;
            vm.first();
        },
        loadDecks() {
            let vm = this;
            axios.get(`/api/initDecks`, {}).then((res) => {
                let data = res.data;
                if(data.success) {
                    let row = data.decks;
                    vm.decks = row;
                }
            });
        },
    },
    mounted() {
        let vm = this;
        vm.loadDecks();
        vm.settingInit();
    },
};
</script>
