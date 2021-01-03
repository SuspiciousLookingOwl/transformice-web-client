import { Socket } from "socket.io";
import bcrypt from "bcrypt";
import fs from "fs";
import util from "util";
import { Client as TransformiceClient } from "transformice.js";
import ClientEvents from "transformice.js/dist/client/Events";

import Logger from "./Logger";
import { flatten } from "./util";

const readFile = util.promisify(fs.readFile);

export default class Client {
	/**
	 * Socket instance
	 */
	sockets!: Socket[];
	/**
	 * Transformice client instance
	 */
	transformice!: TransformiceClient | null;
	/**
	 * Client's username
	 */
	username!: string;
	/**
	 * Hashed password
	 */
	hashedPassword!: string;

	// Allowed events to be emitted to socket client
	static ALLOWED_EVENTS = [
		"ready",
		"friendList",
		"friendConnect",
		"friendDisconnect",
		"friendChange",
		"friendUpdate",
		"tribe",
		"profile",
		"roomChange",
		"roomMessage",
		"roomUpdate",
		"roomPlayerEnter",
		"roomPlayerLeave",
		"tribeMessage",
		"tribeMemberConnect",
		"tribeMemberUpdate",
		"tribeMemberDisconnect",
		"channelWho",
		"channelJoin",
		"channelLeave",
		"channelMessage",
		"whisper",
	] as (keyof ClientEvents)[];

	// Allowed method to be called from socket client
	static ALLOWED_METHOD = [
		"requestProfile",
		"requestWho",
		"enterRoom",
		"sendRoomMessage",
		"sendWhisper",
		"sendTribeMessage",
		"enterTribeHouse",
		"requestTribe",
		"joinChannel",
		"leaveChannel",
		"sendChannelMessage",
		"requestFriendList",
	] as (keyof TransformiceClient)[];

	constructor() {
		this.sockets = [];
	}

	get loggedIn() {
		return !!this.hashedPassword;
	}

	/**
	 * Connect to Transformice
	 */
	async connect(username: string, password: string, socket: Socket) {
		username = username.toLowerCase();

		/**
		 * Get allowed users from users.json, and check if username is allowed
		 *
		 * Usernames in users.json has to be lowercase,
		 * ! if no username is given in users.json, it will allows any users
		 */
		const allowedUsers = JSON.parse(await readFile("./dist/users.json", "utf-8")) as string[];
		if (allowedUsers.length > 0 && !allowedUsers.includes(username))
			return socket.emit("loginError", [-1]);

		// if not logged in to transformice, create new Transformice Client and connect
		if (!this.transformice || !this.loggedIn) {
			this.transformice = new TransformiceClient(username, password, { autoReconnect: false });

			// if login success
			this.transformice.on("login", async (...args) => {
				// Here you can store the client's username and password, BUT PLEASE DON'T DO THAT
				this.username = username;
				this.registerSocket(socket);
				this.emit("login", args);
				// store hashed password
				this.hashedPassword = await bcrypt.hash(password, 14);
			});

			// "disconnect" event is reserved by socket.io, emits "transformiceDisconnect" instead
			this.transformice.on("disconnect", () => {
				this.emit("transformiceDisconnect");
			});

			this.transformice.on("loginError", (...args) => {
				socket.emit("loginError", args);
			});

			// if connection error, emit disconnection
			this.transformice.on("connectionError", (err) => {
				Logger.log(err);
				this.emit("transformiceDisconnect");
				this.disconnect();
			});

			// binding transformice events
			for (const event of Client.ALLOWED_EVENTS) {
				this.transformice.on(event, (...args: unknown[]) => {
					this.emit(event, args);
				});
			}

			// run the client
			this.transformice.run(process.env.TFM_ID, process.env.TFM_TOKEN);
		}

		// If transformice is logged in, it will check if the username password is correct
		else if (this.username === username && (await bcrypt.compare(password, this.hashedPassword))) {
			this.registerSocket(socket);

			// Emulate login events
			socket.emit("login", [username]);
			await new Promise((r) => setTimeout(r, 2500));
			socket.emit("ready");
			for (const channel of this.transformice.channels) socket.emit("channelJoin", [channel]);
			// DON'T REMOVE THE flatten AS YOU MIGHT EMITS YOUR TRANSFORMICE TOKEN TO THE CLIENT
			socket.emit("roomChange", [flatten(this.transformice.room, { client: false })]);
		} else {
			this.transformice.on("loginError", (...args) => {
				socket.emit("loginError", args);
			});
		}
	}

	/**
	 * Register a socket to client and add events listener
	 */
	private registerSocket(socket: Socket) {
		this.sockets.push(socket);

		// bind event listener
		for (const event of Client.ALLOWED_METHOD) {
			socket.on(event, (args) => {
				// @ts-ignore
				this.transformice[event](...(args || []));
			});
		}

		// if socket disconnected, remove from sockets list
		socket.on("disconnect", () => {
			Logger.log("Disconnection from ", socket.id);
			const index = this.sockets.findIndex((s) => s.id === socket.id);
			if (index >= 0) this.sockets.splice(index, 1);
		});

		// event when user logged out from the client app
		socket.on("transformiceDisconnect", () => {
			this.disconnect();
		});

		// custom events
		socket.on("requestRoomWho", () => {
			this.emit("roomWho", [this.transformice?.room.playerList]);
		});
	}

	disconnect() {
		if (this.transformice) {
			this.transformice.disconnect();
			this.transformice.removeAllListeners();
			this.transformice = null;
			this.hashedPassword = "";
		}
		this.sockets.forEach((s) => {
			s.removeAllListeners();
		});
	}

	/**
	 * Emit an event to all sockets
	 */
	emit(event: string, data: unknown[] = []) {
		Logger.log(this.username, event);
		this.sockets.forEach((s) => {
			s.emit(
				event,
				// DON'T REMOVE THE flatten AS YOU MIGHT EMITS YOUR TRANSFORMICE TOKEN TO THE CLIENT
				data.map((a) => flatten(a, { client: false, tribe: false }))
			);
		});
	}
}
