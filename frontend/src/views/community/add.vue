<template>
    <div id="communityAddVue" style="height: 100%; background-color: #eff2f5;">
        <layoutVue
            ref="layoutVue">
            <template v-slot:header>
                <van-nav-bar title="커뮤니티" 
                        left-arrow>
                    <template #right>
                        <van-icon name="passed" color="black" size="20" @click="onSave" />
                    </template>
                </van-nav-bar>
            </template>
            <template v-slot:body>
                <div style="height: 100%; overflow-y: scroll;">
                    <div class="pa-md bg-white" >
                        <div style="font-size: 12px;">이미지 선택</div>
                        <div>
                            <van-field
                                :error="form_error.imageList.length > 0" :error-message="form_error.imageList">
                                <template #input>
                                    <van-uploader 
                                        v-model="fileList" 
                                        preview-size="60" 
                                        :before-read="beforeRead" />
                                </template>
                            </van-field>
                        </div>
                    </div>
                    <van-divider style="background-color: #aaa; margin: 0;"></van-divider>
                    <div class="pa-md bg-white mt-md">
                        <div style="font-size: 12px;">본문</div>
                        <van-field
                            v-model="community.body"
                            rows="3"
                            autosize
                            type="textarea"
                            maxlength="500"
                            placeholder="내용을 입력하세요..."
                            show-word-limit
                            :error="form_error.body.length > 0" :error-message="form_error.body"
                        />
                    </div>
                    <van-divider style="background-color: #aaa; margin: 0;"></van-divider>
                    <div class="pa-md bg-white mt-md">
                        <div style="font-size: 12px;">태그 입력</div>
                        <div>
                            <van-field
                                v-model="tag"
                                right-icon="add-o"
                                clearable
                                @click-right-icon="onSubmitTag"
                                @keyup.enter="onSubmitTag"
                                placeholder="# 을 제외하고 입력하세요."
                                :error="form_error.tags.length > 0" :error-message="form_error.tags"
                            />
                        </div>
                        <div style="display: flex; flex-wrap: wrap;" class="w100p">
                            <template v-for="(tag,idx) in community.tags" :key="idx">
                                <div class="mr-sm mt-sm">
                                    <van-tag size="medium" type="primary" @close="clearTag(idx)"
                                        closeable color="grey">
                                        {{ tag }}
                                    </van-tag>
                                </div>
                            </template>
                        </div>
                    </div>
                    <van-divider style="background-color: #aaa; margin: 0;"></van-divider>
                    <div class="pa-md bg-white mt-md">
                        <div style="font-size: 12px;">공개 설정</div>
                        <div class="mt-sm">
                            <van-switch v-model="community.isPublish" />
                        </div>
                    </div>

                    <van-divider style="background-color: #aaa; margin: 0;"></van-divider>
                    <div class="pa-md bg-white mt-md">
                        <van-button @click="onSave">추가하기</van-button>
                    </div>
                </div>
            </template>
        </layoutVue>
    </div>
</template>

<script>
import layoutVue from "@/components/Layout.vue"
import axios from "axios";
// import com_card_insta from "@/views/community/com_card_insta.vue"

export default {
    name: 'communityAddVue',
    components: {
        layoutVue,
        // com_card_insta,
    },
    data() {
        return {
            socket: null,

            tag: '',
            community: {
                imageList: [],
                body: '',
                isPublish: true,
                tags: [],
            },
            form_error: {
                imageList: '',
                body: '',
                tags: '',
            },
            fileList: [],
        }
    },
    methods: {
        beforeRead: function(file) {
            let vm = this;
            if(file) {
                let form_data = new FormData();
                form_data.append('file', file);
                form_data.append('token', vm.$store.state.token);
                axios.post(`/api/temp/upload/image`, form_data).then((res) => {
                    let data = res.data;
                    if(data.success == 0) {
                        vm.$router.push('/#/login');
                    }
                    if(data.success) {
                        vm.fileList.push({
                            url: `${vm.$store.state.host}${data.path}`,
                            path: data.path,
                            isImage: true,
                        });
                    }
                });
            }
            
        },
        clearTag: function(idx) {
            let vm = this;
            vm.community.tags.splice(idx, 1);
        },
        onSubmitTag: function() {
            let vm = this;
            vm.$store.state.clearError(vm.form_error);
            let regex1 = /[^가-힣\w\s]/g;
            if(regex1.test(vm.tag)) {
                vm.form_error["tags"] = "특수문자는 포함될 수 없습니다.";
                return;
            }
            let regex2 = /[a-zA-Z가-힣]/g;
            if(!regex2.test(vm.tag)) {
                vm.form_error["tags"] = "영어, 한글만 입력이 가능합니다.";
                return;
            }
            
            vm.community.tags.push(vm.tag);
            vm.tag = '';
        },
        onSave: function() {
            let vm = this;
            console.log("community:", vm.community);
            let imageList = [];
            vm.fileList.map((x) => {
                imageList.push(x.path);
            });
            let form_data = new Object();
            form_data = {
                coupleInfoId: vm.$store.state.couple.coupleInfoId,
                body: vm.community.body,
                imageList: imageList.join(","),
                tags: vm.community.tags.join(","),
                isPublish: (vm.community.isPublish) ? 1 : 0,
                likes: 0,
                comments: 0,
            };

            console.log("form_data:", form_data);
            vm.socket.emit('/socket/community/save/*', form_data, (data, err) => {
                console.log("data:", data);
                if(data.success) {
                    vm.$store.state.notify('success', data.message);
                } else {
                    if(Object.prototype.hasOwnProperty.call(data, 'error')) {
                        vm.$store.state.setError(vm.form_error, data.error);
                    }
                    if(Object.prototype.hasOwnProperty.call(data, 'message')) {
                        vm.$store.state.notify('danger', data.message);
                    }
                }
            });
        },
    },
    mounted: function() {
        let vm = this;
        if(!vm.$store.state.user.socketId) {
            vm.$router.push('/login');
        }
        vm.socket = vm.$store.state.socket;
    },
}
</script>