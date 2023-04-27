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
                    <q-toolbar-title>
                        <q-btn  :loading="$store.state.initDecks.length == 0" 
                            label="GAME START" @click="suffle" color="primary" />
                    </q-toolbar-title>
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
                        <p>{{ systemMessage[step] }}</p>
                    </div>
                    <div style="display: flex;">
                        <div v-for="row, playerIdx in player" :key="playerIdx" 
                            class="q-pa-sm"
                            style="border: 1px solid #aaa;">
                            <p class="text-bold">player {{ row.order }}의 패</p>
                            <div v-for="item, cardIdx in row.decks" :key="cardIdx"
                                style="display: flex; justify-content: space-between;">
                                <div>
                                    {{ item.key }}
                                </div>
                                <div v-if="step == 1">
                                    <q-btn icon="delete" flat dense size="sm" @click="dropMyCard(playerIdx, cardIdx)" />
                                </div>
                            </div>
                            {{ (row.pedigree) }}
                        </div>
                        
                    </div>
                    <div v-if="step >= 7" class="q-mt-md text-right">
                        <q-btn icon="check" label="다시하기" color="positive" class="q-mr-sm" @click="die"></q-btn>
                    </div>
                    <div v-else-if="step >= 3" class="q-mt-md">
                        <q-btn icon="check" label="콜" class="q-mr-sm" color="primary" @click="call"></q-btn>
                        <q-btn icon="close" label="다이" @click="die" color="negative"></q-btn>
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
    computed: {
    },
    data() {
        return {
            step: 0,
            drawerRight: false,
            playerCount: 2,

            pedigree: [],

            playDecks: [],
            decks: [],

            player: [],

            systemMessage: [
                '',
                '패를 한장 버려주세요',
                '콜, 다이를 선택해주세요',
                '콜, 다이를 선택해주세요',
                '콜, 다이를 선택해주세요',
                '콜, 다이를 선택해주세요',
                '콜, 다이를 선택해주세요',
                '결과: ',
            ],

            cardNumber_dict: {
                1: 'A',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                6: '6',
                7: '7',
                8: '8',
                9: '9',
                10: '10',
                11: 'J',
                12: 'Q',
                13: 'K',
                14: 'A',
            },
        };
    },
    methods: {
        settingInit: function() {
            let vm = this;
            vm.decks = vm.$store.state.tempObj(vm.$store.state.initDecks);
            vm.pedigree = vm.$store.state.tempObj(vm.$store.state.pedigree);
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

        /* 같은 숫자의 개수 체크 */
        checkSameNum(decks, num) {
            let cnt = 0;
            for(let i=0; i<decks.length; i++) {
                if(decks[i].number == num) { cnt++; }
            }
            return cnt;
        },
        /* 같은 문양의 개수 체크 */
        checkSameShape(decks, shape) {
            let cnt = 0;
            for(let i=0; i<decks.length; i++) {
                if(decks[i].shape == shape) { cnt++; }
            }
            return cnt;
        },
        /* straight 확인 */
        checkStraight(decks) {
            let vm = this;
            decks = [
                {initDeckId: 31, key: '2H', number: 3, shape: 'heart', image: ''},
                {initDeckId: 44, key: '2C', number: 4, shape: 'clover', image: ''},
                {initDeckId: 34, key: '5H', number: 5, shape: 'heart', image: ''},
                {initDeckId: 38, key: '9H', number: 6, shape: 'heart', image: ''},
                {initDeckId: 51, key: '9C', number: 7, shape: 'clover', image: ''},
                {initDeckId: 39, key: '10H', number: 8, shape: 'heart', image: ''},
                {initDeckId: 42, key: 'KH', number: 9, shape: 'heart', image: ''},
            ];
            let isStraight = 0;
            let straightMax = 0;
            let straightMin = 0;
            /* straight : 5장 이상 */
            if(decks.length < 5) {
                return {
                    isStraight: 0,
                    straightMax: 0,
                    straightMin: 0,
                };
            }

            /* 정렬 */
            let temp_decks = vm.$store.state.tempObj(decks);
            temp_decks.sort(function (a, b) {
                return a.number - b.number;
            });

           
            console.log("isStraight :", isStraight);
            console.log("straightMax :", straightMax);
            console.log("straightMin :", straightMin);
            return {
                isStraight,
                straightMax,
                straightMin,
            };
        },

        /* 족보 확인 */
        checkPedigree(idx, decks) {
            let vm = this;
            let isStraight = 0;                                     // 스트레이트인지 확인
            let straightMax = 0;                                    // 연속(5번)해서 이어지는 수의 최대
            let straightMin = 0;                                    // 연속(5번)해서 이어지는 수의 최소
            let highNumber = decks.find(x=>x.number == 1) ? 14 : 0; // decks 중 가장 높은 숫자
            let lowNumber = 14;                                     // decks 중 가장 낮은 숫자
            // 같은 문양의 수
            let sameShape = {
                spade: 0,
                diamond: 0,
                heart: 0,
                clover: 0,
            }
            let sameNumCnt = 0;
            let sameNum = {
                13: 0,
                12: 0,
                11: 0,
                10: 0,
                9: 0,
                8: 0,
                7: 0,
                6: 0,
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0,
                0: 0,
            }

            let result = null;
            for(let i=0; i<decks.length; i++) {
                let number = decks[i].number;
                let shape = decks[i].shape;

                result = vm.checkSameNum(decks, number);
                sameNum[number] = result;
                sameNumCnt = sameNumCnt <= result ? result : sameNumCnt;
                result = vm.checkSameShape(decks, shape);
                sameShape[shape] = result;

                highNumber = highNumber <= number ? number : highNumber;
                lowNumber = lowNumber >= number ? number : lowNumber;
            }
            result = vm.checkStraight(decks);
            if( result.isStraight == 1 ) {
                isStraight = 1;
                result.straightMax = straightMax;
                result.straightMin = straightMin;
            }

            let obj = {
                sameShape,
                sameNum,
                isStraight,
                straightMax,
                straightMin,
                sameNumCnt,
                highNumber,
                lowNumber,
                decks,
            }
            vm.player[idx]["pedigreeObj"] = obj;
            let pedigree = vm.returnPedigree(obj);
            vm.player[idx]["pedigree"] = pedigree.label;
            vm.player[idx]["pedigree_rank"] = pedigree.rank;
        },
        returnPedigree(obj) {
            let vm = this;
            if(!obj) { 
                return {
                    name: '',
                }; 
            }
            // 로티플
            if(obj.sameShape.spade >= 5 && obj.isStraight && obj.straightMax == 14) {
                return {
                    name: "Royal Straight Flush",
                    label: "Royal Straight Flush",
                    rank: vm.$store.state.pedigree_rank_dict['Royal Straight Flush']
                };
            }
            // 스티플
            if(
                (
                    obj.sameShape.spade >= 5 || 
                    obj.sameShape.diamond >= 5 || 
                    obj.sameShape.heart >= 5 || 
                    obj.sameShape.clover >= 5
                ) 
                &&
                obj.isStraight) {
                return "Straight Flush";
            }
            // 백티플
            // 포카드
            if(obj.sameNumCnt >= 4) {
                for(var fk_n in obj.sameNum) {
                    if ( obj.sameNum[fk_n] >= 4 ) {
                        let name = 'Four of a kind';
                        return {
                            label: `${vm.cardNumber_dict[fk_n]} ${name}`,
                            name: `${name}`, 
                            rank: vm.$store.state.pedigree_rank_dict[name],
                        };
                    }
                }
            }
            
            // 풀 하우스
            let fullHouse = [];
            if(obj.sameNumCnt >= 3) {
                for(var fh_1 in obj.sameNum) {
                    if ( obj.sameNum[fh_1] >= 3 ) {
                        fullHouse.push(fh_1);
                        break;
                    }
                }
                for(var fh_2 in obj.sameNum) {
                    if ( obj.sameNum[fh_2] >= 2 && fh_2 != fullHouse[0] ) {
                        fullHouse.push(fh_2);
                        let name = 'Full House';
                        return {
                            label: `${vm.cardNumber_dict[fullHouse[0]]}, ${vm.cardNumber_dict[fullHouse[1]]} ${name}`,
                            name: `${name}`, 
                            rank: vm.$store.state.pedigree_rank_dict[name],
                        };
                    }
                }
            }
            // 플러쉬
            if(
                (
                    obj.sameShape.spade >= 5 || 
                    obj.sameShape.diamond >= 5 || 
                    obj.sameShape.heart >= 5 || 
                    obj.sameShape.clover >= 5
                )
            ) {
                let name = "Flush";
                return {
                    label: `${name}`,
                    name: `${name}`, 
                    rank: vm.$store.state.pedigree_rank_dict[name],
                };
            }
            // 마운틴
            if( obj.isStraight == 1 && obj.straightMax == 14 ) {
                let name = "Mountain";
                return {
                    label: `${name}`,
                    name: `${name}`, 
                    rank: vm.$store.state.pedigree_rank_dict[name],
                };
            }
            // 백 스트레이트
            if( obj.isStraight == 1 && obj.straightMin == 1 ) {
                let name = "Back Straight";
                return {
                    label: `${name}`,
                    name: `${name}`, 
                    rank: vm.$store.state.pedigree_rank_dict[name],
                };
            }
            // 스트레이트
            if( obj.isStraight == 1 ) {
                let name = "Straight";
                return {
                    label: `${name}`,
                    name: `${name}`, 
                    rank: vm.$store.state.pedigree_rank_dict[name],
                };
            }
            // 트리플
            if(obj.sameNumCnt >= 3) {
                for(var t_n in obj.sameNum) {
                    if ( obj.sameNum[t_n] >= 3 ) {
                        let name = "Three of a kind";
                        return {
                            label: `${vm.cardNumber_dict[t_n]} ${name}`,
                            name: `${name}`, 
                            rank: vm.$store.state.pedigree_rank_dict[name],
                        };
                    }
                }
            }
            // 투페어
            let two_pair_num = [];
            if(obj.sameNumCnt >= 2) {
                for(var tp_n in obj.sameNum) {
                    if ( obj.sameNum[tp_n] >= 2 ) {
                        two_pair_num.push(vm.cardNumber_dict[tp_n]);
                        if(two_pair_num.length >= 2) {
                            let name = "Two Pair";
                            return {
                                label: `${two_pair_num[0]}, ${two_pair_num[1]} ${name}`,
                                name: `${name}`, 
                                rank: vm.$store.state.pedigree_rank_dict[name],
                            };
                        }
                    }
                }
            }
            // 원페어
            if(obj.sameNumCnt >= 2) {
                for(var op_n in obj.sameNum) {
                    if ( obj.sameNum[op_n] >= 2 ) {
                        let name = "One Pair";
                        return {
                            label: `${vm.cardNumber_dict[op_n]} ${name}`,
                            name: `${name}`, 
                            rank: vm.$store.state.pedigree_rank_dict[name],
                        };
                    }
                }
            }
            // 노페어
            let name = "High Card";
            return {
                label: `${vm.cardNumber_dict[obj.highNumber]} ${name}`,
                name: `${name}`, 
                rank: vm.$store.state.pedigree_rank_dict[name],
            };
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
        
        /* playDecks의 마지막 카드 한장을 player에게 배포한다. */
        sendCard(cnt) {
            let vm = this;
            for(let i=0; i<cnt; i++) {
                for(let j=0; j<vm.playerCount; j++) {
                    vm.player[j].decks.push(vm.playDecks.pop());
                }
            }
            for(let i=0; i<vm.playerCount; i++) {
                vm.checkPedigree(i, vm.player[i].decks);
            }
        },

        /* 게임 초반부 - 카드를 섞음 */
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

        call() {
            let vm = this;

            let player_pdg_rank = [];
            let player_pdg_rank_number = [];
            let player_pdg_rank_shape = [];
            let winner_idx = 0;
            let winner_rank = 0;
            
            if(vm.step == 6) {
                player_pdg_rank.push(vm.player[0]);
                /* 1. 족보 순위 */
                for(let i=1; i<vm.player.length; i++) {
                    if(player_pdg_rank[player_pdg_rank.length-1].pedigree_rank > vm.player[i].pedigree_rank) {
                        player_pdg_rank[player_pdg_rank.length-1] = vm.player[i];
                    } else if (player_pdg_rank[player_pdg_rank.length-1].pedigree_rank == vm.player[i].pedigree_rank) {
                        player_pdg_rank.push(vm.player[i]);
                    }
                }
                vm.step++;
                if(player_pdg_rank.length == 1) {
                    vm.systemMessage[vm.step] = `player ${player_pdg_rank[player_pdg_rank.length-1].order}의 승리입니다.`;
                }
                else {
                    /* 2. 넘버 순위 */
                    // for(let i=0; i<player_pdg_rank.length; i++) {

                    // }
                }
                return;
                /* 3. 문양 순위 */
            }

            vm.sendCard(1);
            vm.step++;
        },  
        die() {
            let vm = this;
            vm.suffle();
        },

        checkPedigreeRank() {
            let vm = this;
        },
        loadSortOrder() {
            let vm = this;
        },  
        
    },
    mounted() {
        let vm = this;
    },
};
</script>
