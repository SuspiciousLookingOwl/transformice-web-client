<template>
	<q-item clickable v-ripple :class="$q.screen.gt.sm ? 'q-py-none' : 'q-py-sm'">
		<q-item-section avatar>
			<q-avatar size="lg">
				<img :src="getAvatarById(player.id)" @error="onImageError" />
			</q-avatar>
		</q-item-section>
		<q-item-section>
			<q-item-label class="text-capitalize">{{ player.name }}</q-item-label>
			<q-item-label caption lines="1">
				<slot name="info">
					<template v-if="player.isConnected === false || player.gameId === 1">
						{{
							new Date(player.lastConnection * 60 * 1000)
								.toLocaleString("en-GB")
								.slice(0, -3)
						}}
					</template>
					<template v-else-if="player.roomName">
						<div class="row text-grey">
							<img class="q-mr-xs" :src="room.communityFlag" />
							<span class="q-my-auto">
								{{ room.name }}
							</span>
						</div>
					</template>
				</slot>
			</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import { getAvatarById, getCommunity } from "src/utils/utils";
import { Friend, Member } from "transformice.js";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class TPlayer extends Vue {
	@Prop({ required: true }) player!: Friend | Member;

	get room() {
		if (this.player.roomName.startsWith("*"))
			return {
				name: this.player.roomName,
				communityFlag: "http://www.transformice.com/images/drapeaux/16/INT.png"
			};
		let roomNameParts = this.player.roomName.split("-");
		return {
			communityFlag: `http://www.transformice.com/images/drapeaux/16/${getCommunity(
				roomNameParts.shift() || ""
			).toUpperCase()}.png`,
			name: roomNameParts.join("-")
		};
	}

	onImageError(event: Event) {
		(event.target as HTMLImageElement).src =
			"https://avatars.atelier801.com/0/0.jpg";
	}

	getAvatarById = getAvatarById;
}
</script>
