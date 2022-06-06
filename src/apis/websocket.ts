import { IsomorphicEventEmitter } from '../utils.emitter'
import { isWLEDContext, isWLEDLiveLEDs } from '../utils'
import { WLEDUpdatableState } from '../types.wled'
import { WLEDClientOptions } from '../types.client'
import { WLEDEndpoints } from '../constants'
import WebSocket from 'isomorphic-ws'

export class WLEDWebsocketAPI extends IsomorphicEventEmitter {
	private readonly api_endpoint:string
	available = false
	websocket:WebSocket

	private reconnect = true

	constructor({ secure, host, port, websocket }:WLEDClientOptions) {
		super()

		if (websocket && typeof websocket == 'object') {
			if (typeof websocket.reconnect == 'boolean') this.reconnect = websocket.reconnect
		}

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
		this.websocket.binaryType = "arraybuffer"

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

		this.websocket.addEventListener('message', ({ data }) => {
			if (data instanceof ArrayBuffer) {
				const header = new Uint8Array(data.slice(0,2))
				const type = String.fromCharCode(header[0])
				const version = header[1]

				if (type == 'L') switch (version) {
					case 1:
					default:
						const leds:Uint8Array[] = []

						const raw_leds = data.slice(2)
						for (let i = 0; i < raw_leds.byteLength/3; i++) leds.push(new Uint8Array(raw_leds.slice(i, i + 3)))

						this.emit('live:leds', leds)
				}
			} else if (typeof data == 'string') {
				let message = JSON.parse(data)

				if (isWLEDContext(message)) {
					let { state, info } = message
					this.emit('update:context', { state, info })
				} else if(isWLEDLiveLEDs(message)) {
					this.emit('live:leds', message.leds)
				}
			}
		})

		this.websocket.addEventListener('close', (event) => {
			this.emit('close', event)
			if (!event.wasClean) {
				if (this.reconnect) setTimeout(() => this.connect(), 1000)
			}
			this.available = false
		})

		this.websocket.addEventListener('error', (error) => {
			this.emit('error', error)
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

	startLEDStream() {
		return new Promise((resolve, reject) => {
			this.send(JSON.stringify({ lv: true }), (err) => {
				if (err) reject(err)
				resolve(undefined)
			})
		})
	}

	stopLEDStream() {
		return new Promise((resolve, reject) => {
			this.send(JSON.stringify({ lv: false }), (err) => {
				if (err) reject(err)
				resolve(undefined)
			})
		})
	}
}