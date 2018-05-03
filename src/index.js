import { unique, isString, isObject, isFunction } from 'moon-helper'
import passwordCreation from './components/password-creation'
import Vue from 'vue'

const config = {
	classes: {
		needValidation: 'need-validation',
		isInvalid: 'is-invalid',
		invalidFeedback: 'invalid-feedback',
	},
	attributes: {
		ref: 'form-ref',
		id: 'form-ref-id',
		error: 'data-error',
		reference: 'validation-reference'
	},
	label: {
		required: 'Required field',
		email: 'Invalid email address',
		phone: 'Invalid phone number',
		length: 'Invalid field length',
		match: 'Fields don\'t match'
	}
}

const formContainer = {
	render(el) {
		return el('form', {
			attrs: {
				id: this.id
			}
		}, this.$slots.default)
	},
	data() {
		return {
			id: `v${unique()}`
		}
	},
	mounted() {
		ValidateForm(`#${this.id}`, this.submit)
	},
	methods: {
		submit() {
			if (ValidationForm(`#${this.id}`)) this.$emit('submit', true)
		}
	}
}

const templates = {
	email: value => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,4}$/.test(value),
	phone: value => /^(\([0-9]{2}\)\s)[0-9]{4,5}-[0-9]{4}$/.test(value),
	length: (value, length) => value.length >= length,
	compare: (value, data) => {
		let arrow = document.querySelector(data[0]).value
		let target = document.querySelector(data[1])
		if (target.value && target.value != arrow) return false
		else return true
	}
}

const masks = {
	phone(value, v) {
		v = value.length > 14 ?
		value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/) :
		value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,4})(\d{0,4})/)
		return !v[2] ? v[1] : '(' + v[1] + ') ' + v[2] + (v[3] ? '-' + v[3] : '')
	}
}

const mask = (el, template) => {
	if (isString(template) && masks.hasOwnProperty(template)) {
		el.value = masks[template](el.value)
	} else if (isObject(template)) {
		for (let rule in template) {
			if (masks.hasOwnProperty(rule)) {
				el.value = masks[rule](el.value)
			}
		}
	}
}

const error = (el, label) => {
	if (label) {
		el.classList.add(config.classes.needValidation)
		el.classList.add(config.classes.isInvalid)
		el.parentElement.querySelector(`.${config.classes.invalidFeedback}`).innerHTML = label
	} else {
		el.classList.remove(config.classes.isInvalid)
		el.classList.remove(config.classes.needValidation)
		el.parentElement.querySelector(`.${config.classes.invalidFeedback}`).innerHTML = ''
	}
}

const status = (el, status, form = Forms[el.getAttribute(config.attributes.ref)]) => {
	if (!status) form.valid = false
	form.childrens[el.getAttribute(config.attributes.id)].valid = status
}

const test = (el, template) => {
	mask(el, template)
	error(el, false)
	if (!el.value) {
		error(el, config.label.required)
		status(el, false)
		return false
	} else {
		status(el, true)
	}
	if (isString(template)) {
		if (!templates[template](el.value)) {
			if (el.getAttribute(config.attributes.error)) {
				error(el, el.getAttribute(config.attributes.error))
			} else if(config.label.hasOwnProperty(template)) {
				error(el, config.label[template])
			}
			status(el, false)
		} else {
			status(el, true)
		}
	} else if (isObject(template)) {
		for (let rule in template) {
			if (templates[rule]) {
				if (!templates[rule](el.value, template[rule])) {
					if (el.getAttribute(config.attributes.error)) {
						error(el, el.getAttribute(config.attributes.error))
					} else if(config.label.hasOwnProperty(rule)) {
						error(el, config.label[rule])
					}
					status(el, false)
				} else {
					status(el, true)
				}
			}
		}
	}
}

if (!window.Forms) window.Forms = {}

window.ValidationForm = (path, el = document.querySelector(path), id = el.getAttribute(config.attributes.reference)) => {
	if (el && id || Forms[id]) {
		Forms[id].submited = true
		Forms[id].valid = true
		let invalid = 0
		for (let f in Forms[id].childrens) {
			let field = Forms[id].childrens[f]
			let template = field['template'] ? field['template'] : null
			let error = field['error'] ? field['error'] : null
			test(field.selector, template, error)
			if (!field.valid) invalid++
		}
		Forms[id].valid = invalid == 0
		return Forms[id].valid
	}
}

window.ValidateForm = (path, success, form = document.querySelector(path), id = unique()) => {
	if (form) {
		form.onsubmit = e => {
			e.preventDefault()
			if(isFunction(success)) success()
		}
		form.setAttribute(config.attributes.reference, id)
		Forms[id] = {
			selector: `${path}[${config.attributes.reference}="${id}"]`,
			submited: false,
			valid: false,
			childrens: {}
		}
	}
}

export default {
	check() {
		return true
	},
	components: {
		formContainer,
		passwordCreation
	},
	events: {
		beforeCreate: function() {
			Vue.directive('validate', {
				bind: function(el, binding, vNode) {
					el.classList.add(config.classes.needValidation)
					setTimeout(() => {
						if (!vNode.elm.form) return
						if (!vNode.elm.form.getAttribute(config.attributes.reference)) return
						let id = unique()
						let form = vNode.elm.form.getAttribute(config.attributes.reference)
						el.setAttribute(config.attributes.ref, form)
						el.setAttribute(config.attributes.id, id)
						Forms[form].childrens[id] = Object.assign({
							valid: false,
							selector: el
						}, binding.value)
						let template = binding.value && binding.value['template'] ? binding.value['template'] : null
						let error = binding.value && binding.value['error'] ? binding.value['error'] : null
						el.onkeyup = (e) => {
							mask(e.srcElement, template)
						}
						el.onchange = (e) => {
							test(e.srcElement, template, error)
						}
					})
				}
			})
		}
	}
}