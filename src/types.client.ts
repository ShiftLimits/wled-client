import { WLEDNightlightMode, WLEDLiveDataOverride, WLEDAPOpenBehavior, WLEDAutoWhiteMode, WLEDBusType, WLEDBusColorOrder, WLEDButtonType, WLEDIRRemoteType, WLEDPaletteBlendingMode, WLEDDMXMode, WLEDClockOverlay } from './constants';
import { RGBColor, RGBWColor, IPV4 } from './types';
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

	/** Choose what information to fetch on initialization */
	init?: {
		/** Fetch device presets on init */
		presets?:boolean

		/** Fetch device config on init */
		config?:boolean
	}
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
	/** The ID of this segment. */
	id?:number

	/** The name of this segment. */
	name?:string

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

	/** Offset of this segment. */
	offset?:number

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

	/**
	 * Repeat - multiplies segment until all LEDs are used, or max segments reached
	 */
	repeat?:boolean

	/**
	 * If true the segment's contents will not be refreshed
	 */
	freeze?:boolean

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

	/** The correlated color temperature of this segment. */
	cct?:number

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

	/**
	 * `true` if LEDs are 4-channel (RGBW).
	 * @deprecated use info.leds.segmentLightCapabilities
	 */
	rgbw?:boolean

	/**
	 * `true` if device has cct support.
	 * @deprecated use info.leds.segmentLightCapabilities
	 */
	cct?:boolean

	/**
	 * `true` if a white channel slider should be displayed.
	 * @deprecated use info.leds.segmentLightCapabilities
	 */
	whiteValueInput?:boolean

	/**
	 * Capabilities of the busses included in each segment in ascending ID order up to last active segment (0 for non-active segment).
	 */
	segmentLightCapabilities?:number[]

	/**
	 * Combined light capabilities across all segments.
	 */
	lightCapabilities?:number

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

export type WLEDClientLiveLEDs = Uint8Array[]

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

//
// Device Capabilities

export interface WLEDClientLightCapabilities {
	/** Supports color temperature. */
	cct?:boolean

	/** Supports white channel. */
	white?:boolean

	/** Supports RGB color. */
	rgb?:boolean
}

//
// Device Config

export interface WLEDClientConfigSendOnly {
	network?:{
		instances?:{
			/** Pre-shared key */
			psk?:string
		}[]
	}

	accessPoint?:{
		/** Pre-shared key */
		psk?:string
	}

	interfaces?:{
		mqtt?:{
			/** Pre-shared key */
			psk?:string
		}
	}

	ota?: {
		/** Pre-shared key */
		psk?:string
	}

	/** Reboot device */
	reboot?:boolean
}
export interface WLEDClientConfigReceiveOnly {
	/** Ethernet */
	ethernet?: {
		/** Ethernet pins */
		pins?:number[]
	}

	/**
	 * Settings revision
	 * @type {[number, number]} [Major, minor]
	 */
	revision?:[number, number]

	/** Version ID */
	versionId?:number

	network?: {
		instances?: {
			/** Length of the pre-shared key */
			pskLength?:number
		}[]
	}

	accessPoint?: {
		/** IP address */
		ip?:IPV4

		/** Length of the pre-shared key */
		pskLength?:number
	}

	hardware?: {
		led?: {
			/**
			 * Total number of LEDs
			 *
			 * No longer read, but provided for compatibility on downgrade.
			 */
			total?:number
		}
	}

	interfaces?:{
		mqtt?:{
			/** Length of the pre-shared key */
			pskLength?:number
		}
	}

	ota?: {
		/** Length of the pre-shared key */
		pskLength?:number
	}
}

export interface WLEDClientExchangeableConfig {
	/** Ethernet */
	ethernet?: {
		/** Ethernet type */
		type?:number
	}

	/** Identity */
	id?: {
		/** Multicast DNS hostname */
		mdns?:string

		/** Device name */
		name?:string

		/** Alexa invocation name */
		invocationName?:string
	}

	/** Network */
	network?: {
		/** Instances */
		instances?: {
			/** Service set identifier (Network ID) */
			ssid?:string

			/** Static IP address */
			ip?:IPV4

			/** Static gateway */
			gateway?:IPV4

			/** Static subnet */
			subnet?:IPV4
		}[]
	}

	/** WiFi access point */
	accessPoint?: {
		/** Service set identifier (Network ID) */
		ssid?:string

		/** Channel */
		chan?:number

		/** Hide SSID from broadcast */
		hide?:number

		/** AP open behavior */
		openBehavior?:WLEDAPOpenBehavior
	}

	/** WiFi firmware */
	wifi?: {
		/** WiFi sleep is enabled */
		sleep?:boolean
	}

	/** Hardware Settings */
	hardware?: {
		/** LED */
		led?: {
			/** Maximum current for the whole strip in milliamps */
			maxCurrent?:number

			/** Maximum current per LED in milliamps */
			maxCurrentPerLED?:number

			/** Auto white mode */
			autoWhiteMode?:WLEDAutoWhiteMode

			/** White temperature correction */
			cctCorrection?:boolean

			/** Enable CCT calculation from RGB */
			cctFromRGB?:boolean

			/** CCT blending */
			cctBlending?:number

			/** Target FPS */
			fps?:number

			/** Bus instances (strips, busses, channels?) */
			instances?:{
				/** Type of LEDs attached to this bus (eg. WS2812b, SK6812 etc.) */
				type?:WLEDBusType

				/** Starting LED */
				start?:number

				/** Length of bus in number of LEDs */
				length?:number

				/** Skip first N LEDs (offset) */
				skip?:number

				/** Color order */
				colorOrder?:WLEDBusColorOrder

				/** Bus pins */
				pins?:number[]

				/** Bus requires off refresh */
				offRefresh?:boolean

				/** Reverse bus */
				reverse?:boolean

				/** Bus is RGBW */
				rgbw?:boolean
			}[]
		}

		/** Button */
		button?: {
			/** Maximum number of buttons */
			max?:number

			/** Button instances */
			instances?:{
				/** Button type */
				type?:WLEDButtonType

				/** Button pin */
				pin?:[number]

				/** Button macros (interactions) */
				macros?:[
					/** Short press */
					number,
					/** Long press */
					number,
					/** Double press */
					number
				]
			}[]

			/** Touch threshold */
			touchThreshold?:number

			/** Publish to MQTT */
			mqtt?:boolean
		}

		/** Infrared */
		ir?: {
			/** Pin used by the IR sensor */
			pin?:number

			/** Type of IR remote */
			type?:WLEDIRRemoteType
		}

		/** Relay */
		relay?: {
			/** Pin used by the relay */
			pin?:number

			/** Reverse the relay */
			reverse?:boolean
		}
	}

	/** Light */
	light?: {
		/** Brightness multiplier */
		scaleBrightness?:number

		/** Palette blending mode */
		paletteBlendingMode?:WLEDPaletteBlendingMode

		/** Auto segments is enabled */
		autoSegments?:boolean

		/** Gamma correction */
		gammaCorrection?: {
			/**
			 * Brightness gamma correction
			 * @type {number} 2.8 if on, 1.0 if off
			 */
			brightness?:number

			/**
			 * Color gamma correction
			 * @type {number} 2.8 if on, 1.0 if off
			 */
			color?:number
		}

		/** Transitions */
		transition?: {
			/** Transitions are enabled */
			enabled?:boolean

			/** Transition duration in milliseconds */
			duration?:number

			/** Transitions between palettes is enabled */
			palettes?:boolean
		}

		/** Nightlight */
		nightlight?: {
			/** Default nightlight mode */
			mode?:WLEDNightlightMode

			/** Default duration of the nightlight in minutes */
			duration?:number

			/** Default target brightness of the nightlight */
			targetBrightness?:number
		}
	}

	/** Defaults */
	defaults?: {
		/** Apply specified preset */
		preset?:number

		/** Turn LEDs on */
		on?:boolean

		/** Set target brightness */
		brightness?:number
	}

	/** Interfaces */
	interfaces?: {
		/** Blynk */
		blynk?:{
			/** Blynk host */
			host?:string

			/** Blynk port */
			port?:number

			/** Blynk token */
			token?:string
		}

		/** Hue Sync */
		hue?:{
			/** Hue Sync polling is enabled */
			enabled?:boolean

			/** Light ID */
			id?:number

			/** Hue IP */
			ip?:IPV4

			/** Polling interval */
			interval?:number

			/** Receive from Hue */
			receive?: {
				/** Receive on/off notifications */
				on?:boolean

				/** Receive brightness notifications */
				brightness?:boolean

				/** Receive color notifications */
				color?:boolean
			}
		}

		/** Live */
		live?:{
			/** DMX */
			dmx?: {
				/** DMX Address */
				address?:number

				/** DMX Mode */
				mode?:WLEDDMXMode

				/** e131 skip out of sequence */
				sequenceSkip?:boolean

				/** e131 universe */
				universe?:number
			}

			/** e131 multicast */
			multicast?:boolean

			/** e131 port */
			port?:number

			/** Receive direct notifications */
			enabled?:boolean

			/** arlsForceMaxBri */
			maxBrightness?:boolean

			/** arlsDisableGammaCorrection */
			noGammaCorrection?:boolean

			/** arlsOffset */
			offset?:number

			/** Real-time timeout duration  */
			timeout?:number
		}

		/** MQTT */
		mqtt?:{
			/** MQTT is enabled */
			enabled?:boolean

			/** Broker host */
			broker?:string

			/** Broker port */
			port?:number

			/** Client ID */
			clientId?:string

			/** Username */
			user?:string

			/** MQTT Topics */
			topics?: {
				/** Device topic */
				device?:string

				/** Group topic */
				group?:string
			}
		}

		/** Nodes */
		nodes?:{
			/** Listen for other WLED nodes */
			list?:boolean

			/** Broadcast existence to other WLED nodes */
			broadcast?:boolean
		}

		/** Network Time Protocol */
		ntp?:{
			/** NTP is enabled */
			enabled?:boolean

			/** NTP host address */
			host?:string

			/** Use AM/PM instead of 24 hour time */
			ampm?:boolean

			/** Timezone */
			timezone?:number

			/** Longitude */
			lon?:number

			/** Latitude */
			lat?:number

			/** Time offset in seconds */
			offset?:number
		}

		/** Synchronize */
		sync?:{
			/** UDP port */
			port0?:number

			/** UDP port */
			port1?:number

			/** Sync receive */
			receive?: {
				/** Receive notifications for brightness */
				brightness?:boolean

				/** Receive notifications for color */
				color?:boolean

				/** Receive notifications for effects */
				effects?:boolean

				/** Receive groups */
				groups?:number
			}

			/** Sync send */
			send?: {
				/** Send button input notifications */
				button?:boolean

				/** Send direct notifications */
				direct?:boolean

				/** Send Hue notifications */
				hue?:boolean

				/** Send Macro notifications */
				macro?:boolean

				/** Send Alexa notifications */
				alexa?:boolean

				/** Send notifications twice */
				twice?:boolean

				/** Send groups */
				groups?:number
			}
		}

		/** Alexa */
		alexa?:{
			/** Alexa enabled */
			enabled?:boolean

			/** Alexa macros */
			macros?:[
				/** Alexa On macro */
				number,
				/** Alexa Off macro */
				number
			]
		}
	}

	/** Overlay */
	overlay?: {
		/**
		 * Clock overlay mode
		 * @type {WLEDClockOverlay}
		 */
		clock?:WLEDClockOverlay

		/** Countdown mode enabled */
		countdown?:boolean

		/** First LED index used by the analog clock */
		min?:number

		/** Last LED index used by the analog clock */
		max?:number

		/** LED index for the "12" in the analog clock */
		show12LED?:number

		/** Show 5 minute marks */
		show5MinuteMarks?:boolean

		/** Show seconds trail */
		showSecondsTrail?:boolean
	}

	/** Timers */
	timers?: {
		/** Countdown */
		countdown?: {
			/** Goal for the timer as datetime */
			goal?:[
				/** Year */
				number,
				/** Month */
				number,
				/** Day */
				number,
				/** Hour */
				number,
				/** Minute */
				number,
				/** Second */
				number
			]

			/** Countdown macro */
			macro?:number
		}

		/** Active timer instances */
		instances?:{
			/** Timer is enabled */
			enabled?:boolean

			/** Hour */
			hour?:number

			/** Minute */
			minute?:number

			/** Day of Week */
			dayOfWeek?:number

			/** Preset ID */
			macro?:number

			/** Timer start date */
			start?: {
				/** Start month */
				month?:number

				/** Start day */
				day?:number
			}

			/** Timer end date */
			end?: {
				/** End month */
				month?:number

				/** End day */
				day?:number
			}
		}[]
	}

	/** Over-The-Air */
	ota?: {
		/** Arduino OTA is enabled */
		arduinoOTA?:boolean

		/** Lock OTA software updates */
		lock?:boolean

		/** Lock changes to WiFi settings */
		lockWiFi?:boolean
	}

	/** DMX */
	dmx?: {
		/** Channel */
		channel?:number

		/** Gap */
		gap?:number

		/** Start */
		start?:number

		/** Start LED */
		startLED?:number

		/** Fixture map */
		fixtureMap?:number[]

		/** e131 proxy universe */
		e131Proxy?:boolean
	}

	/** User mods */
	usermods?:{[key:string]:any}
}

export type WLEDClientUpdatableConfig = PartialDeep<WLEDClientExchangeableConfig & WLEDClientConfigSendOnly>
export type WLEDClientConfig = WLEDClientExchangeableConfig & WLEDClientConfigReceiveOnly

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
	/** Lighting capabilities of the device. */
	lightCapabilities:WLEDClientLightCapabilities
	/** Live streaming data sources currently sending data. */
	live:WLEDClientLive
	/**  */
	config:WLEDClientConfig
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

	/** Set a timeout on this request for **JSON API only** */
	timeout?:number
}

/** Optional properties relating to the segment this method will affect. */
export interface WLEDClientSendSegmentOptions {
	/** Segment ID or an array of Segment IDs to target with this command. */
	segmentId?:number|number[]
}
