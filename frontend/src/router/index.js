import { createRouter, createWebHashHistory } from "vue-router";
import homeVue from "../views/home.vue";
import loginVue from "../views/login.vue";
import waitingVue from "../views/login/waiting.vue";
import errorVue from "../views/error.vue";
import profileVue from "../views/profile.vue";
import chatVue from "../views/chat.vue";
import calendarVue from "../views/calendar.vue";
import communityVue from "../views/community.vue";
import communityAddVue from "../views/community/add.vue";

const routes = [
    { path: "/", name: "home", component: homeVue, },
    { path: "/home", name: "home", component: homeVue, },
    { path: "/calendar", name: "calendar", component: calendarVue, },
    { path: "/chat", name: "chat", component: chatVue, },
    { path: "/login", name: "login", component: loginVue, },
    { path: "/waiting", name: "waiting", component: waitingVue, },
    { path: "/error", name: "error", component: errorVue, },
    { path: "/profile", name: "profile", component: profileVue, },
    /* community */
    { path: "/community", name: "community", component: communityVue, },
    { path: "/community/add", name: "communityAdd", component: communityAddVue, },

    { path: "/:pathMatch(.*)*", redirect: "/error" },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from) => {
    console.error(`from: ${from.fullPath}, to: ${to.fullPath}`);
});

export default router;