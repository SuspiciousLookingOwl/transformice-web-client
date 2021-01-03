<template>
	<div class="rounded-borders alert">
		<div class="bg-accent q-pa-sm row">
			<div v-if="icon" class="col-auto q-mr-sm">
				<q-icon :name="icon" size="sm" class="q-mr-xs" />
			</div>
			<div class="col">
				<slot>
					{{ message }}
				</slot>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class DAlert extends Vue {
	/* -------------------------------------------------------------------------- */
	/*                                    Props                                   */
	/* -------------------------------------------------------------------------- */

	/**
	 * The Icon of the alert
	 */
	@Prop() icon!: string;

	/**
	 * The message of the alert
	 */
	@Prop({ default: "" }) message!: string;

	/* -------------------------------------------------------------------------- */
	/*                                   Methods                                  */
	/* -------------------------------------------------------------------------- */
}
</script>
