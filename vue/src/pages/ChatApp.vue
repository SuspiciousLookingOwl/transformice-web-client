<template>
	<div>
		<app-header v-if="$route.name === 'app'" ref="header" />
		<q-page ref="page">
			<!-- Chats -->
			<keep-alive>
				<dynamic-scroller
					ref="chats"
					:key="`${activeChat}/${activeChatData}`"
					@scroll.native="scrollListener"
					:items="messages"
					:min-item-size="58"
					:style="`margin-bottom: 52px; height:${scrollHeight - 52}px`"
					key-field="id"
				>
					<template v-slot="{ item, index, active }">
						<dynamic-scroller-item
							:item="item"
							:active="active"
							:data-index="index"
						>
							<t-message
								:name="item.author ? item.author.name : ''"
								:message="item.content"
								:timestamp="item.timestamp"
								:color="item.color"
								:icon="item.icon"
								class="q-mx-md q-py-sm"
							/>
						</dynamic-scroller-item>
					</template>
				</dynamic-scroller>
			</keep-alive>

			<!-- Scroll To Bottom Button -->
			<q-page-sticky
				v-if="scrollSize - scrollPosition > 800"
				position="bottom-right"
				:offset="[8, 48]"
				expand
			>
				<q-btn
					color="accent"
					dense
					no-caps
					class="text-caption text-weight-light"
					icon="keyboard_arrow_down"
					label="Scroll To Bottom"
					@click="scrollChatToBottom()"
				/>
			</q-page-sticky>

			<!-- Message Input -->
			<div class="absolute-bottom" style="height: 46px">
				<div class="absolute-top">
					<q-input
						v-model="message"
						ref="input"
						type="text"
						outlined
						class="q-mx-sm"
						maxlength="255"
						dense
						:disable="inputDisabled"
						placeholder="Send a message"
						@keydown.enter="sendMessage()"
					>
						<template v-slot:append>
							<q-btn round dense flat icon="send" @click="sendMessage()" />
						</template>
					</q-input>
				</div>
			</div>
			<!-- End Message Input -->
		</q-page>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { Socket } from "vue-socket.io-extended";
import { getModule } from "vuex-module-decorators";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";

import TMessage from "src/components/TMessage.vue";
import AppHeader from "src/components/AppHeader.vue";
import AppStore from "src/store/App";
import { capitalize, ciEquals } from "src/utils/utils";
import debounce from "debounce";

@Component({
	components: { TMessage, AppHeader, DynamicScroller, DynamicScrollerItem }
})
export default class ChatApp extends Vue {
	AppStore: AppStore;
	message = "";
	inputDisabled = false;
	isScrollBottom = true;
	scrollPosition = 0;
	scrollSize = 0;
	scrollHeight = 0;
	scrollListener: (e: Event) => void;
	resizeListener: (e: Event) => void;

	constructor() {
		super();
		this.AppStore = getModule(AppStore, this.$store);

		this.scrollListener = debounce((e: Event) => {
			this.onScroll(e);
		}, 100);
		this.resizeListener = debounce(() => {
			this.updateScrollHeight();
		}, 100);
	}

	/* -------------------------------------------------------------------------- */
	/*                                  Computed                                  */
	/* -------------------------------------------------------------------------- */

	get username() {
		return this.AppStore.username;
	}

	get activeChat() {
		return this.AppStore.activeChat;
	}

	get activeChatData() {
		return this.AppStore.activeChatData;
	}

	get ready() {
		return this.AppStore.ready;
	}

	get messages() {
		const chat = this.AppStore.chats.find(
			c =>
				c.type === this.activeChat &&
				(this.activeChatData ? this.activeChatData === c.value : true)
		);
		return chat?.messages || [];
	}

	get settings() {
		return this.AppStore.settings;
	}

	/* -------------------------------------------------------------------------- */
	/*                              Hooks & Watchers                              */
	/* -------------------------------------------------------------------------- */

	mounted() {
		if (!this.username) return this.$router.push({ name: "home" });
		if (!this.ready) this.$q.loading.show();

		this.updateScrollHeight();

		window.addEventListener("resize", this.resizeListener);
		window.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter") this.focusInput();
		});
	}

	beforeDestroy() {
		window.removeEventListener("resize", this.resizeListener);
	}

	@Watch("activeChat")
	@Watch("activeChatData")
	onActiveChatChange() {
		this.focusInput();
		this.scrollChatToBottom();
		this.isScrollBottom = true;
	}

	@Watch("messages", { deep: true })
	onNewMessage() {
		if (this.isScrollBottom) this.scrollChatToBottom();
		else if (this.messages) {
			const message = this.messages[this.messages.length - 1];
			if (
				message &&
				"author" in message &&
				ciEquals(message.author.name, this.username)
			) {
				this.scrollChatToBottom();
			}
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                                Socket Events                               */
	/* -------------------------------------------------------------------------- */

	@Socket("whisper")
	onWhisper() {
		if (this.settings.notification.whisper) this.playNotification();
	}

	@Socket("tribeMessage")
	onTribeMessage() {
		if (this.settings.notification.tribe) this.playNotification();
	}

	@Socket("roomMessage")
	onRoomMessage() {
		if (this.settings.notification.room) this.playNotification();
	}

	@Socket("channelMessage")
	onChannelMessage() {
		if (this.settings.notification.channel) this.playNotification();
	}

	@Socket("friendConnect")
	onFriendConnect([name]: [string]) {
		this.$q.notify({
			message: `${capitalize(name)} just connected`,
			type: "info",
			position: this.$q.screen.gt.md ? "bottom-right" : "top",
			closeBtn: true
		});
	}

	@Socket("friendDisconnect")
	onFriendDisconnect([name]: [string]) {
		this.$q.notify({
			message: `${capitalize(name)} has disconnected`,
			type: "info",
			position: this.$q.screen.gt.md ? "bottom-right" : "top",
			closeBtn: true
		});
	}

	@Socket("tribeMemberConnect")
	onTribeMemberConnect([name]: [string]) {
		this.$q.notify({
			message: `${capitalize(name)} just connected`,
			type: "positive",
			position: this.$q.screen.gt.md ? "bottom-right" : "top",
			closeBtn: true
		});
	}

	@Socket("tribeMemberDisconnect")
	onTribeMemberDisconnect([name]: [string]) {
		this.$q.notify({
			message: `${capitalize(name)} has disconnected`,
			type: "positive",
			position: this.$q.screen.gt.md ? "bottom-right" : "top",
			closeBtn: true
		});
	}

	@Socket("ready")
	onReady() {
		this.$socket.client.emit("requestFriendList");
		this.$socket.client.emit("requestTribe");
		this.$q.loading.hide();
	}

	@Socket("transformiceDisconnect")
	@Socket("disconnect")
	onDisconnect() {
		this.$socket.client.disconnect();
		this.$socket.client.connect();
		void this.$router.push({ name: "home" });
	}

	/* -------------------------------------------------------------------------- */
	/*                                   Methods                                  */
	/* -------------------------------------------------------------------------- */

	focusInput() {
		if (!this.$refs.input) return;
		((this.$refs.input as Vue).$el as HTMLInputElement).focus();
	}

	updateScrollHeight() {
		this.scrollHeight = (this.$refs.page as Vue).$el.clientHeight;
	}

	playNotification() {
		void new Audio("./audio/notification.mp3").play();
	}

	scrollChatToBottom() {
		this.$nextTick(() => {
			const chats = (this.$refs.chats as Vue).$el as HTMLElement;
			chats.scrollTop = this.scrollSize;
		});
	}

	sendMessage() {
		const message = this.message.trim();
		if (!message) return;
		this.inputDisabled = true;
		setTimeout(() => {
			this.inputDisabled = false;
			this.focusInput();
		}, 1000);

		const client = this.$socket.client;
		if (message.startsWith("/")) {
			const params = message.split(" ");
			this.sendCommand(params.shift()?.substring(1) || "", params);
		} else {
			if (this.activeChat === "room") {
				client.emit("sendRoomMessage", [message]);
			} else if (this.activeChat === "tribe") {
				client.emit("sendTribeMessage", [message]);
			} else if (this.activeChat === "whisper") {
				client.emit("sendWhisper", [this.activeChatData, message]);
			} else if (this.activeChat === "channel") {
				client.emit("sendChannelMessage", [this.activeChatData, message]);
			}
		}

		this.message = "";
	}

	sendCommand(command: string, params: string[] = []) {
		if (command === "room") {
			this.$socket.client.emit("enterRoom", [params.join(" ")]);
		} else if (command === "tribe") {
			this.$socket.client.emit("enterTribeHouse");
		}

		if (this.activeChat === "channel") {
			if (command === "who") {
				this.$socket.client.emit("requestWho", [this.activeChatData]);
			}
		} else if (this.activeChat === "room") {
			if (command === "who") {
				this.$socket.client.emit("requestRoomWho");
			}
		}
	}

	onScroll(e: Event) {
		const { scrollHeight, scrollTop, clientHeight } = e.target as HTMLElement;
		this.isScrollBottom = scrollHeight - scrollTop - clientHeight === 0;
		this.scrollPosition = scrollTop + clientHeight;
		this.scrollSize = scrollHeight;
	}

	ciEquals = ciEquals;
}
</script>
