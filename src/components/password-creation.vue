<template>
	<div class="app-password-creation">
		<div class="row">
			<div class="col-sm-6">
				<div class="form-group">
					<label class="form-group-Title">Password</label>
					<div class="form-group-Field">
						<input id="p1" type="password" class="form-control" v-model="password" v-validate="{ template: { compare: ['#p1', '#p2'], length: 6}}" :data-error="error">
						<div class="invalid-feedback"></div>
					</div>
				</div>
			</div>
			<div class="col-sm-6">
				<div class="form-group">
					<label class="form-group-Title">Confirm Password</label>
					<div class="form-group-Field">
						<input id="p2" type="password" class="form-control" v-model="passwordCheck" v-validate="{ template: { compare: ['#p1', '#p2']}}" :data-error="errorConfirm">
						<div class="invalid-feedback"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			password: null,
			passwordCheck: null,
			securityLevel: 0,
			passwordMatch: false,
			error: null,
			errorConfirm: null
		}
	},
	methods: {
		check() {
			this.error = this.securityLevel < 2 ? 'Invalid field length' : null
			this.errorConfirm = !this.passwordMatch ? 'Fields don\'t match' : null
		}
	},
	watch: {
		password(value) {
			if (value.length >= 3 && value.length <= 5) this.securityLevel = 1
			else if (value.length > 5 && value.length <= 9) this.securityLevel = 2
			else if (value.length >= 9 && value.length <= 12) this.securityLevel = 3
			else if (value.length >= 12) this.securityLevel = 4
			else this.securityLevel = 0
			this.$emit('update:value', value)
			this.passwordMatch = (!!value && value == this.passwordCheck)
			this.check()
		},
		passwordCheck(value) {
			this.passwordMatch = (!!value && value == this.password)
			this.check()
		}
	}
}
</script>