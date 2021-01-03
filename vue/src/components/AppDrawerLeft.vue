<template>
	<q-drawer
		v-model="show"
		:content-class="!$q.dark.isActive ? 'bg-grey-2' : ''"
	>
		<!-- Chats -->
		<q-scroll-area style="height: calc(100% - 50px); margin-bottom: 50px;">
			<template v-if="$q.screen.lt.md">
				<q-item>
					<q-item-section class="text-body1 q-mt-sm">
						Transformice Web Client
					</q-item-section>
				</q-item>

				<q-separator dark spaced />
			</template>

			<q-list>
				<!-- Room Chat -->
				<t-chat
					:chat="roomChat"
					icon="home"
					@changeActiveChat="changeActiveChat"
				>
					<template #label> {{ roomName }} </template>
				</t-chat>

				<!-- Tribe Chat -->
				<t-chat
					:chat="tribeChat"
					icon="house"
					@changeActiveChat="changeActiveChat"
				>
					<template #label>
						Tribe Chat
					</template>
				</t-chat>

				<!-- Whispers -->
				<div class="q-my-md">
					<div class="row q-mx-md q-mt-md q-mb-sm text-grey">
						Whispers
						<q-space />
						<q-btn
							round
							flat
							icon="add"
							size="sm"
							@click="
								name => {
									if (!name) return;
									$q.dialog({
										title: 'Whisper Player',
										message: 'Player name:',
										prompt: {
											type: 'string'
										}
									}).onOk(name => {
										AppStore.addMessages({
											type: 'whisper',
											value: name.toLowerCase()
										});
										AppStore.changeActiveChat({
											name: 'whisper',
											data: name.toLowerCase()
										});
									});
								}
							"
						/>
					</div>
					<t-chat
						v-for="whisper in whispers"
						:key="whisper.value"
						:chat="whisper"
						icon="chat"
						label-class="text-capitalize"
						@changeActiveChat="changeActiveChat"
					/>
				</div>
				<!-- End Whispers -->

				<!-- Chat Channels -->
				<div class="q-my-md">
					<div class="row q-mx-md q-mt-md  q-mb-sm text-grey">
						Chat Channel
						<q-space />
						<q-btn
							round
							flat
							icon="add"
							size="sm"
							@click="
								name => {
									if (!name) return;
									$q.dialog({
										title: 'Enter New Chat Channel',
										message: 'Channel name:',
										prompt: {
											type: 'string'
										}
									}).onOk(name => {
										$socket.client.emit('joinChannel', [name]);
										AppStore.changeActiveChat({
											name: 'channel',
											data: name
										});
									});
								}
							"
						/>
					</div>

					<t-chat
						v-for="channel in channels"
						:key="channel.value"
						:chat="channel"
						@changeActiveChat="changeActiveChat"
					>
						<template #icon>
							<q-item-section avatar class="text-secondary text-h6 q-pl-sm">
								#
							</q-item-section>
						</template>
					</t-chat>
				</div>
				<!-- End Chat Channels -->
			</q-list>
		</q-scroll-area>
		<!-- End Chats -->

		<!-- Bottom -->
		<q-item class="absolute-bottom bg-accent" style="height: 50px">
			<div class="absolute-bottom">
				<q-item>
					<q-item-section>
						<q-item-label class="text-body1 text-capitalize">
							{{ username }}
						</q-item-label>
					</q-item-section>
					<q-item-section side>
						<div class="row q-gutter-x-sm">
							<q-btn
								:ripple="false"
								round
								flat
								padding="none"
								:color="!$q.dark.isActive ? 'black' : ''"
								icon="settings"
								@click="showSettings = true"
							/>
						</div>
					</q-item-section>
				</q-item>
			</div>
		</q-item>
		<!-- Bottom -->

		<!-- Settings Dialog -->
		<q-dialog v-model="showSettings">
			<q-card style="width: 700px; max-width: 95vw;" class="q-pa-md">
				<q-card-section class="text-center text-h6 q-py-sm">
					Settings
				</q-card-section>

				<q-card-section>
					<div class="row">
						<q-toggle
							color="info"
							v-model="localSettings.notification.whisper"
							label="Whisper Notification"
						/>
					</div>
					<div class="row">
						<q-toggle
							color="info"
							v-model="localSettings.notification.tribe"
							label="Tribe Notification"
						/>
					</div>
					<div class="row">
						<q-toggle
							color="info"
							v-model="localSettings.notification.room"
							label="Room Notification"
						/>
					</div>
					<div class="row">
						<q-toggle
							color="info"
							v-model="localSettings.notification.channel"
							label="Chat Channel Notification"
						/>
					</div>
				</q-card-section>

				<q-card-section>
					<div class="row">
						<q-toggle
							color="info"
							:value="$q.dark.isActive"
							@input="$q.dark.toggle()"
							label="Dark Mode"
						/>
					</div>
				</q-card-section>

				<q-separator spaced inset />

				<q-card-actions vertical align="right">
					<q-btn
						outline
						color="red-5"
						label="Logout"
						@click="$socket.client.emit('transformiceDisconnect')"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<!-- End Settings Dialog -->
	</q-drawer>
</template>

<script lang="ts">
import AppStore, { Settings } from "src/store/App";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { getModule } from "vuex-module-decorators";

import TChat from "./TChat.vue";

@Component({ components: { TChat } })
export default class AppDrawerLeft extends Vue {
	AppStore: AppStore;
	@Prop(Boolean) readonly value!: boolean;

	activeChat: "room" | "tribe" | "whisper" | "channel" = "room";
	activeChatData = "";
	show = this.value;
	showSettings = false;
	showHelp = false;

	localSettings: Settings = {
		notification: {
			whisper: true,
			tribe: true,
			room: false,
			channel: false
		},
		maxMessage: 250
	};

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);
	}

	created() {
		this.AppStore = getModule(AppStore, this.$store);
	}

	get roomName() {
		return this.AppStore.currentRoom;
	}

	get username() {
		return this.AppStore.username;
	}

	get roomChat() {
		return this.AppStore.chats.find(c => c.type === "room");
	}

	get tribeChat() {
		return this.AppStore.chats.find(c => c.type === "tribe");
	}

	get whispers() {
		return this.AppStore.chats.filter(c => c.type === "whisper");
	}

	get channels() {
		return this.AppStore.chats.filter(c => c.type === "channel");
	}

	@Watch("localSettings", { deep: true })
	onSettingsChange(settings: Settings) {
		this.AppStore.changeSettings(JSON.parse(JSON.stringify(settings)));
	}

	@Watch("show")
	onShowChange() {
		this.$emit("input", this.show);
	}

	@Watch("value")
	onValueChange() {
		this.show = this.value;
	}

	changeActiveChat(name: "room" | "tribe" | "whisper" | "channel", data = "") {
		this.activeChat = name;
		this.activeChatData = data;
		this.AppStore.changeActiveChat({
			name,
			data
		});
		if (this.$q.screen.lt.md) this.show = false;
	}
}
</script>
