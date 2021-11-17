import { WLEDClientOptions, WLEDClientState, WLEDClientInfo, WLEDClientEffects, WLEDClientPalettes, WLEDClientUpdatableState, WLEDClientUpdatableSegment, WLEDClientPlaylist, WLEDClientContext, WLEDClientLive } from './types.client';
import { DEFAULT_OPTIONS } from './constants'
import { WLEDJSONAPI } from './apis/json'
import { WLEDWebsocketAPI } from './apis/websocket'
import { wledToClientState, wledToClientInfo, clientToWLEDState } from './adapters'
import { RGBWColor, RGBColor } from './types'
import { IsomorphicEventEmitter } from './utils.emitter'
import { deepMerge } from './utils'


/**
 * Client interface for WLED devices.
 */
export class WLEDClient extends IsomorphicEventEmitter {
	/** Device's current state. */
	public readonly state:WLEDClientState

	/** Information about the device. */
	public readonly info:WLEDClientInfo

	/** List of effects available for this device. */
	public readonly effects:WLEDClientEffects = []

	/** List of color palettes available for this device. */
	public readonly palettes:WLEDClientPalettes = []

	/** Promise that is resolved when a successful connection has been made and the state has been retrieved. */
	public readonly isReady:Promise<boolean>

	private JSONAPI:WLEDJSONAPI
	private WSAPI:WLEDWebsocketAPI

	/**
	 * @param {string} host - The IP or hostname of the device.
	 */
	constructor(host:string)

	/**
	 * @param {Partial<WLEDClientOptions>} options - Client options object.
	 */
	constructor(options:Partial<WLEDClientOptions>)

	/** Create a new WLED Client. */
	constructor(host_or_options:string|Partial<WLEDClientOptions> = {}) {
		super()

		let options:Partial<WLEDClientOptions>
		if (typeof host_or_options == 'string') options = { host: host_or_options } // If `host_or_options` is a string, then it is the device's host
		else options = host_or_options // Otherwise `host_or_options` is an options object

		const resolved_options = Object.assign(DEFAULT_OPTIONS, options) // Build final options by assigning passed options over the default options

		this.WSAPI = new WLEDWebsocketAPI(resolved_options)
		this.WSAPI.on('live', (event) => this.emit<[WLEDClientLive]>('live', event))
		this.WSAPI.on('update:context', (context) => {
			Object.assign(this, {
				state: wledToClientState(context.state),
				info: wledToClientInfo(context.info)
			})

			this.emit<[WLEDClientContext]>('update:context', context)
			this.emit<[WLEDClientState]>('update:state', context.state)
			this.emit<[WLEDClientInfo]>('update:info', context.info)
		})

		this.JSONAPI = new WLEDJSONAPI(resolved_options)

		let isReady:Promise<any>
		if (resolved_options.websocket) isReady = Promise.allSettled([this.refreshContext(), this.WSAPI.connect()])
		else isReady = this.refreshContext()

		this.isReady = isReady.then(() => this.emit('ready')).then(() => true)
	}

	/** Get the latest state from the device. */
	async refreshContext() {
		let { state, info, effects, palettes } = await this.JSONAPI.getAll()
		Object.assign(this, {
			state: wledToClientState(state),
			info: wledToClientInfo(info),
			effects,
			palettes
		})
	}

	/**
	 * Make an update to the state object with multiple values.
	 * @param {WLEDClientUpdatableState} state Partial state object of values to update
	 */
	async updateState(state:WLEDClientUpdatableState) {
		const wled_state = clientToWLEDState(state) // Transform the client state object into the WLED API state object

		if (this.WSAPI.available) {
			try {
				await this.WSAPI.updateState(wled_state)
				deepMerge(this.state, state)
				return
			} catch(e) {
				console.error(e)
			}
		}

		await this.JSONAPI.updateState(wled_state)
		deepMerge(this.state, state)
		this.emit<[WLEDClientState]>('update:state', this.state)
	}

	/** Connect to the device's WebSocket API. */
	connect() {
		return this.WSAPI.connect()
	}

	/** Disconnect from the device's WebSocket API. */
	disconnect() {
		return this.WSAPI.disconnect()
	}

	/** Start a live stream of LED values from the device via the WebSocket API. Listen to the `live` event (e.g. `wled.addEventListener('live', cb)`). */
	startLiveStream() {
		return this.WSAPI.startLiveStream()
	}

	/** Stop the live stream of LED values from the device. */
	stopLiveStream() {
		return this.WSAPI.stopLiveStream()
	}

	//
	// Device Power

	/** Set the device's power state to on. */
	turnOn() {
		return this.updateState({ on: true })
	}

	/** Set the device's power state to off. */
	turnOff() {
		return this.updateState({ on: false })
	}

	/** Change the device's power state to the opposite of what it currently is. */
	toggle() {
		return this.updateState({ on: !this.state.on })
	}

	//
	// LED Brightness and Color

	/**
	 * Set the device's master brightness.
	 * @param value Any integer between 0 and 255
	 */
	setBrightness(value:number) {
		return this.updateState({ brightness: value })
	}

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 * @alias setPrimaryColor
	 */
	setColor(color:RGBColor|RGBWColor) { return this.setPrimaryColor(color) }

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setPrimaryColor(color:RGBColor|RGBWColor) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [color]
				}
			]
		})
	}

	/**
	 * Set the secondary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setSecondaryColor(color:RGBColor|RGBWColor) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [undefined, color]
				}
			]
		})
	}

	/**
	 * Set the tertiary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setTertiaryColor(color:RGBColor|RGBWColor) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [undefined, undefined, color]
				}
			]
		})
	}

	/**
	 * Set the palette applied to the device's main segment.
	 * @param {number} paletteId ID of the desired palette, as found in `palettes`
	 */
	setPalette(paletteId:number) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					paletteId
				}
			]
		})
	}

	//
	// Effects 

	/**
	 * Set the effect applied to the device's main segment.
	 * @param {number} effectId ID of the desired effect, as found in `effects`
	 */
	setEffect(effectId:number) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					effectId
				}
			]
		})
	}

	//
	// Segments

	/**
	 * Get a segment by its `id`.
	 * @param {number} id ID of the desired segment
	 */
	getSegment(id:number) {
		return this.state.segments[id]
	}

	/**
	 * Create a new segment and adds it to the segment array.
	 * @param {WLEDClientUpdatableSegment} data Every updatable parameter on the segment object except `id`
	 */
	createSegment(data:Omit<WLEDClientUpdatableSegment, 'id'>) {
		return this.updateState({
			segments: [
				...this.state.segments,
				data
			]
		})
	}

	/**
	 * Update a specific segment by `id`.
	 * @param {number} id ID of the segment to be updated
	 * @param {WLEDClientUpdatableSegment} data Every updatable parameter on the segment object except `id`
	 */
	updateSegment(id:number, data:Omit<WLEDClientUpdatableSegment, 'id'>) {
		return this.updateState({
			segments: [
				{ id, ...data	}
			]
		})
	}

	/**
	 * Delete a specific segment by `id`.
	 * @param {number} id ID of the segment to be removed
	 */
	deleteSegment(id:number) {
		return this.updateState({
			segments: [
				{ id, stop: 0	}
			]
		})
	}

	/**
	 * Set the entire segment array.
	 * @param {WLEDClientUpdatableSegment[]} segments Array of segment objects to replace the current array of segment objects
	 */
	async setSegments(segments:Omit<WLEDClientUpdatableSegment, 'id'>[]) {
		await this.clearSegments()
		return this.updateState({	segments })
	}

	/** Clear the segment array completely. */
	clearSegments() {
		return this.updateState({
			segments: this.state.segments.map(() => ({ stop: 0 }))
		})
	}

	//
	// Playlist

	/**
	 * Set a playlist for the device.
	 * @param {WLEDClientPlaylist} playlist A playlist object
	 */
	setPlaylist(playlist:WLEDClientPlaylist) {
		return this.updateState({	playlist })
	}

	//
	// Nightlight

	/** Methods relating to the nightlight feature. */
	nightlight = (() => {
		const wled = this
		return {
			/**
			 * State object of the nightlight feature
			 * @alias WLEDClient.state.nightlight
			 */
			get state() { return wled.state.nightlight },

			/**
			 * Activate the nightlight. Depending on the set mode, the device will fade towards the target brightness over the set duration.
			 * @param {number|WLEDClientNightlightState} with_state Optional. Duration if number is passed, otherwise nightlight state object containing other properties to set while activating the nightlight
			 */
			enable(with_state:number|Omit<Partial<WLEDClientNightlightState>, 'on'> = {}) {
				if (typeof with_state == 'number') with_state = { duration: with_state }
				return wled.updateState({
					nightlight: {
						on: true,
						...with_state
					}
				})
			},

			/** Deactivate the nightlight. */
			disable() {
				return wled.updateState({
					nightlight: {
						on: false
					}
				})
			},

			/** Change the nightlight state to the opposite of what it currently is. */
			toggle() {
				return wled.updateState({
					nightlight: {
						on: !wled.state.nightlight.on
					}
				})
			},

			/**
			 * Set the length of time the nightlight feature will remain active for.
			 * @param {number} value Time in minutes, 1 to 255
			 */
			setDuration(value:number) {
				return wled.updateState({
					nightlight: {
						duration: value
					}
				})
			},

			/**
			 * Set the target brightness of the nightlight feature.
			 * @param {number} value 0 to 255
			 */
			setTargetBrightness(value:number) {
				return wled.updateState({
					nightlight: {
						targetBrightness: value
					}
				})
			},

			/**
			 * Set the mode the nightlight will operate by.
			 * @param {WLEDNightlightMode} mode
			 */
			setMode(mode:WLEDNightlightMode) {
				return wled.updateState({
					nightlight: {
						mode
					}
				})
			}
		}
	})()
}