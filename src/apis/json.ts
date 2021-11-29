import { WLEDState, WLEDPalettes, WLEDEffects, WLEDInfo, WLEDUpdatableState, WLEDLive, WLEDContext, WLEDPresets } from '../types.wled';
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import { fetch } from '@js-bits/fetch'
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

	async getAll() {
		let response = await fetch(this.api_endpoint).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDContext
	}

	async getPalettes() {
		let response = await fetch(`${this.api_endpoint}/pal`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPalettes
	}

	async getEffects() {
		let response = await fetch(`${this.api_endpoint}/eff`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDEffects
	}

	async getInfo() {
		let response = await fetch(`${this.api_endpoint}/info`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDInfo
	}

	async getState() {
		let response = await fetch(`${this.api_endpoint}/state`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDState
	}

	async getLive() {
		let response = await fetch(`${this.api_endpoint}/live`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDLive
	}

	async getPresets() {
		let response = await fetch(`${this.authority}/presets.json`).then(this.handleErrors)
		let object = await response.json()
		return object as WLEDPresets
	}

	async updateState(state:WLEDUpdatableState) {
		let result = await fetch(this.api_endpoint, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(state)
		}).then(this.handleErrors)

		let context = await result.json()
		if (state.v) return context as WLEDContext
		return context as { sucess:boolean }
	}
}