import Vue from "vue";
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import {
	Friend,
	WhisperMessage,
	ChannelMessage,
	RoomMessage,
	Tribe,
	Member,
	Player,
	Message,
	Room,
	Profile,
	RoomPlayer
} from "transformice.js";

import { capitalize, ciEquals, getAvatarById } from "src/utils/utils";
import { Socket } from "socket.io-client";

interface AlertMessage {
	content: string;
	id?: number;
	icon?: string;
	timestamp?: Date;
}

export interface Settings {
	notification: {
		whisper: boolean;
		tribe: boolean;
		room: boolean;
		channel: boolean;
	};
	maxMessage: number;
}

export interface Chat {
	type: "room" | "tribe" | "whisper" | "channel";
	value?: string;
	messages: (AlertMessage | WhisperMessage | ChannelMessage | RoomMessage)[];
	unread?: number;
}

@Module({ name: "App" })
export default class AppStore extends VuexModule {
	/* -------------------------------------------------------------------------- */
	/*                                    State                                   */
	/* -------------------------------------------------------------------------- */

	ready = false;
	username = "";
	currentRoom = "";

	activeChat: Chat["type"] = "room";
	activeChatData = "";

	profileTimeout = 0;
	avatarCache: { [key: string]: string | null } = {};

	settings: Settings = {
		notification: {
			whisper: true,
			tribe: true,
			room: false,
			channel: false
		},
		maxMessage: 250
	};

	chats: Chat[] = [
		{
			type: "room",
			messages: [],
			unread: 0
		},
		{
			type: "tribe",
			messages: [],
			unread: 0
		}
	];

	friends: Friend[] = [];
	tribeMembers: Member[] = [];

	/* -------------------------------------------------------------------------- */
	/*                                  Mutations                                 */
	/* -------------------------------------------------------------------------- */

	@Mutation
	changeSettings(settings: Settings) {
		Vue.set(this, "settings", settings);
	}

	/**
	 * changes current active chat, removes numbers of unread messages
	 */
	@Mutation
	changeActiveChat({ name, data = "" }: { name: Chat["type"]; data?: string }) {
		const oldChat = this.chats.find(
			c =>
				c.type === this.activeChat &&
				(this.activeChatData ? c.value === this.activeChatData : true)
		);
		if (oldChat) oldChat.unread = 0;

		this.activeChat = name;
		this.activeChatData = data;

		const newChat = this.chats.find(c => c.type === name && c.value === data);
		if (newChat) newChat.unread = 0;
	}

	/**
	 * add messages to a chat
	 */
	@Mutation
	addMessages({ type = "room", value = "", messages = [] }: Partial<Chat>) {
		// add timestamp and id to messages
		messages = messages.map(m => {
			const timestamp = new Date();
			m.timestamp = timestamp;
			m.id = timestamp.getTime();
			return m;
		});

		// find the chat
		const chat = this.chats.find(
			c => c.type === type && (value ? c.value === value : true)
		);

		if (chat) {
			// if chat exists, just append the message
			chat.unread = (chat.unread ?? 0) + messages.length;
			chat.messages.push(...messages);
			if (chat.messages.length > this.settings.maxMessage)
				chat.messages.splice(
					0,
					chat.messages.length - this.settings.maxMessage
				);
		} else {
			// if chat doesn't exists, create new chat containing the messages
			this.chats.push({
				type,
				value,
				messages,
				unread: messages.length
			});
		}
	}

	/**
	 * request transformice profile
	 */
	@Mutation
	getProfileAvatar({ name, socket }: { name: string; socket: Socket }) {
		this.avatarCache[name] = null;
		setTimeout(() => {
			socket.emit("requestProfile", [name]);
		}, this.profileTimeout);
		// add 500ms delay on each request
		this.profileTimeout += 500;
	}

	@Mutation
	changeCurrentRoom(roomName: string) {
		this.currentRoom = roomName;
	}

	@Mutation
	closeWhisper(name: string) {
		const index = this.chats.findIndex(
			c => c.type === "whisper" && c.value === name
		);
		if (index >= 0) this.chats.splice(index, 1);
	}

	/* -------------------------------------------------------------------------- */
	/*                                Socket events                               */
	/* -------------------------------------------------------------------------- */

	@Mutation
	onReady() {
		this.ready = true;
	}

	@Mutation
	onLogin([name]: [string]) {
		this.username = name.toLowerCase();
	}

	@Action({ commit: "addMessages" })
	onWhisper([message]: [WhisperMessage]) {
		let username = message.author.name.toLowerCase();
		if (ciEquals(message.author.name, this.username)) {
			username = message.sentTo;
		}

		return {
			type: "whisper",
			value: username,
			messages: [message]
		};
	}

	@Mutation
	onFriendList([friends]: [Friend[]]) {
		Vue.set(this, "friends", Object.values(friends));
	}

	@Mutation
	onTribe([tribe]: [Tribe]) {
		Vue.set(this, "tribeMembers", tribe.members);
	}

	@Mutation
	onFriendUpdate([friend]: [Friend]) {
		const index = this.friends.findIndex(f => f.id === friend.id);
		if (index >= 0) Vue.set(this.friends, index, friend);
		else this.friends.push(friend);
	}

	@Mutation
	onTribeMemberUpdate([member]: [Member]) {
		const index = this.tribeMembers.findIndex(m => m.id === member.id);
		if (index >= 0) Vue.set(this.tribeMembers, index, member);
		else this.tribeMembers.push(member);
	}

	@Action({ commit: "addMessages" })
	onTribeMessage([message]: [Message]): Chat {
		return {
			type: "tribe",
			messages: [message]
		};
	}

	@Action({ commit: "addMessages" })
	onRoomMessage([message]: [RoomMessage]): Chat {
		return {
			type: "room",
			messages: [message]
		};
	}

	@Action({ commit: "addMessages" })
	onRoomWho([players]: [RoomPlayer[]]): Chat {
		return {
			type: "room",
			messages: [
				{
					content: Object.values(players)
						.map(p => capitalize(p.name))
						.join(", "),
					icon: "group"
				}
			]
		};
	}

	@Action({ commit: "addMessages" })
	onChannelMessage([message]: [ChannelMessage]): Chat {
		return {
			type: "channel",
			value: message.channel.name,
			messages: [message]
		};
	}

	@Action({ commit: "addMessages" })
	onChannelWho([channelName, players]: [string, Player[]]): Chat {
		return {
			type: "channel",
			value: channelName,
			messages: [
				{
					content: Object.values(players)
						.map(p => capitalize(p.name))
						.join(", "),
					icon: "group"
				}
			]
		};
	}

	@Action({ commit: "addMessages" })
	onChannelJoin([name]: [string]) {
		return {
			type: "channel",
			value: name,
			messages: []
		};
	}

	@Mutation
	onChannelLeave([name]: [string]) {
		const index = this.chats.findIndex(
			c => c.type === "channel" && c.value === name
		);
		if (index >= 0) this.chats.splice(index, 1);
	}

	@Action({ commit: "addMessages" })
	onRoomChange([room]: [Room]): Chat {
		this.changeCurrentRoom(room.name);
		return {
			type: "room",
			messages: [
				{
					content: `Entered room ${room.name}`,
					icon: "home"
				}
			]
		};
	}

	@Action({ commit: "addMessages" })
	onRoomPlayerEnter([player]: [RoomPlayer]): Chat {
		return {
			type: "room",
			messages: [
				{
					content: `${capitalize(player.name)} entered the room`,
					icon: "exit_to_app"
				}
			]
		};
	}

	@Action({ commit: "addMessages" })
	onRoomPlayerLeave([player]: [RoomPlayer]): Chat {
		return {
			type: "room",
			messages: [
				{
					content: `${capitalize(player.name)} has left the room`,
					icon: "login"
				}
			]
		};
	}

	@Mutation
	onProfile([profile]: [Profile]) {
		this.profileTimeout -= 500;
		Vue.set(
			this.avatarCache,
			profile.name.toLowerCase(),
			getAvatarById(profile.id)
		);
	}
}
