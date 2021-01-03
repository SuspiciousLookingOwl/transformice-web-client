import "transformice.js";

declare module "transformice.js" {
	interface Message {
		id: number;
		timestamp: Date;
	}
}
