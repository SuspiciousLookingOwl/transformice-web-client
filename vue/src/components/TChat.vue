<template>
	<q-item
		:dense="$q.screen.gt.sm ? true : false"
		clickable
		:active="
			activeChat === chat.type &&
				(activeChatData ? activeChatData === chat.value : true)
		"
		:active-class="$q.dark.isActive ? 'bg-grey-9' : 'bg-blue-2'"
		class="q-py-none"
		@click="$emit('changeActiveChat', chat.type, chat.value)"
		v-ripple
	>
		<!-- Context Menu -->
		<q-popup-proxy context-menu v-if="contextMenu.length > 0">
			<q-list style="min-width: 100px" class="bg-accent">
				<q-item
					v-for="(menu, i) in contextMenu"
					:key="i"
					clickable
					v-close-popup
					@click="menu.onClick"
				>
					<q-item-section avatar>
						<q-icon :name="menu.icon" />
					</q-item-section>
					<q-item-section>{{ menu.label }} </q-item-section>
				</q-item>
			</q-list>
		</q-popup-proxy>
		<!-- End Context Menu -->

		<slot name="icon">
			<q-item-section v-if="icon" avatar>
				<q-avatar size="lg">
					<q-icon :name="icon" color="secondary" />
				</q-avatar>
			</q-item-section>
		</slot>
		<q-item-section :class="labelClass">
			<slot name="label">
				{{ chat.value || chat.type }}
			</slot>
		</q-item-section>
		<q-item-section side v-if="showUnreadBadge">
			<q-badge color="red" :label="chat.unread" />
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import { getModule } from "vuex-module-decorators";
import { Vue, Component, Prop } from "vue-property-decorator";

import AppStore, { Chat } from "src/store/App";

@Component
export default class TChat extends Vue {
	AppStore: AppStore;
	@Prop() chat!: Chat;
	@Prop() labelClass!: string;
	@Prop() icon!: string;

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);
	}

	get username() {
		return this.AppStore.username;
	}

	get activeChat() {
		return this.AppStore.activeChat;
	}

	get activeChatData() {
		return this.AppStore.activeChatData;
	}

	get showUnreadBadge() {
		return !!(
			this.chat.unread &&
			(this.activeChatData ? this.activeChatData !== this.chat.value : true) &&
			(!this.activeChatData ? this.activeChat !== this.chat.type : true)
		);
	}

	get contextMenu() {
		if (this.chat.type === "channel")
			return [
				{
					label: "Leave",
					icon: "exit_to_app",
					onClick: () => {
						+this.$socket.client.emit("leaveChannel", [this.chat.value]);
					}
				}
			];

		if (this.chat.type === "whisper")
			return [
				{
					label: "Close",
					icon: "close",
					onClick: () => {
						this.AppStore.changeActiveChat({ name: "room" });
						this.AppStore.closeWhisper(this.chat.value || "");
					}
				}
			];

		return [];
	}
}
</script>
