<template>
    <div id="com_card_insta" 
        class="w100p">
        <div>
            {{item}}
        </div>
    </div>
</template>

<script>

export default {
    name: 'com_card_insta',
    props: ['item'],
    data() {
        return {

        }
    },
    methods: {
    },
    mounted: function() {
        let vm = this;
        let socket = vm.$store.state.socket;
    }
}
</script>
