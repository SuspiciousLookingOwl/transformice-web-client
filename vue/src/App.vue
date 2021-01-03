<template>
	<div id="q-app">
		<q-layout view="hHh LpR lFf">
			<q-page-container>
				<router-view />
			</q-page-container>
		</q-layout>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

@Component
export default class App extends Vue {
	created() {
		this.$socket.client.open();
		this.$q.dark.set(true);
	}
}
</script>
