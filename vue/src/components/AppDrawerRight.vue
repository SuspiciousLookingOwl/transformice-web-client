<template>
	<q-drawer
		v-model="show"
		:content-class="!$q.dark.isActive ? 'bg-grey-2' : ''"
		side="right"
	>
		<!-- Tabs -->
		<q-item class="absolute-top" style="height: 48px">
			<div class="absolute-bottom">
				<q-tabs v-model="tab" align="justify">
					<q-tab name="friends" label="Friends" />
					<q-tab name="tribeMembers" label="Tribe" />
				</q-tabs>
			</div>
		</q-item>
		<!-- End Tabs -->
		<keep-alive>
			<recycle-scroller
				:key="tab"
				:items="players"
				:item-size="48"
				:buffer="400"
				style="height: calc(100% - 48px); margin-top: 48px;"
			>
				<template v-slot="{ item }">
					<div v-if="'label' in item" class="q-ml-md q-mt-md q-mb-sm text-grey">
						{{ item.label }}
					</div>
					<t-player
						v-else
						:player="item"
						:class="!item.roomName ? 'grey-out' : ''"
					/>
				</template>
			</recycle-scroller>
		</keep-alive>
	</q-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";
import { RecycleScroller } from "vue-virtual-scroller";

import AppStore from "src/store/App";
import TPlayer from "./TPlayer.vue";
import { getAvatarById } from "src/utils/utils";

@Component({
	components: { TPlayer, RecycleScroller }
})
export default class AppDrawerRight extends Vue {
	AppStore: AppStore;
	@Prop(Boolean) readonly value!: boolean;

	show = this.value;
	tab: "friends" | "tribeMembers" = "friends";

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);
	}

	get onlinePlayers() {
		if (this.tab === "friends")
			return this.AppStore.friends.filter(f => f.isConnected);
		else return this.AppStore.tribeMembers.filter(m => m.gameId !== 1);
	}

	get offlinePlayers() {
		if (this.tab === "friends")
			return this.AppStore.friends.filter(f => !f.isConnected);
		else return this.AppStore.tribeMembers.filter(m => m.gameId === 1);
	}

	get players() {
		return [
			{ label: `Online - ${this.onlinePlayers.length}`, id: "onlineLabel" },
			...this.onlinePlayers,
			{ label: `Offline - ${this.offlinePlayers.length}`, id: "offlineLabel" },
			...this.offlinePlayers
		];
	}

	@Watch("show")
	onShowChange() {
		this.$emit("input", this.show);
	}

	@Watch("value")
	onValueChange() {
		this.show = this.value;
	}

	getAvatarById = getAvatarById;
}
</script>
