declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: string;
		TFM_ID: string;
		TFM_TOKEN: string;
		PORT: string;
		SECURE: string;
	}
}
