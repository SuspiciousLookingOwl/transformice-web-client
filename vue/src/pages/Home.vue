<template>
	<div class="fullscreen text-center q-pa-md flex flex-center">
		<div>
			<q-form @submit="login" class="q-gutter-md">
				<div class="text-h4 text-primary">
					Transformice <br />
					Chat Client
				</div>
				<q-input
					v-model="username"
					:disable="loggingIn"
					type="text"
					outlined
					label="Username"
				/>
				<q-input
					v-model="password"
					:disable="loggingIn"
					type="password"
					outlined
					label="Password"
				/>
				<q-btn
					type="submit"
					outline
					color="primary"
					label="Login"
					:loading="loggingIn"
					:disable="loggingIn"
				/>
			</q-form>
		</div>
	</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Socket } from "vue-socket.io-extended";

@Component
export default class Home extends Vue {
	username = "";
	password = "";
	loggingIn = false;

	login() {
		this.loggingIn = true;
		this.$socket.client.emit("login", this.username, this.password);
	}

	@Socket("login")
	onLogin() {
		void this.$router.push({ name: "app" });
	}

	@Socket("loginError")
	onLoginError() {
		this.$q.notify({
			message: "Failed to login.",
			type: "negative",
			position: "top"
		});
		this.loggingIn = false;
	}
}
</script>
