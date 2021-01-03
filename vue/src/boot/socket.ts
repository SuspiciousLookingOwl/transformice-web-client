import { boot } from "quasar/wrappers";
import VueSocketIO from "vue-socket.io-extended";
import { io } from "socket.io-client";
import { capitalize } from "src/utils/utils";

const socket = io(process.env.SOCKET, {
	autoConnect: false
});

export default boot(({ Vue, store }) => {
	Vue.use(VueSocketIO, socket, {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		store,
		actionPrefix: "on",
		mutationPrefix: "on",
		eventToActionTransformer: (eventName: string) => capitalize(eventName),
		eventToMutationTransformer: (eventName: string) => capitalize(eventName)
	});
});
