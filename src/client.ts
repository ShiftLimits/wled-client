import { WLEDClientOptions, WLEDClientState, WLEDClientInfo, WLEDClientEffects, WLEDClientPalettes, WLEDClientUpdatableState, WLEDClientUpdatableSegment, WLEDClientPlaylist, WLEDClientContext, WLEDClientLiveLEDs, WLEDClientNightlightState, WLEDClientSendOptions, WLEDClientPresets, WLEDClientPreset, WLEDClientCurrentStatePreset, WLEDClientDeviceOptions, WLEDClientLive, WLEDClientSendSegmentOptions } from './types.client'
import { DEFAULT_OPTIONS, WLEDLiveDataOverride, WLEDNightlightMode, DEFAULT_CLIENT_CONTEXT } from './constants'
import { WLEDJSONAPI } from './apis/json'
import { WLEDWebsocketAPI } from './apis/websocket'
import { wledToClientState, wledToClientInfo, clientToWLEDState, wledToClientPresets, wledToClientDeviceOptions } from './adapters'
import { RGBWColor, RGBColor, RequireAtLeastOne, BuildStateFn } from './types'
import { IsomorphicEventEmitter } from './utils.emitter'
import { isBuildStateFunction } from './utils'
import { WLEDContext, WLEDPresets, WLEDPalettesData } from './types.wled'


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
	private isReady:Promise<boolean>

	private options:WLEDClientOptions

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

		const resolved_options = Object.assign(DEFAULT_OPTIONS, options) // Build final options by assigning passed options over the default options
		this.options = resolved_options // Store options

		Object.assign(this, DEFAULT_CLIENT_CONTEXT) // Initialize the default context

		this.WSAPI = new WLEDWebsocketAPI(resolved_options) // Initialize the WS API
		this.WSAPI.on('error', (event) => this.emit('error', event)) // Relay error events
		this.WSAPI.on('close', (event) => this.emit('close', event)) // Relay close events
		this.WSAPI.on('live:leds', (event) => this.emit<[WLEDClientLiveLEDs]>('live:leds', event)) // Relay live LEDs event
		this.WSAPI.on('update:context', this.setContext.bind(this)) // Listen for updates on the WebSocket

		this.JSONAPI = new WLEDJSONAPI(resolved_options) // Initialize the JSON API
		this.JSONAPI.on('error', (event) => this.emit('error', event)) // Relay error events

		if (resolved_options.immediate) this.init()
	}

	async init() {
		if (this.isReady) return this.isReady

		let initializing = this.options.websocket ? [this.refreshContext(), this.WSAPI.connect()] : [this.refreshContext()]
		let isReady = Promise.allSettled(initializing)

		this.isReady = isReady.then(([json_result, ws_result]) => {
			if ((ws_result && ws_result.status == 'rejected') && json_result.status == 'rejected') {
				this.emit('error', json_result.reason)
				return Promise.reject(json_result.reason)
			}
			this.emit('ready')
			return true
		})
	}

	/** Get the latest state from the device. */
	async refreshContext() {
		const [context, presets] = await Promise.all([
			this.JSONAPI.getAll(),
			this.JSONAPI.getPresets()
		])

		this.setContext({ ...context, presets })
	}

	private setContext({ state, info, effects, palettes, presets }:Partial<WLEDContext>&{presets?:WLEDPresets}) {
		let client_state = state ? wledToClientState(state) : this.state
		let client_info = info ? wledToClientInfo(info) : this.info
		let client_effects = effects ? effects : this.effects
		let client_palettes = palettes ? palettes : this.palettes
		let client_presets = presets ? wledToClientPresets(presets) : this.presets

		let context:WLEDClientContext = {
			state: client_state,
			info: client_info,
			effects: client_effects,
			palettes: client_palettes,
			presets: client_presets,
			deviceOptions: info ? wledToClientDeviceOptions(info.opt) : this.deviceOptions,
			live: this.live
		}

		Object.assign(this, { ...context })
		this.emit<[WLEDClientContext]>('update:context', context)
		if (state) this.emit<[WLEDClientState]>('update:state', client_state)
		if (info) this.emit<[WLEDClientInfo]>('update:info', client_info)
		if (effects) this.emit<[WLEDClientEffects]>('update:effects', client_effects)
		if (palettes) this.emit<[WLEDClientPalettes]>('update:palettes', client_palettes)
		if (presets) this.emit<[WLEDClientPresets]>('update:presets', client_presets)
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
				return
			} catch(e) {
				this.emit('error', e)
			}
		}

		if (!use_method || use_method != 'ws') {
			let new_context = await this.JSONAPI.updateState({ ...wled_state, v: true }) as WLEDContext
			return this.setContext(new_context)
		}

		throw new Error('No transport available to handle state update.')
	}

	/**
	 * Constructs a state update request that applies new state to all segments passed, or to the main state object if no segments are passed.
	 * @param state The state to update, or a function that is called optionally per-segment and returns the state to update
	 * @param segmentId One or more segment IDs
	 */
	buildStateWithSegments(state:(WLEDClientUpdatableState|WLEDClientUpdatableSegment)|BuildStateFn, segmentId?:number|number[]) {
		let new_state:WLEDClientUpdatableState|WLEDClientUpdatableSegment

		if (segmentId !== undefined) new_state = { segments: (Array.isArray(segmentId) ? segmentId : [segmentId]).map(id => ({ id, ...(isBuildStateFunction(state) ? state(this.getSegment(id)) : state) })) }
		else new_state = isBuildStateFunction(state) ? state() : state

		return new_state
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

	/** Set the device or segment power state to on. */
	turnOn({ segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ on: true }, segmentId), options)
	}

	/** Set the device or segment power state to off. */
	turnOff({ segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ on: false }, segmentId), options)
	}

	/** Change the device or segment power state to the opposite of what it currently is. */
	toggle({ segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments((segment) => {
			return { on: segment ? !segment.on : !this.state.on }
		}, segmentId), options)
	}

	//
	// LED Brightness and Color

	/**
	 * Set the device's master brightness.
	 * @param value Any integer between 0 and 255
	 */
	setBrightness(value:number, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ brightness: value }, segmentId), options)
	}

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 * @alias setPrimaryColor
	 */
	setColor(color:RGBColor|RGBWColor, options?:WLEDClientSendOptions&WLEDClientSendSegmentOptions) { return this.setPrimaryColor(color, options) }

	/**
	 * Set the primary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setPrimaryColor(color:RGBColor|RGBWColor, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ colors: [color] }, segmentId||0), options)
	}

	/**
	 * Set the secondary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setSecondaryColor(color:RGBColor|RGBWColor, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ colors: [undefined, color] }, segmentId||0), options)
	}

	/**
	 * Set the tertiary color of the device's main segment.
	 * @param {RGBColor|RGBWColor} color RGB or RGBW color array
	 */
	setTertiaryColor(color:RGBColor|RGBWColor, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ colors: [undefined, undefined, color] }, segmentId||0), options)
	}

	/**
	 * Set the palette applied to the device's main segment.
	 * @param {number} paletteId ID of the desired palette, as found in `palettes`
	 */
	setPalette(paletteId:number, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ paletteId }, segmentId||0), options)
	}

	private paletteDataCache:WLEDPalettesData
	async getPalettesData(page?:number) {
		let palettes_data:WLEDPalettesData = {}

		if (page) {
			const { p } = await this.JSONAPI.getPalettesDataPage(page) // If we want a specific page, just forward the request
			Object.assign(palettes_data, p)
		} else if(this.paletteDataCache) {
			palettes_data = this.paletteDataCache // Return cached result
		} else {
			let max_page = 1 // Initialize with 1, will be updated after each request using the `m` property

			page = 0
			while (page <= max_page || page > 100) { // Just in case, hard cap at 100 page iterations
				let { m, p } = await this.JSONAPI.getPalettesDataPage(page)
				Object.assign(palettes_data, p)
				max_page = m
				page++
			}

			this.paletteDataCache = palettes_data // Cache the result in memory to optimize future calls 
		}

		return palettes_data
	}

	//
	// Effects

	/**
	 * Set the effect applied to the device's main segment.
	 * @param {number} effectId ID of the desired effect, as found in `effects`
	 */
	setEffect(effectId:number, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ effectId }, segmentId||0), options)
	}

	setEffectSpeed(value:number, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ effectSpeed: value }, segmentId||0), options)
	}

	setEffectIntensity(value:number, { segmentId, ...options}:WLEDClientSendOptions&WLEDClientSendSegmentOptions={}) {
		return this.updateState(this.buildStateWithSegments({ effectIntensity: value }, segmentId||0), options)
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