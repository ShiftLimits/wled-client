import { WLEDState, WLEDPalettes, WLEDEffects, WLEDInfo, WLEDUpdatableState, WLEDLive, WLEDContext, WLEDPresets, WLEDPaletteDataPage, WLEDConfig, WLEDUpdatableConfig } from '../types.wled';
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import { fetch, AbortController } from '@js-bits/fetch'
import { IsomorphicEventEmitter } from '../utils.emitter';

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

	async getAll() {
		let response = await this.fetch(this.api_endpoint).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDContext
	}

	async getPalettes() {
		let response = await this.fetch(`${this.api_endpoint}/pal`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPalettes
	}

	async getEffects() {
		let response = await this.fetch(`${this.api_endpoint}/eff`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDEffects
	}

	async getInfo() {
		let response = await this.fetch(`${this.api_endpoint}/info`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDInfo
	}

	async getState() {
		let response = await this.fetch(`${this.api_endpoint}/state`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDState
	}

	async getLive() {
		let response = await this.fetch(`${this.api_endpoint}/live`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDLive
	}

	async getPresets() {
		let response = await this.fetch(`${this.authority}/presets.json`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPresets
	}

	async getConfig() {
		let response = await this.fetch(`${this.api_endpoint}/cfg`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDConfig
	}

	async getPalettesDataPage(page:number = 0) {
		let response = await this.fetch(`${this.api_endpoint}/palx?page=${page}`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPaletteDataPage
	}

	async updateState(state:WLEDUpdatableState) {
		let result = await this.fetch(this.api_endpoint, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(state)
		}).then(this.handleErrors)

		let context = await result.json()
		if (state.v) return context as WLEDContext
		return context as { success:boolean }
	}

	async updateConfig(config:WLEDUpdatableConfig) {
		let result = await this.fetch(`${this.api_endpoint}/cfg`, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(config)
		}).then(this.handleErrors)

		let context = await result.json()
		return context as { success:boolean }
	}
}