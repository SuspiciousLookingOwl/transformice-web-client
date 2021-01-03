import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
	{
		name: "home",
		path: "/",
		component: () => import("pages/Home.vue")
	},

	{
		name: "app",
		path: "/app",
		component: () => import("pages/ChatApp.vue")
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: "*",
		component: () => import("pages/Error404.vue")
	}
];

export default routes;
