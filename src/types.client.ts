import { WLEDNightlightMode, WLEDLiveDataOverride } from './constants'
import { RGBColor, RGBWColor } from './types'
import { PartialDeep } from 'type-fest'

//
// Client Constructor Interfaces
//

/**
 * Options used to configure the WLED Client instance
 * @typedef {Object} WLEDClientOptions
 */
export interface WLEDClientOptions {
	/** Device requires a secure connection. */
	secure:boolean

	/** IP or hostname of the device. */
	host:string

	/** Port used to connect to the WLED APIs. */
	port?:number

	/** Device is in debug mode and has access to an extended API. */
	debug?:boolean

	/**
	 * If `boolean`, this will enable or disable the WebSocket API.
	 *
	 * Otherwise pass an object to configure the WebSocket connection.
	 */
	websocket:boolean|{
		/** Attempt to reconnect if connection is lost. */
		reconnect?:boolean
	}

	/** Immediately initiates a context refresh and ws connection */
	immediate:boolean
}

//
// Client Segment Interfaces
//


/**
 * Segment state that are only available when sending commands.
 * @typedef {Object} WLEDClientSegmentSendOnly
 */
export interface WLEDClientSegmentSendOnly {
	/** Zero-indexed ID of the segment. May be omitted, in that case the ID will be inferred from the order of the segment objects in the seg array. */
	id?:number

	/** Individual LED control. */
	i?:number|(RGBColor|RGBWColor)[]
}


/**
 * Segment state that can be both set and get.
 * @typedef {Object} WLEDClientSegment
 */
export interface WLEDClientSegment {
	/**
	 * LED index that the segment starts at.
	 * @type {number} 0 to `info.leds.count`-1
	 */
	start:number

	/**
	 * LED the segment stops at, not included in range. If stop is set to a lower or equal value than start (setting to `0` is recommended), the segment is invalidated and deleted.
	 * @type {number} 0 to `info.leds.count`
	 */
	stop?:number

	/**
	 * Length of the segment (`stop` - `start`). `stop` has preference, so if it is included, `len` is ignored.
	 * @type {number} 0 to info.leds.count
	 */
	length?:number

	/**
	 * Grouping - how many consecutive LEDs of the same segment will be grouped to the same color.
	 * @type {number} 0 to 255
	 */
	grouping?:number

	/**
	 * Spacing - how many LEDs are turned off and skipped between each group.
	 * @type {number} 0 to 255
	 */
	spacing?:number

	/** Array that has up to 3 color arrays as elements, the primary, secondary (background) and tertiary colors of the segment. Each color is an array of 3 or 4 bytes, which represent an RGB(W) color. */
	colors?:(RGBColor|RGBWColor)[]

	/**
	 * ID of the effect on the individual segment.
	 * @type {number} 0 to `info.effectsCount`-1
	 */
	effectId?:number

	/**
	 * Relative effect speed
	 * @type {number} 0 to 255
	 */
	effectSpeed?:number

	/**
	 * Effect intensity
	 * @type {number} 0 to 255
	 */
	effectIntensity?:number

	/**
	 * ID of the color palette on the individual segment.
	 * @type {number} 0 to `info.palettesCount`-1
	 */
	paletteId?:number

	/**
	 * `true` if the segment is selected. Selected segments will have their state (color/FX) updated by APIs that don't support segments (currently any API except this JSON API).
	 *
	 * If no segment is selected, the first segment (id: `0`) will behave as if selected. WLED will report the state of the first (lowest id) segment that is selected to APIs (UDP sync, HTTP, MQTT, Blynk...).
	 */
	selected?:boolean

	/** Reverses the segment, causing animations to change direction. */
	reverse?:boolean

	/** Turns on and off the individual segment. */
	on?:boolean

	/** Sets the brightness of the individual segment. */
	brightness?:number

	/** Mirrors the individual segment. */
	mirror?:boolean

	/** Loxone RGB value for primary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	loxonePrimaryColor?:number

	/** Loxone RGB value for secondary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	loxoneSecondaryColor?:number
}

/**
 * Every segment state key that can be set.
 * @typedef {Object} WLEDClientUpdatableSegment
 */
export type WLEDClientUpdatableSegment = PartialDeep<WLEDClientSegment> & WLEDClientSegmentSendOnly

//
// Playlist Interfaces
//

/**
 * Playlist object used when creating a playlist.
 * @typedef {Object} WLEDClientPlaylist
 */
export interface WLEDClientPlaylist {
	/** Array of preset ID integers to be applied in order. */
	presets:number[]

	/** Array of time each preset should be kept, in tenths of seconds. If only one integer is supplied, all presets will be kept for that time. Defaults to 10 seconds if not provided. */
	durations:number[]

	/** Array of time each preset should transition to the next one, in tenths of seconds. If only one integer is supplied, all presets will transition for that time. Defaults to the current transition time if not provided. */
	transitions:number|number[]

	/** How many times the entire playlist should cycle before finishing. Set to `0` for an indefinite cycle. Default to indefinite if not provided. */
	repeat:number

	/** Single preset ID to apply after the playlist finished. Has no effect when an indefinite cycle is set. If not provided, the light will stay on the last preset of the playlist. */
	endId:number
}

//
// Client State Interfaces
//

/**
 * Playlist object used when creating a playlist.
 * @typedef {Object} WLEDClientStateSendOnly
 */
export interface WLEDClientStateSendOnly {
	/**
	 * Transition time in 100ms intervals (eg. 4 is 400ms), for the current API call only.
	 * @type {number} 0 to 255
	 */
	temporaryTransition?:number

	/** UDP Sync state object. */
	udpSync?: {
		/** Don't send a UDP Sync broadcast packet for the current API call only. */
		noSync?:boolean
	}

	/** ID of the preset slot to save to. */
	savePresetId?:number

	/** ID of the preset to delete. */
	deletePresetId?:number

	/** Sets flag includeBri */
	includeBrightness?:boolean

	/** Sets flag segmentBounds */
	segmentBounds?:boolean

	/** Build new state when saving preset. */
	overwriteState?:boolean

	/** If set to `true` in a JSON POST command, the response will contain the full JSON state object. */
	returnFullState?:boolean

	/** If set to `true`, device will reboot immediately. */
	reboot?:boolean

	/** Set module time to unix timestamp. */
	time?:number

	segments?:WLEDClientSegmentSendOnly[]

	/** Set playlist. */
	playlist?:WLEDClientPlaylist
}

export interface WLEDClientStateReceiveOnly {
	/** Error flag that may be set when some issues are encountered in WLED. */
	error?:string,

	nightlight:{
		/** Remaining nightlight duration in seconds, `-1` if not active. */
		remaining?:number
	}
}

export interface WLEDClientNightlightState {
	/** Whether or not nightlight is currently active. */
	on?:boolean

	/**
	 * Duration of the nightlight in minutes.
	 * @type {number} 1 to 255
	 */
	duration?:number

	/**
	 * Nightlight mode
	 * @type {WLEDNightlightMode} 0: Instant, 1: Fade, 2: Color fade, 3: Sunrise
	 */
	mode?:WLEDNightlightMode

	/**
	 * Target brightness of the nightlight
	 * @type {number} 0 to 255
	 */
	targetBrightness?:number
}

export interface WLEDClientExchangeableState {
	/** Device's current power state. */
	on?:boolean

	/**
	 * Device's current brightness.
	 * @type {number} Between 0 and 255.
	 */
	brightness?:number

	/**
	 * Device's current transition time in 100ms intervals (eg. 4 is 400ms).
	 * @type {number} 0 to 255
	 */
	transitionTime?:number

	/** ID of the device's current preset. */
	presetId?:number

	/** ID of the device's current playlist. */
	playlistId?:number

	/** Object containing the device's nightlight state. */
	nightlight:WLEDClientNightlightState

	/** UDP Sync state object. */
	udpSync: {
		/** Send UDP Sync broadcast packet on state change. */
		send?:boolean

		/** Receive UDP Sync broadcast packets. */
		receive?:boolean
	}

	/**
	 * Live data override.
	 * @type {WLEDLiveDataOverride} 0: Off, 1: Override until data ends, 2: Override until reboot
	 */
	liveDataOverride?:WLEDLiveDataOverride

	/**
	 * ID of the main segment.
	 * @type {number} 0 to `info.leds.maxSegments`-1
	 */
	mainSegmentId?:number

	/**
	 * Array of segments.
	 */
	segments:WLEDClientSegment[]
}

export type WLEDClientUpdatableState = PartialDeep<WLEDClientExchangeableState> & WLEDClientStateSendOnly
export type WLEDClientState = WLEDClientExchangeableState & WLEDClientStateReceiveOnly

//
// Info Interfaces
//

export interface WLEDClientInfoLEDs {
	/**
	 * Total number of LEDs.
	 * @type {number} 1 to 1200
	 */
	count?:number

	/**
	 * Current frames per second.
	 * @type {number} 0 to 255
	 */
	fps?:number

	/** `true` if LEDs are 4-channel (RGBW). */
	rgbw?:boolean

	/** `true` if a white channel slider should be displayed. */
	whiteValueInput?:boolean

	/**
	 * Current LED power usage in milliamps as determined by the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	currentPower?:number

	/**
	 * Maximum power budget in milliamps for the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	maxPower?:number

	/** Maximum number of segments supported by this version. */
	maxSegments?:number
}

export interface WLEDClientInfo {
	/** Device's WLED version name. */
	version?:string

	/** Device's WLED build ID. (YYMMDDB, B = daily build index) */
	buildId?:number

	/** The producer/vendor of the light. Always `WLED` for standard installations. */
	brand?:string

	/** The product name. Always `FOSS` for standard installations. */
	product?:string

	/** Device's individual name. Intended for display in lists and titles. */
	name?:string

	/** Name of the platform. */
	arch?:string

	/** Version of the underlying (Arduino core) SDK. */
	core?:string

	/** Bytes of heap memory (RAM) currently available. Problematic if more than `10k`. */
	freeheap?:number

	/** Time since the last boot/reset in seconds. */
	uptime?:number

	/** The hexadecimal hardware MAC address of the device. Lowercase and without colons. */
	mac?:string

	/** The UDP port for realtime packets and WLED broadcast. */
	udpPort?:number

	/** Info on the device's physical LED setup. */
	leds:WLEDClientInfoLEDs

	/** If `true`, the software is currently receiving realtime data via UDP or E1.31. */
	live?:boolean

	/** Source of the realtime data. */
	liveSource?:string

	/** IP of the realtime data source.  */
	liveIp?:string

	/**
	 * Number of other WLED devices discovered on the network. `-1` if Node discovery disabled.
	 * @type {number} -1 to 255
	 */
	discoveredDevicesCount?:number

	/**
	 * Current number of WebSocket clients connected to the device.
	 * @type {number} -1 to 8
	 */
	wsConnectedCount?:number

	/** Number of effects available on the device. */
	effectsCount?:number

	/** Number of color palettes available on the device. */
	palettesCount?:number

	/** Info on the device's WiFi connection. */
	wifi:{
		/** Basic service set identifier of the currently connected network. */
		bssid?:string

		/** Received signal strength indicator. */
		rssi?:number

		/** Strength of the signal produced. Exists only if debug mode is enabled on the device. */
		txPower?:number

		/** True if modem sleep is enabled. Exists only if debug mode is enabled on the device. */
		sleep?:boolean

		/**
		 * Relative signal quality of the current connection.
		 * @type {number} 0 to 100
		 */
		signal?:number

		/**
		 * The current WiFi channel.
		 * @type {number} 1 to 14
		 */
		channel?:number
	}

	/** Info about the embedded LittleFS filesystem. */
	fs:{
		/** Estimate of used filesystem space in kilobytes. */
		used?:number

		/** Total filesystem size in kilobytes. */
		total?:number

		/** Unix timestamp for the last modification to the `presets.json` file. Not accurate after boot or after using `/edit`. */
		presetsModifiedTime?:number
	}

	/**
	 * If `true`, an UI with only a single button for toggling sync should toggle receive+send, otherwise send only
	 */
	syncToggleReceive?:boolean

	/** Bit field of options that WLED is configured with. */
	options?:number

	/** Reason for reset. Exists only if debug mode is enabled on the device.  */
	resetReason?:string

	/** Reason for reset. Exists only if debug mode is enabled on the device.  */
	resetReason0?:string

	/** Reason for reset. Exists only if debug mode is enabled on the device.  */
	resetReason1?:string

	/**
	 * Version of LwIP. `1` or `2` on ESP8266, `0` (does not apply) on ESP32.
	 * @deprecated Will be removed in 0.14
	 */
	 lwip?:0|1|2
}

export type WLEDClientEffects = string[]
export type WLEDClientPalettes = string[]

//
// Live Interface
//

export interface WLEDClientLive {
	/** Live stream of LED data. Start with `startLEDStream()`. */
	leds:boolean
}

export interface WLEDClientLiveLEDs {
	/** List of color values from every `n`th LED attached to the device. */
	leds:string[]

	/** If the number of LEDs is more than device's supported number of live LEDs, then WLED will send every `n`th LED. */
	n:number
}

//
// Presets
//

export interface WLEDClientCurrentStatePreset {
	/**
	 * Name
	 */
	name:string

	/**
	 * Quick load label
	 */
	label?:string

	/** Sets flag includeBri */
	includeBrightness?:boolean

	/** Sets flag segmentBounds */
	segmentBounds?:boolean
}

export interface WLEDClientPreset {
	/**
	 * Name
	 */
	name:string

	/**
	 * Quick load label
	 */
	label?:string

	/**
	 * Device's power state
	 */
	on?:boolean

	/**
	 * Brightness
	 */
	brightness?:number

	/**
	 * Transition time
	 */
	transition?:number

	/**
	 * Main segment ID
	 */
	mainSegment?:number

	/**
	 * Segments configuration
	 */
	segments?:WLEDClientSegment[]
}

export type WLEDClientPresets = { [key:number]: WLEDClientPreset }

//
// Device Options

export interface WLEDClientDeviceOptions {
	/** Device has debug mode enabled. */
	debug?:boolean

	/** Device has support for Alexa. */
	alexa?:boolean

	/** Device has support for Blynk IoT platform. */
	blynk?:boolean

	/** Device has support for Cronixie clock kit. */
	cronixie?:boolean

	/** Device has filesystem. */
	filesystem?:boolean

	/** Device has support for Hue Sync. */
	huesync?:boolean

	/** Device has support for Adalight. */
	adalight?:boolean

	/** Device has support for Over The Air updates. */
	OTA?:boolean
}

export interface WLEDClientContext {
	/** WLED Client state object. */
	state:WLEDClientState
	/** WLED Client info object */
	info:WLEDClientInfo
	/** List of effects available on the device. */
	effects:WLEDClientEffects
	/** List of color palettes available on the device. */
	palettes:WLEDClientPalettes
	/** List of presets saved on the device. */
	presets:WLEDClientPresets
	/** Options parsed from `info.opt` */
	deviceOptions:WLEDClientDeviceOptions
	/** Live streaming data sources currently sending data. */
	live:WLEDClientLive
}

/**
 * Optional properties you can set when using sending this command.
 */
export interface WLEDClientSendOptions {
	/**
	 * Transition time in 100ms intervals (eg. 4 is 400ms), for the current API call only.
	 * @type {number} 0 to 255
	 */
	transition?:number

	/** Don't send a UDP Sync broadcast packet for the current API call only. */
	noSync?:boolean

	/** Choose which API to use. */
	method?: 'ws'|'json'
}

/** Optional properties relating to the segment this method will affect. */
export interface WLEDClientSendSegmentOptions {
	/** Segment ID or an array of Segment IDs to target with this command. */
	segmentId?:number|number[]
}
