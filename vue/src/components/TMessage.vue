<template>
	<div>
		<div class="row" v-if="name">
			<div class="col-auto q-pr-sm">
				<q-avatar size="42px">
					<img
						:src="avatar"
						onerror="this.onerror=null;this.src='https://avatars.atelier801.com/0/0.jpg';"
					/>
				</q-avatar>
			</div>
			<div class="col">
				<div>
					<span class="text-weight-medium">{{ capitalize(name) }}</span>
					<span class="q-ml-sm text-caption text-grey">{{ time }}</span>
				</div>
				<div>{{ message }}</div>
			</div>
		</div>
		<t-alert v-else :message="message" :color="color" :icon="icon" />
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";
import { Socket } from "vue-socket.io-extended";

import TAlert from "src/components/TAlert.vue";
import { capitalize, ciEquals } from "src/utils/utils";
import AppStore from "src/store/App";
import { Profile } from "transformice.js";

@Component({ components: { TAlert } })
export default class TMessage extends Vue {
	AppStore: AppStore;
	avatar = "";

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);
	}

	@Prop({ type: String }) name!: string;
	@Prop({ type: String, required: true }) message!: string;
	@Prop({ type: Date }) timestamp!: Date;
	@Prop({ type: String }) color!: string;
	@Prop({ type: String }) icon!: string;

	get time() {
		if (!this.timestamp) return "";
		let hours: string | number = this.timestamp.getHours();
		let minutes: string | number = this.timestamp.getMinutes();
		let seconds: string | number = this.timestamp.getSeconds();

		hours = hours < 10 ? `0${hours}` : hours;
		minutes = minutes < 10 ? `0${minutes}` : minutes;
		seconds = seconds < 10 ? `0${seconds}` : seconds;

		return `${hours}:${minutes}:${seconds}`;
	}

	@Socket("profile")
	onProfile([profile]: [Profile]) {
		if (ciEquals(profile.name, this.name)) {
			this.$nextTick(() => {
				this.updateAvatar();
			});
		}
	}

	created() {
		this.updateAvatar();
	}

	updateAvatar() {
		if (!this.name) return;

		const avatar = this.AppStore.avatarCache[this.name.toLowerCase()];
		if (avatar === undefined) {
			this.AppStore.getProfileAvatar({
				name: this.name.toLowerCase(),
				socket: this.$socket.client
			});
		}

		if (avatar === null) this.avatar = "https://avatars.atelier801.com/0/0.jpg";
		else this.avatar = avatar;
	}
	capitalize = capitalize;
}
</script>
