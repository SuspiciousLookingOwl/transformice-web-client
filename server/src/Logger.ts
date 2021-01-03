export default class Logger {
	static log(...args: unknown[]) {
		if (process.env.LOG === "true") console.log(...args);
	}
}
