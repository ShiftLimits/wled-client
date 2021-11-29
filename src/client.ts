import { WLEDClientOptions, WLEDClientState, WLEDClientInfo, WLEDClientEffects, WLEDClientPalettes, WLEDClientUpdatableState, WLEDClientUpdatableSegment, WLEDClientPlaylist, WLEDClientContext, WLEDClientLiveLEDs, WLEDClientNightlightState, WLEDClientSendOptions, WLEDClientPresets, WLEDClientPreset, WLEDClientCurrentStatePreset, WLEDClientDeviceOptions, WLEDClientLive } from './types.client'
import { DEFAULT_OPTIONS, WLEDLiveDataOverride, WLEDNightlightMode, DEFAULT_CLIENT_CONTEXT } from './constants'
import { WLEDJSONAPI } from './apis/json'
import { WLEDWebsocketAPI } from './apis/websocket'
import { wledToClientState, wledToClientInfo, clientToWLEDState, wledToClientPresets, wledToClientDeviceOptions } from './adapters'
import { RGBWColor, RGBColor, RequireAtLeastOne } from './types'
import { IsomorphicEventEmitter } from './utils.emitter'
import { deepMerge, deepClone } from './utils'


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

	/** List of presets save on this device. */
	public readonly presets:WLEDClientPresets = {}

	/** Options that are set on the device. */
	public readonly deviceOptions:WLEDClientDeviceOptions

	/** Live streaming data sources currently sending data. */
	public readonly live:WLEDClientLive

	/** Promise that is resolved when a successful connection has been made and the state has been retrieved. */
	public readonly isReady:Promise<boolean>

	/** The ready state of the WebSocket instance. */
	get wsReadyState() { return this.WSAPI.websocket.readyState }

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

		Object.assign(this, DEFAULT_CLIENT_CONTEXT) // Initialize 
		const resolved_options = Object.assign(DEFAULT_OPTIONS, options) // Build final options by assigning passed options over the default options

		this.WSAPI = new WLEDWebsocketAPI(resolved_options)
		this.WSAPI.on('live:leds', (event) => this.emit<[WLEDClientLiveLEDs]>('live:leds', event))
		this.WSAPI.on('update:context', ({ state, info, effects, palettes }) => {
			let client_state = wledToClientState(state)
			let client_info = wledToClientInfo(info)
			let client_effects = effects ? effects : this.effects // Use old effects list if new ones were not passed
			let client_palettes = palettes ? palettes : this.palettes // Use old palettes list if new ones were not passed
			let context:WLEDClientContext = {
				state: client_state,
				info: client_info,
				effects: client_effects,
				palettes: client_palettes,
				presets: this.presets,
				deviceOptions: wledToClientDeviceOptions(info.opt),
				live: this.live
			}

			Object.assign(this, { ...context })
			this.emit<[WLEDClientContext]>('update:context', context)
			this.emit<[WLEDClientState]>('update:state', client_state)
			this.emit<[WLEDClientInfo]>('update:info', client_info)
			if (effects) this.emit<[WLEDClientContext]>('update:effects', client_effects)
			if (palettes) this.emit<[WLEDClientPalettes]>('update:palettes', client_palettes)
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
		let presets = await this.JSONAPI.getPresets()

		let client_state = wledToClientState(state)
		let client_info = wledToClientInfo(info)
		let client_effects = effects ? effects : this.effects // Use old effects list if new ones were not passed
		let client_palettes = palettes ? palettes : this.palettes // Use old palettes list if new ones were not passed
		let client_presets = wledToClientPresets(presets)

		let context:WLEDClientContext = {
			state: client_state,
			info: client_info,
			effects: client_effects,
			palettes: client_palettes,
			presets: client_presets,
			deviceOptions: wledToClientDeviceOptions(info.opt),
			live: this.live
		}

		Object.assign(this, { ...context })
		this.emit<[WLEDClientContext]>('update:context', context)
		this.emit<[WLEDClientState]>('update:state', client_state)
		this.emit<[WLEDClientInfo]>('update:info', client_info)
		this.emit<[WLEDClientEffects]>('update:effects', client_effects as any)
		this.emit<[WLEDClientPalettes]>('update:palettes', client_palettes as any)
		this.emit<[WLEDClientPresets]>('update:presets', client_palettes as any)
	}

	/**
	 * Make an update to the state object with multiple values.
	 * @param {WLEDClientUpdatableState} state Partial state object of values to update
	 */
	async updateState(state:WLEDClientUpdatableState, options?:WLEDClientSendOptions) {
		let use_method:'ws'|'json'|undefined
		if (options) { // Handle options passed for this call only
			const { transition, noSync, method } = options

			if (transition) state.temporaryTransition = transition
			if (noSync) state.udpSync = { ...(state.udpSync || {}), noSync }
			if (method) use_method = method
		}

		const wled_state = clientToWLEDState(state) // Transform the client state object into the WLED API state object

		if ((!use_method || use_method != 'json') && this.WSAPI.available) {
			try {
				await this.WSAPI.updateState(wled_state)
				deepMerge(this.state, state)
				this.emit<[WLEDClientState]>('update:state', this.state)
				return
			} catch(e) {
				console.error(e)
			}
		}

		if (!use_method || use_method != 'ws') {
			await this.JSONAPI.updateState(wled_state)
			deepMerge(this.state, state)
			this.emit<[WLEDClientState]>('update:state', this.state)
		}
	}

	/** Connect to the device's WebSocket API. */
	connect() {
		return this.WSAPI.connect()
	}

	/** Disconnect from the device's WebSocket API. */
	disconnect() {
		return this.WSAPI.disconnect()
	}

	/** Start a live stream of LED values from the device via the WebSocket API. Listen to the `update:leds` event (e.g. `wled.addEventListener('update:leds', cb)`). */
	async startLEDStream() {
		await this.WSAPI.startLEDStream()
		this.live.leds = true
		this.emit('update:live', this.live)
	}

	/** Stop the live stream of LED values from the device. */
	async stopLEDStream() {
		await this.WSAPI.stopLEDStream()
		this.live.leds = false
		this.emit('update:live', this.live)
	}

	/** Start the live stream if it is stopped, or stop the live stream if it is started */
	toggleLEDStream() {
		if (this.live.leds) return this.stopLEDStream()
		return this.startLEDStream()
	}

	//
	// Device Power

	/** Hard reboot the device. */
	reboot() {
		return this.updateState({ reboot: true })
	}

	/** Set the device's power state to on. */
	turnOn(options?:WLEDClientSendOptions) {
		return this.updateState({ on: true }, options)
	}

	/** Set the device's power state to off. */
	turnOff(options?:WLEDClientSendOptions) {
		return this.updateState({ on: false }, options)
	}

	/** Change the device's power state to the opposite of what it currently is. */
	toggle(options?:WLEDClientSendOptions) {
		return this.updateState({ on: !this.state.on }, options)
	}

	//
	// LED Brightness and Color

	/**
	 * Set the device's master brightness.
	 * @param value Any integer between 0 and 255
	 */
	setBrightness(value:number, options?:WLEDClientSendOptions) {
		return this.updateState({ brightness: value }, options)
	}

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 * @alias setPrimaryColor
	 */
	setColor(color:RGBColor|RGBWColor, options?:WLEDClientSendOptions) { return this.setPrimaryColor(color, options) }

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setPrimaryColor(color:RGBColor|RGBWColor, options?:WLEDClientSendOptions) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [color]
				}
			]
		}, options)
	}

	/**
	 * Set the secondary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setSecondaryColor(color:RGBColor|RGBWColor, options?:WLEDClientSendOptions) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [undefined, color]
				}
			]
		}, options)
	}

	/**
	 * Set the tertiary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setTertiaryColor(color:RGBColor|RGBWColor, options?:WLEDClientSendOptions) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					colors: [undefined, undefined, color]
				}
			]
		}, options)
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

	setEffectSpeed(value:number) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					effectSpeed: value
				}
			]
		})
	}

	setEffectIntensity(value:number) {
		return this.updateState({
			segments:[
				{
					id: this.state.mainSegmentId,
					effectIntensity: value
				}
			]
		})
	}

	/**
	 * Duration of the crossfade between different colors/brightness levels.
	 * @param {number} value Time in 100ms intervals (eg. 4 is 400ms), 0 to 255
	 */
	setTransitionTime(value:number) {
		return this.updateState({
			transitionTime: value
		})
	}

	//
	// Segments

	/**
	 * Set which segment should be considered the main one.
	 * @param {number} id ID of the main segment
	 */
	setMainSegmentId(id:number) {
		return this.updateState({
			mainSegmentId: id
		})
	}

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
	updateSegment(id:number, data:Omit<WLEDClientUpdatableSegment, 'id'>, options?:WLEDClientSendOptions) {
		return this.updateState({
			segments: [
				{ id, ...data	}
			]
		}, options)
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
				this.state.remaining = this.state.duration
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

	//
	// Live Data

	/**
	 * Ignore any live data if the device is currently being used to display the live data.
	 * @param {boolean} until_reboot If `false` or `undefined`, the live data will be ignored until the live data stream ends. If `true` the device will ignore live data until it reboots.
	 */
	ignoreLiveData(until_reboot?:boolean) {
		let liveDataOverride:WLEDLiveDataOverride = until_reboot ? WLEDLiveDataOverride.UNTIL_REBOOT : WLEDLiveDataOverride.UNTIL_END
		return this.updateState({ liveDataOverride })
	}

	/** Allow live data to be displayed by the device. */
	allowLiveData() {
		return this.updateState({
			liveDataOverride: WLEDLiveDataOverride.OFF
		})
	}

	//
	// UDP Sync

	enableUDPSync(options?:RequireAtLeastOne<WLEDClientState['udpSync']>) {
		if (!options) {
			options = { send:true }
			if (this.info.syncToggleReceive) options.receive = true
		}

		return this.updateState({
			udpSync: options as WLEDClientState['udpSync']
		})
	}

	disableUDPSync() {
		let udpSync:WLEDClientState['udpSync'] = { send: false }
		if (this.info.syncToggleReceive) udpSync.receive = false

		return this.updateState({ udpSync })
	}

	//
	// Presets

	/**
	 * Get a preset by its ID.
	 * @param {number} id ID of the desired preset
	 */
	getPreset(id:number) {
		return this.presets[id]
	}

	/**
	 * Activate a new preset.
	 * @param {number} id ID of the desired preset
	 */
	setPreset(id:number) {
		return this.updateState({
			presetId: id
		})
	}

	/**
	 * Save a preset using the device's current state.
	 * @param {number} id
	 * @param {WLEDClientCurrentStatePreset} preset
	 */
	async saveStateAsPreset(id:number, preset:WLEDClientCurrentStatePreset) {
		preset = Object.assign({ includeBrightness: true, segmentBounds: true }, preset)
		await this.updateState({
			savePresetId: id,
			...preset,
			time: new Date().getTime()
		}, { method: 'json' })
		// To Do: Build and add new preset object
	}

	/**
	 * Save a preset.
	 * @param {number} id
	 * @param {WLEDClientPreset} preset
	 */
	async savePreset(id:number, preset:WLEDClientPreset) {
		await this.updateState({
			savePresetId: id,
			overwriteState: true,
			...preset
		}, { method: 'json' })

		this.presets[id] = preset
	}

	/**
	 * Delete a preset by its ID.
	 * @param {number} id ID of the preset to delete
	 */
	async deletePreset(id:number) {
		await this.updateState({
			deletePresetId: id
		})
		delete this.presets[id]
	}

}