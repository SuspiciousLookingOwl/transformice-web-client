<template>
	<div>
		<q-header>
			<q-toolbar
				class="bg-accent"
				:class="$q.dark.isActive ? 'text-white' : 'text-black'"
			>
				<q-toolbar-title class="text-body1 text-weight-medium">
					<div class="row">
						<div
							:style="
								$q.screen.gt.sm && leftDrawerOpen
									? 'width: 300px !important'
									: ''
							"
							class="q-my-auto"
						>
							<q-btn
								flat
								dense
								round
								icon="menu"
								size="md"
								class="q-mr-md"
								aria-label="Menu"
								@click="leftDrawerOpen = !leftDrawerOpen"
							/>
							<template v-if="$q.screen.gt.sm && leftDrawerOpen">
								Transformice Web Client
							</template>
						</div>
						<div class="q-my-auto">
							<q-avatar v-if="title.icon">
								<q-icon :name="title.icon" />
							</q-avatar>
							{{ title.text }}
						</div>
					</div>
				</q-toolbar-title>

				<q-btn
					flat
					dense
					round
					icon="group"
					aria-label="Menu"
					@click="rightDrawerOpen = !rightDrawerOpen"
				/>
			</q-toolbar>
		</q-header>

		<app-drawer-left
			v-model="leftDrawerOpen"
			bordered
			content-class="bg-grey-1"
		/>

		<app-drawer-right
			v-model="rightDrawerOpen"
			bordered
			content-class="bg-grey-1"
		/>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";

import AppStore from "src/store/App";
import AppDrawerLeft from "./AppDrawerLeft.vue";
import AppDrawerRight from "./AppDrawerRight.vue";
import { capitalize } from "src/utils/utils";

@Component({ components: { AppDrawerLeft, AppDrawerRight } })
export default class ClassComponent extends Vue {
	AppStore: AppStore;
	@Prop(Boolean) readonly active!: boolean;

	leftDrawerOpen = true;
	rightDrawerOpen = true;

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);
	}

	get title() {
		const activeChat = this.AppStore.activeChat;
		const activeChatData = this.AppStore.activeChatData;

		if (activeChat === "room") {
			return { icon: "house", text: this.AppStore.currentRoom };
		} else if (activeChat === "tribe") {
			return { text: "Tribe Chat" };
		} else if (activeChat === "whisper") {
			return { text: `@${capitalize(activeChatData)}` };
		} else if (activeChat === "channel") {
			return { text: `# ${activeChatData}` };
		} else {
			return { text: "Transformice Web Client" };
		}
	}
}
</script>
