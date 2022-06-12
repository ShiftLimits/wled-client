import { WLEDState, WLEDPalettes, WLEDEffects, WLEDInfo, WLEDUpdatableState, WLEDLive, WLEDContext, WLEDPresets, WLEDPaletteDataPage, WLEDConfig, WLEDUpdatableConfig } from '../types.wled';
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import { fetch, AbortController } from '@js-bits/fetch'
import { IsomorphicEventEmitter } from '../utils.emitter';

export interface JSONAPIFetchOptions {
	timeout?:number
}

export class WLEDJSONAPI extends IsomorphicEventEmitter {
	private readonly api_endpoint:string
	private readonly authority:string

	constructor({ secure, host, port }:WLEDClientOptions) {
		super()
		this.authority = `${secure ? 'https':'http'}://${host}${port ? ':'+port : ''}`
		this.api_endpoint = `${this.authority}/${ WLEDEndpoints.JSON }`
	}

	handleErrors(response:Response) {
		if (!response.ok) {
			this.emit('error', response)
			throw response
		}
		return response
	}

	async fetch(resource:string, options:Parameters<fetch>[1]&{[key:string]:any}&{timeout?:number} = {}) {
		const { timeout = 5000 } = options
		const controller = new AbortController()
		const id = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(resource, {
			...options,
			signal: controller.signal
		})
		clearTimeout(id)

		return response
	}

	async getAll(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(this.api_endpoint, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDContext
	}

	async getPalettes(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/pal`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPalettes
	}

	async getEffects(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/eff`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDEffects
	}

	async getInfo(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/info`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDInfo
	}

	async getState(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/state`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDState
	}

	async getLive(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/live`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDLive
	}

	async getPresets(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.authority}/presets.json`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPresets
	}

	async getConfig(options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/cfg`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDConfig
	}

	async getPalettesDataPage(page:number = 0, options:JSONAPIFetchOptions = {}) {
		const { timeout } = options
		let response = await this.fetch(`${this.api_endpoint}/palx?page=${page}`, { timeout }).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPaletteDataPage
	}

	async updateState(state:WLEDUpdatableState, options:JSONAPIFetchOptions = {}) {
		const { timeout } = options

		let result = await this.fetch(this.api_endpoint, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(state),
			timeout
		}).then(this.handleErrors)

		let context = await result.json()
		if (state.v) return context as WLEDContext
		return context as { success:boolean }
	}

	async updateConfig(config:WLEDUpdatableConfig, options:JSONAPIFetchOptions = {}) {
		const { timeout } = options

		let result = await this.fetch(`${this.api_endpoint}/cfg`, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(config),
			timeout
		}).then(this.handleErrors)

		let context = await result.json()
		return context as { success:boolean }
	}
}