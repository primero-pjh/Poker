<template>
    <div id="app" style="max-width: 500px; width: 100%;">
        <router-view></router-view>
        <DialogRegisterCouple ref="DialogRegisterCouple" />
    </div>
</template>


<script>
    import DialogRegisterCouple from '@/components/DialogRegisterCouple.vue';

    export default {
        name: 'App',
        components: {
            DialogRegisterCouple,
        },
        data() {
            return {
                socket: null,
                isAdmin: false,
            }
        },
        mounted: function() {
            let vm = this;
            if(!vm.$store.state.user.socketId) {
                vm.$router.push('/login');
            }
        }
    }
</script>