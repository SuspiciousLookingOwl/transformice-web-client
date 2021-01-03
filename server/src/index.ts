import "dotenv/config";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { createServer as createSecureServer, ServerOptions } from "https";
import fs from "fs";

import Client from "./Client";
import Logger from "./Logger";

let server;
// Run HTTPS in production, HTTP in development
if (process.env.NODE_ENV === "production") {
	// SSL
	const options: ServerOptions = {
		key: fs.readFileSync("privkey.pem", "utf-8"),
		cert: fs.readFileSync("cert.pem", "utf-8"),
		ca: fs.readFileSync("chain.pem", "utf-8"),
	};
	server = createSecureServer(options);
} else {
	server = createServer();
}

// cou can remove cors option here
const io = new Server(server, { cors: { origin: "*" } });

// store list of transformice clients
const clients: Map<string, Client> = new Map();

io.on("connection", (socket: Socket) => {
	Logger.log("Connection from", socket.id);

	socket.on("login", (username: string, password: string) => {
		let client = clients.get(username.toLowerCase());
		if (!client) {
			// Create new Client
			client = new Client();
			clients.set(username.toLowerCase(), client);
		}
		client.connect(username, password, socket);
	});
});

// Start the server
server.listen(+process.env.PORT || 3000);
