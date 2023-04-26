<template>
    <div id="app" style="max-width: 500px; width: 100%;">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'App',
        components: {
            
        },
        data() {
            return {
                socket: null,
                isAdmin: false,
            }
        },
        mounted: function() {
            let vm = this;
            vm.$store.commit('loadInitDecks');
            vm.$store.commit('loadPedigree');
            if(!vm.$store.state.user.socketId) {
                vm.$router.push('/login');
            }
        }
    }
</script>