<template>
    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
        <van-image src="/images/doge_v3.png" />
        <p style="text-align: center;">권한이 없거나</p>
        <p style="text-align: center;">잘못된 URL 입니다.</p>
        <van-button type="primary" @click="clickHome" style="width: 100%;">
            홈으로 이동
        </van-button>
    </div>
</template>

<script>
export default {
    name: 'errorVue',
    data() {
        return {
        }
    },
    methods: {
        clickHome: function() {
            this.$router.push('/calendar');
        },
    },
    mounted: function() {
    }
}
</script>