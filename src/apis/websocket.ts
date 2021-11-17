import { IsomorphicEventEmitter } from '../utils.emitter'
import { isWLEDContext, isWLEDLive } from '../utils'
import { WLEDUpdatableState } from '../types.wled'
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import WebSocket from 'isomorphic-ws'

export class WLEDWebsocketAPI extends IsomorphicEventEmitter {
	private readonly api_endpoint:string
	available = false
	websocket:WebSocket

	constructor({ secure, host, port, websocket }:WLEDClientOptions) {
		super()

		this.api_endpoint = `${secure ? 'wss':'ws'}://${host}${port ? ':'+port : ''}/${ WLEDEndpoints.WS }`
	}

	disconnect() {
		if (this.websocket && this.websocket.readyState == this.websocket.OPEN) {
			this.websocket.close()
		}
	}

	connect():Promise<boolean> {
		if (this.websocket && this.websocket.readyState == this.websocket.OPEN) return Promise.resolve(true) // Connection is already open

		this.websocket = new WebSocket(this.api_endpoint)
		return new Promise((resolve, reject) => {
			this.websocket.addEventListener('error', reject)
			this.websocket.addEventListener('open', () => {
				this.websocket.removeEventListener('error', reject)

				this.init()
				resolve(true)
			})
		})
	}

	private init() {
		this.available = true

		this.websocket.addEventListener('message', (event) => {
			let message = JSON.parse((event as any as MessageEvent).data)

			if (isWLEDContext(message)) {
				let { state, info } = message
				this.emit('update:context', { state, info })
			} else if(isWLEDLive(message)) {
				this.emit('live', message)
			}
		})

		this.websocket.addEventListener('close', (event) => {
			console.log(`WebSocket Closed`)
			if (!event.wasClean) console.log('UNCLEAN CLOSE', event)
			this.available = false
		})
		this.websocket.addEventListener('error', (error) => {
			console.error(`WebSocket Error: ${ error }`)
			this.available = false
		})
	}

	private send(data:string, cb:Function) {
		if (this.available) {
			this.websocket.send(data)
			cb()
			return
		} else {
			let err = new Error('WebSocket is not available.')

			if (cb) cb(err)
			else throw err
		}
	}

	updateState(state:WLEDUpdatableState) {
		return new Promise((resolve, reject) => {
			this.send(JSON.stringify(state), (err) => {
				if (err) reject(err)
				resolve(undefined)
			})
		})
	}

	startLiveStream() {
		return new Promise((resolve, reject) => {
			this.send(JSON.stringify({ lv: true }), (err) => {
				if (err) reject(err)
				resolve(undefined)
			})
		})
	}

	stopLiveStream() {
		return new Promise((resolve, reject) => {
			this.send(JSON.stringify({ lv: false }), (err) => {
				if (err) reject(err)
				resolve(undefined)
			})
		})
	}
}