import { WLEDNightlightMode, WLEDLiveDataOverride, WLEDClockOverlay, WLEDAPOpenBehavior, WLEDAutoWhiteMode, WLEDBusType, WLEDBusColorOrder, WLEDButtonType, WLEDIRRemoteType, WLEDPaletteBlendingMode, WLEDDMXMode } from './constants';
import { RGBColor, RGBWColor, IPV4 } from './types';
import { PartialDeep } from 'type-fest'

//
// Segment Interfaces
//

export interface WLEDSegmentSendOnly {
	/** Zero-indexed ID of the segment. May be omitted, in that case the ID will be inferred from the order of the segment objects in the seg array. */
	id:number

	/** Individual LED control. */
	i:number|[number,number,number][]
}

export interface WLEDSegment {
	/** The ID of this segment. */
	id:number

	/** The name of this segment. */
	n:string

	/**
	 * LED index that the segment starts at.
	 * @type {number} 0 to `info.leds.count`-1
	 */
	start:number

	/**
	 * LED the segment stops at, not included in range. If stop is set to a lower or equal value than start (setting to `0` is recommended), the segment is invalidated and deleted.
	 * @type {number} 0 to `info.leds.count`
	 */
	stop:number

	/**
	 * Length of the segment (`stop` - `start`). `stop` has preference, so if it is included, `len` is ignored.
	 * @type {number} 0 to info.leds.count
	 */
	len:number

	/** Offset of this segment. */
	of:number

	/**
	 * Grouping - how many consecutive LEDs of the same segment will be grouped to the same color.
	 * @type {number} 0 to 255
	 */
	grp:number

	/**
	 * Spacing - how many LEDs are turned off and skipped between each group.
	 * @type {number} 0 to 255
	 */
	spc:number

	/**
	 * Repeat - multiplies segment until all LEDs are used, or max segments reached
	 */
	rpt:boolean

	/**
	 * If true the segment's contents will not be refreshed
	 */
	frz?:boolean

	/** Array that has up to 3 color arrays as elements, the primary, secondary (background) and tertiary colors of the segment. Each color is an array of 3 or 4 bytes, which represent an RGB(W) color. */
	col:(RGBColor|RGBWColor)[]

	/** The correlated color temperature of this segment. */
	cct:number

	/**
	 * ID of the effect on the individual segment.
	 * @type {number} 0 to `info.fxcount`-1
	 */
	fx:number

	/**
	 * Relative effect speed
	 * @type {number} 0 to 255
	 */
	sx:number

	/**
	 * Effect intensity
	 * @type {number} 0 to 255
	 */
	ix:number

	/**
	 * ID of the color palette on the individual segment.
	 * @type {number} 0 to `info.palcount`-1
	 */
	pal:number

	/**
	 * `true` if the segment is selected. Selected segments will have their state (color/FX) updated by APIs that don't support segments (currently any API except this JSON API).
	 *
	 * If no segment is selected, the first segment (id: `0`) will behave as if selected. WLED will report the state of the first (lowest id) segment that is selected to APIs (UDP sync, HTTP, MQTT, Blynk...).
	 */
	sel:boolean

	/** Reverses the segment, causing animations to change direction. */
	rev:boolean

	/** Turns on and off the individual segment. */
	on:boolean

	/** Sets the brightness of the individual segment. */
	bri:number

	/** Mirrors the individual segment. */
	mi:boolean

	/** Loxone RGB value for primary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	lx:number

	/** Loxone RGB value for secondary color. Each color (RRR,GGG,BBB) is specified in the range from 0 to 100%. */
	ly:number
}

//
// Playlist Interfaces
//

export interface WLEDPlaylist {
	/** Array of preset ID integers to be applied in order. */
	ps:number[]

	/** Array of time each preset should be kept, in tenths of seconds. If only one integer is supplied, all presets will be kept for that time. Defaults to 10 seconds if not provided. */
	dur:number[]

	/** Array of time each preset should transition to the next one, in tenths of seconds. If only one integer is supplied, all presets will transition for that time. Defaults to the current transition time if not provided. */
	transition:number|number[]

	/** How many times the entire playlist should cycle before finishing. Set to `0` for an indefinite cycle. Default to indefinite if not provided. */
	repeat:number

	/** Single preset ID to apply after the playlist finished. Has no effect when an indefinite cycle is set. If not provided, the light will stay on the last preset of the playlist. */
	end:number
}

//
// State Interfaces
//

export interface WLEDStateSendOnly {
	/** Transition time for the current API call only. */
	tt:number

	udpn: {
		/** Don't send a UDP Sync broadcast packet for the current API call only. */
		nn:boolean
	}

	/** ID of the preset slot to save to. */
	psave:number

	/** ID of the preset to delete. */
	pdel:number

	/** Sets flag includeBri */
	ib:boolean

	/** Sets flag segmentBounds */
	sb:boolean

	/** Build new state when saving preset. */
	o:boolean

	/** If set to `true` in a JSON POST command, the response will contain the full JSON state object. */
	v:boolean

	/** If set to `true`, device will reboot immediately. */
	rb:boolean

	/** Set module time to unix timestamp. */
	time:number

	seg:WLEDSegmentSendOnly[]

	/** Set playlist. */
	playlist:WLEDPlaylist
}

export interface WLEDStateReceiveOnly {
	/** Error flag that may be set when some issues are encountered in WLED. */
	error:string,

	nightlight:{
		/** Remaining nightlight duration in seconds, `-1` if not active. */
		rem:number
	}
}

export interface WLEDNightlightState {
	/** Whether or not nightlight is currently active. */
	on:boolean

	/**
	 * Duration of the nightlight in minutes.
	 * @type {number} 1 to 255
	 */
	dur:number

	/**
	 * Nightlight mode
	 * @type {WLEDNightlightMode} 0: Instant, 1: Fade, 2: Color fade, 3: Sunrise
	 */
	mode:WLEDNightlightMode

	/**
	 * Target brightness of the nightlight
	 * @type {number} 0 to 255
	 */
	tbri:number
}

export interface WLEDExchangeableState {
	/** Device's current power state. */
	on:boolean

	/**
	 * Device's current brightness.
	 * @type {number} Between 0 and 255.
	 */
	bri:number

	/** Device's current transition time. */
	transition:number

	/** ID of the device's current preset. */
	ps:number

	/** ID of the device's current playlist. */
	pl:number

	/** Nightlight feature state object. */
	nl:WLEDNightlightState

	/** UDP Sync state object. */
	udpn: {
		/** Send UDP Sync broadcast packet on state change. */
		send:boolean

		/** Receive UDP Sync broadcast packets. */
		recv:boolean
	}

	/**
	 * Live data override.
	 * @type {WLEDLiveDataOverride} 0: Off, 1: Override until data ends, 2: Override until reboot
	 */
	lor:WLEDLiveDataOverride

	/**
	 * ID of the main segment.
	 * @type {number} 0 to `info.leds.maxseg`-1
	 */
	mainseg:number

	/**
	 * Array of segments.
	 */
	seg:WLEDSegment[]
}

export type WLEDUpdatableState = PartialDeep<WLEDExchangeableState & WLEDStateSendOnly>
export type WLEDState = WLEDExchangeableState & WLEDStateReceiveOnly

//
// Info Interfaces
//

export interface WLEDInfoLEDs {
	/**
	 * Total number of LEDs.
	 * @type {number} 1 to 1200
	 */
	count:number

	/**
	 * Current frames per second.
	 * @type {number} 0 to 255
	 */
	fps:number

	/** `true` if LEDs are 4-channel (RGBW). */
	rgbw:boolean

	/** `true` if a white channel slider should be displayed. */
	wv:boolean

	/** `true` if device has cct support. */
	cct:boolean

	/**
	 * Current LED power usage in milliamps as determined by the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	pwr:number

	/**
	 * Maximum power budget in milliamps for the ABL. `0` if ABL is disabled.
	 * @type {number} 0 to 65000
	 */
	maxpwr:number

	/** Maximum number of segments supported by this version. */
	maxseg:number
}

export interface WLEDInfo {
	/** Device's WLED version name. */
	ver:string

	/** Device's WLED build ID. (YYMMDDB, B = daily build index) */
	vid:number

	/** The producer/vendor of the light. Always `WLED` for standard installations. */
	brand:string

	/** The product name. Always `FOSS` for standard installations. */
	product:string

	/** Device's individual name. Intended for display in lists and titles. */
	name:string

	/** Name of the platform. */
	arch:string

	/** Version of the underlying (Arduino core) SDK. */
	core:string

	/** Bytes of heap memory (RAM) currently available. Problematic if more than `10k`. */
	freeheap:number

	/** Time since the last boot/reset in seconds. */
	uptime:number

	/** The hexadecimal hardware MAC address of the device. Lowercase and without colons. */
	mac:string

	/** The UDP port for realtime packets and WLED broadcast. */
	udpport:number

	/** Info on the device's physical LED setup. */
	leds:WLEDInfoLEDs

	/** If `true`, the software is currently receiving realtime data via UDP or E1.31. */
	live:boolean

	/** Source of the realtime data. */
	lm:string

	/** IP of the realtime data source.  */
	lip:string

	/**
	 * Number of other WLED devices discovered on the network. `-1` if Node discovery disabled.
	 * @type {number} -1 to 255
	 */
	ndc:number

	/**
	 * Current number of WebSocket clients connected to the device.
	 * @type {number} -1 to 8
	 */
	ws:number

	/** Number of effects available on the device. */
	fxcount:number

	/** Number of color palettes available on the device. */
	palcount:number

	/** Info on the device's WiFi connection. */
	wifi:{
		/** Basic service set identifier of the currently connected network. */
		bssid:string

		/** Received signal strength indicator. */
		rssi:number

		/** Strength of the signal produced. Exists only if debug mode is enabled on the device. */
		txPower?:number

		/** True if modem sleep is enabled. Exists only if debug mode is enabled on the device. */
		sleep?:boolean

		/**
		 * Relative signal quality of the current connection.
		 * @type {number} 0 to 100
		 */
		signal:number

		/**
		 * The current WiFi channel.
		 * @type {number} 1 to 14
		 */
		channel:number
	}

	/** Info about the embedded LittleFS filesystem. */
	fs:{
		/** Estimate of used filesystem space in kilobytes. */
		u:number

		/** Total filesystem size in kilobytes. */
		t:number

		/** Unix timestamp for the last modification to the `presets.json` file. Not accurate after boot or after using `/edit`. */
		pmt:number
	}

	/** If `true`, an UI with only a single button for toggling sync should toggle receive+send, otherwise send only. */
	str:boolean

	/** Bit field of options that WLED is configured with. */
	opt:number

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
	lwip:0|1|2
}

export type WLEDEffects = string[]
export type WLEDPalettes = string[]

export type WLEDPaletteData = ([number,number,number,number]|string)[]
export type WLEDPalettesData = { [id:string]:WLEDPaletteData }

export interface WLEDPaletteDataPage {
	m:number
	p:WLEDPalettesData
}

//
// Live Interface
//

export interface WLEDLive {
	/** List of color values from every `n`th LED attached to the device. */
	leds:string[]

	/** If the number of LEDs is more than device's supported number of live LEDs, then WLED will send every `n`th LED. */
	n:number
}

//
// Presets
//

export interface WLEDPreset {
	/**
	 * Name
	 */
	n:string

	/**
	 * Quick load label
	 */
	ql?:string

	/**
	 * Device's power state
	 */
	on?:boolean

	/**
	 * Brightness
	 */
	bri?:number

	/**
	 * Transition time
	 */
	transition?:number

	/**
	 * Main segment ID
	 */
	mainseg?:number

	/**
	 * Segments configuration
	 */
	segments?:WLEDSegment[]
}

export type WLEDPresets = { [key:number]: WLEDPreset } // WLED returns an object from the presets file

//
// Device Config

export interface WLEDConfigSendOnly {
	nw?:{
		ins?:{
			/** Pre-shared key */
			psk?:string
		}[]
	}

	ap?:{
		/** Pre-shared key */
		psk?:string
	}

	if?:{
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
	rb?:boolean
}
export interface WLEDConfigReceiveOnly {
	/** Ethernet */
	eth?: {
		/** Ethernet pins */
		pins?:number[]
	}

	/**
	 * Settings revision
	 * @type {[number, number]} [Major, minor]
	 */
	rev?:[number, number]

	/** Version ID */
	vid?:number

	nw?: {
		ins?: {
			/** Length of the pre-shared key */
			pskl?:number
		}[]
	}

	ap?: {
		/** IP address */
		ip?:IPV4

		/** Length of the pre-shared key */
		pskl?:number
	}

	hw?: {
		led?: {
			/**
			 * Total number of LEDs
			 *
			 * No longer read, but provided for compatibility on downgrade.
			 */
			total?:number
		}
	}

	if?:{
		mqtt?:{
			/** Length of the pre-shared key */
			pskl?:number
		}
	}

	ota?: {
		/** Length of the pre-shared key */
		pskl?:number
	}
}

export interface WLEDExchangeableConfig {
	/** Ethernet */
	eth?: {
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
		inv?:string
	}

	/** Network */
	nw?: {
		/** Instances */
		ins?: {
			/** Service set identifier (Network ID) */
			ssid?:string

			/** Static IP address */
			ip?:IPV4

			/** Static gateway */
			gw?:IPV4

			/** Static subnet */
			sn?:IPV4
		}[]
	}

	/** WiFi access point */
	ap?: {
		/** Service set identifier (Network ID) */
		ssid?:string

		/** Channel */
		chan?:number

		/** Hide SSID from broadcast */
		hide?:number

		/** AP open behavior */
		behav?:WLEDAPOpenBehavior
	}

	/** WiFi firmware */
	wifi?: {
		/** WiFi sleep is enabled */
		sleep?:boolean
	}

	/** Hardware Settings */
	hw?: {
		led?: {
			/** Maximum power in milliamps. */
			maxpwr?:number

			/** Milliamps per LED */
			ledma?:number

			/** Auto white mode */
			rgbwm?:WLEDAutoWhiteMode

			/** White temperature correction */
			cct?:boolean

			/** Enable CCT calculation from RGB */
			cr?:boolean

			/** CCT blending */
			cb?:number

			/** Target FPS */
			fps?:number

			/** Bus instances (strips, busses, channels?) */
			ins?:{
				/** Type of LEDs attached to this bus (eg. WS2812b, SK6812 etc.) */
				type?:WLEDBusType

				/** Starting LED */
				start?:number

				/** Length of bus in number of LEDs */
				len?:number

				/** Skip first N LEDs (offset) */
				skip?:number

				/** Color order */
				order?:WLEDBusColorOrder

				/** Bus pins */
				pin?:number[]

				/** Bus requires off refresh */
				ref?:boolean

				/** Reverse bus */
				rev?:boolean

				/** Bus is RGBW */
				rgbw?:boolean
			}[]
		}

		/** Buttons */
		btn?: {
			/** Maximum number of buttons */
			max?:number

			/** Button instances */
			ins?:{
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
			tt?:number

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
			rev?:boolean
		}
	}

	/** Light */
	light?: {
		/** Brightness multiplier */
		'scale-bri'?:number

		/** Palette blending mode */
		'pal-mode'?:WLEDPaletteBlendingMode

		/** Auto segments is enabled */
		aseg?:boolean

		/** Gamma correction */
		gc?: {
			/**
			 * Brightness gamma correction
			 * @type {number} 2.8 if on, 1.0 if off
			 */
			bri?:number

			/**
			 * Color gamma correction
			 * @type {number} 2.8 if on, 1.0 if off
			 */
			col?:number
		}

		/** Transitions */
		tr?: {
			/** Transitions are enabled */
			mode?:boolean

			/** Transition duration in milliseconds */
			dur?:number

			/** Transitions between palettes is enabled */
			pal?:boolean
		}

		/** Nightlight */
		nl?: {
			/** Default nightlight mode */
			mode?:WLEDNightlightMode

			/** Default duration of the nightlight in minutes */
			dur?:number

			/** Default target brightness of the nightlight */
			tbri?:number
		}
	}

	/** Defaults */
	def?: {
		/** Apply specified preset */
		ps?:number

		/** Turn LEDs on */
		on?:boolean

		/** Set target brightness */
		bri?:number
	}

	/** Interfaces */
	if?: {
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
			en?:boolean

			/** Light ID */
			id?:number

			/** Hue IP */
			ip?:IPV4

			/** Polling interval */
			iv?:number

			/** Receive from Hue */
			recv?: {
				/** Receive on/off notifications */
				on?:boolean

				/** Receive brightness notifications */
				bri?:boolean

				/** Receive color notifications */
				col?:boolean
			}
		}

		/** Live */
		live?:{
			/** DMX */
			dmx?: {
				/** DMX Address */
				addr?:number

				/** DMX Mode */
				mode?:WLEDDMXMode

				/** e131 skip out of sequence */
				seqskip?:boolean

				/** e131 universe */
				uni?:number
			}

			/** e131 multicast */
			mc?:boolean

			/** e131 port */
			port?:number

			/** Receive direct notifications */
			en?:boolean

			/** arlsForceMaxBri */
			maxbri?:boolean

			/** arlsDisableGammaCorrection */
			'no-gc'?:boolean

			/** arlsOffset */
			offset?:number

			/** Real-time timeout duration  */
			timeout?:number
		}

		/** MQTT */
		mqtt?:{
			/** MQTT is enabled */
			en?:boolean

			/** Broker host */
			broker?:string

			/** Broker port */
			port?:number

			/** Client ID */
			cid?:string

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
			bcast?:boolean
		}

		/** Network Time Protocol */
		ntp?:{
			/** NTP is enabled */
			en?:boolean

			/** NTP host address */
			host?:string

			/** Use AM/PM instead of 24 hour time */
			ampm?:boolean

			/** Timezone */
			tz?:number

			/** Longitude */
			ln?:number

			/** Latitude */
			lt?:number

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
			recv?: {
				/** Receive notifications for brightness */
				bri?:boolean

				/** Receive notifications for color */
				col?:boolean

				/** Receive notifications for effects */
				fx?:boolean

				/** Receive groups */
				grp?:number
			}

			/** Sync send */
			send?: {
				/** Send button input notifications */
				btn?:boolean

				/** Send direct notifications */
				dir?:boolean

				/** Send Hue notifications */
				hue?:boolean

				/** Send Macro notifications */
				macro?:boolean

				/** Send Alexa notifications */
				va?:boolean

				/** Send notifications twice */
				twice?:boolean

				/** Send groups */
				grp?:number
			}
		}

		/** Alexa */
		va?:{
			/** Alexa enabled */
			alexa?:boolean

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
	ol?: {
		/**
		 * Clock overlay mode
		 * @type {WLEDClockOverlay}
		 */
		clock?:WLEDClockOverlay

		/** Countdown mode enabled */
		cntdwn?:boolean

		/** First LED index used by the analog clock */
		min?:number

		/** Last LED index used by the analog clock */
		max?:number

		/** LED index for the "12" in the analog clock */
		o12pix?:number

		/** Show 5 minute marks */
		o5m?:boolean

		/** Show seconds trail */
		osec?:boolean
	}

	/** Timers */
	timers?: {
		/** Countdown */
		cntdwn?: {
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
		ins?:{
			/** Timer is enabled */
			en?:boolean

			/** Hour */
			hour?:number

			/** Minute */
			min?:number

			/** Day of Week */
			dow?:number

			/** Preset ID */
			macro?:number

			/** Timer start date */
			start?: {
				/** Start month */
				mon?:number

				/** Start day */
				day?:number
			}

			/** Timer end date */
			end?: {
				/** End month */
				mon?:number

				/** End day */
				day?:number
			}
		}[]
	}

	/** Over-The-Air */
	ota?: {
		/** Arduino OTA is enabled */
		aota?:boolean

		/** Lock OTA software updates */
		lock?:boolean

		/** Lock changes to WiFi settings */
		'lock-wifi'?:boolean
	}

	/** DMX */
	dmx?: {
		/** Channel */
		chan?:number

		/** Gap */
		gap?:number

		/** Start */
		start?:number

		/** Start LED */
		'start-led'?:number

		/** Fixture map */
		fixmap?:number[]

		/** e131 proxy universe */
		e131proxy?:boolean
	}

	/** User mods */
	um?:{[key:string]:any}
}

export type WLEDUpdatableConfig = PartialDeep<WLEDExchangeableConfig & WLEDConfigSendOnly>
export type WLEDConfig = WLEDExchangeableConfig & WLEDConfigReceiveOnly

export interface WLEDContext {
	/** WLED state object. */
	state:WLEDState
	/** WLED info object */
	info: WLEDInfo
	/** List of effects available on the device. */
	effects:WLEDEffects
	/** List of color palettes available on the device. */
	palettes:WLEDPalettes
}
