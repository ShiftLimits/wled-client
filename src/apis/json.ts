import { WLEDState, WLEDPalettes, WLEDEffects, WLEDInfo, WLEDUpdatableState, WLEDLive, WLEDContext } from '../types.wled';
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import { fetch } from '@js-bits/fetch'

export class WLEDJSONAPI {
	private readonly api_endpoint:string

	constructor({ secure, host, port }:WLEDClientOptions) {
		this.api_endpoint = `${secure ? 'https':'http'}://${host}${port ? ':'+port : ''}/${ WLEDEndpoints.JSON }`
	}

	handleErrors(response:Response) {
		if (!response.ok) throw new Error('Response not OK.')
		return response
	}

	async getAll() {
		let response = await fetch(this.api_endpoint)
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

	async updateState(state:WLEDUpdatableState) {
		let result = await fetch(this.api_endpoint, {
			method: 'POST',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json'	},
			body: JSON.stringify(state)
		}).then(this.handleErrors)

		let new_state = await result.json()
		return new_state as WLEDState
	}
}