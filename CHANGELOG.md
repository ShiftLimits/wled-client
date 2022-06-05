# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add `repeat` property to segments
- Add `freeze` property to segments
- Add support for reading segment light capabilities via `info.leds.segmentLightCapabilities` and `info.leds.lightCapabilities`
- Add `lightCapabilities` object to main client class which holds the parsed values for `rgb`, `white`, and `cct` from the info

### Deprecated
- Deprecated `rgbw`, `whiteValueInput`, and `cct` properties from `info.leds`, use the new `capabilities` object on the client instance eg. `const client = new WLEDClient('x.x.x.x'), console.log(client.capabilities)`

## [0.20.0]- 2022-01-29
After some further consideration, I have decided to decouple this project's versioning from WLED in order to better adhere to the expected behavior of a package in the NPM ecosystem. As of this release, WLED Client has been bumped up to **0.20.0** and further releases will update the version number according to standard Semantic Versioning. We moved up to 0.20 to help avoid confusing the client's version with WLED's version.

Starting with this version (0.20.0) WLED Client will target WLED 0.13.0 for API compatibility. Moving forward, WLED Client will bump major versions when there is a breaking change in the API that you consume in your projects. This may happen when WLED introduces a breaking change, or if there comes a need to restructure WLED Client.

### Added
- Add major support for getting and setting config values
- Add `setCCT` method for setting the correlated color temperature of the white channel
- Add `id` and `name` property to segments
- Add ability to stop the client from initializing the connection, allowing for the client to be initialized but will not fetch the context or connect to the WebSocket until `wled.init()` is called

### Changed
- **Breaking:** The `isReady` promise is now private and should no longer be used
  - Use `wled.init()` which will return a promise with the same behavior
- **Breaking:** Remove deprecated `info.leds.pins` property as it is no longer available in WLED 0.13.0
- **Breaking:** Remove deprecated `state.nightlight.fade` property as it is no longer available in WLED 0.13.0
- **Breaking:** Remove deprecated `state.presetCycle` property as it is no longer available in WLED 0.13.0
- If `null` is returned when trying to fetch palette data WLED Client will retry instead of bailing out

## [0.12.0-0.4]- 2021-11-29
The concept of "live data" in WLED Client is now generic and encompasses any possible live data instead of just LED state. LED state has been implemented into this generic concept.

Some better error handling has been implemented as well, with the `error` event now being utilized. Additionally most of the main methods can now optionally target one or more segments.

Otherwise filling in the client API more and improving dev experience. First implementation of support for fetching palette data as well!

### Added
- Add `getPalettesData` method for getting all color palette data, or optionally a specific page of palette data
- Add `setEffectSpeed` and `setEffectIntensity` methods
- Add `enableUDPSync` and `disableUDPSync` methods
- Add `reboot` method
- Add `live` property to WLED Context containing booleans indicating what live data is being sent over WebSocket, such as the current state of the device's LEDs indicated by `live.leds` and received by the `live:leds` event
- Add `wsReadyState` property to return the WebSocket instance's ready state
- Add `buildStateWithSegments` function to help build an updatable state object to be applied to all desired segments, or to be applied per desired segment if a function is passed
- Add defaults for all nested objects or arrays in WLED Client's context

### Changed
- **Breaking:** Rename `live` event to `live:leds` to be more specific with what exactly the live data is
- **Breaking:** Rename `startLiveStream` and `stopLiveStream` to `startLEDStream` and `stopLEDStream` respectively
- Update `turnOn`, `turnOff`, `toggle`, `setBrightness`, `set[Ordinal]Color`, `setEffect`, and `setPalette` to support specifically targeting one or more segments
- Update initialization procedure to properly emit errors and reject the `isReady` promise when a problem was encountered
- Update `updateState` method to properly emit and throw errors encountered when attempting the operation
- Update JSON API to be an event emitter and set WLED Client to relay error events
- Update JSON API to throw and emit a Fetch Response object if the response is not OK, allowing for fetch errors to be handled as you please
- Reconnect time for WS API is now 1 second
- Centralize client context updates
- WLED and WLED Client interfaces now match their defaults, so keys will be properly typed as possibly `undefined` while the device context has yet to be fetched
- Made examples easily executable and moved them to [their own repository](https://github.com/ShiftLimits/wled-client-examples) so as not to pollute dependencies
- Fix `info.syncToggleReceive` not being set correctly

## [0.12.0-0.3]- 2021-11-22
Getting close to feature parity with the 0.12.0 API.

### Added
- Add support for fetching presets to the JSON API
- Add `getPreset`, `savePreset`, `saveStateAsPreset`, and `deletePreset` methods for working with WLED presets
- Add `7-presets` example to demonstrate preset methods usage
- Add `deviceOptions` property which shows the `info.options` bit field value as a friendly object of booleans
- Add support for debug-only info properties which are filled in if your device is in debug mode
- Add reconnection logic for the websocket connection, controlled by passing `{ websocket: { reconnect: [true|false] }}` using client options
- Add ESM export for the browser environment so you can use it with the modern modules system now in most browsers

### Changed
- **Breaking:** Move `WLEDClient` from default export to a named export. This breaks import or require statements. Please change `import WLEDClient from 'wled-client'` to `import { WLEDClient } from 'wled-client'` and change `const WLEDClient = require('wled-client')` to `const { WLEDClient } = require('wled-client')`
- Update `turnOn`, `turnOff`, `toggle`, `setBrightness`, `set[Ordinal]Color`, `updateState`, and `updateSegment` methods to support some one-time state change properties, such as `transition` or `noSync`, which control the transition for the current method - for example turn on the lights over 100 seconds - or preventing the method from syncing to other devices respectively
- Key transforming between WLED and WLED Client APIs now uses wildcard to support transforming presets
- Device context properties (state, info, effects, and palettes) will now initialize with empty objects/arrays for better dev experience before context is loaded
- Follow `exports` package spec to properly target different environments
- Default export for browser environment is now in UMD format, allowing for it to be used in CJS-like module systems

## [0.12.0-0.2] - 2021-11-17
Continuing to flesh out the interface and patch bugs.

### Added
- Add `nightlight` object to client instance containing methods for controlling the nightlight feature
- Add `6-nightlight` example to demonstrate nightlight feature usage
- Add `setTransitionTime` method for control over the crossfade time between effects or colors
- Add `setMainSegmentId` method to change which segment is considered the main segment
- Add `ignoreLiveData` and `allowLiveData` methods to override when live display data is output by the device

### Changed
- Fix `update:context` event emitting WLED context instead of WLED Client context
- Fix `update:state` event emitting WLED state instead of WLED Client state
- Fix `update:info` event emitting WLED info instead of WLED Client info
- Use `Omit` instead of `Exclude` to remove keys from a type as expected

## [0.12.0-0.1] - 2021-11-16
Initial release!

### Added
- Add fully documented WLED JSON API typings
- Add fully documented WLED Client API typings
- Add WLED JSON API class for control of the device specifically via JSON over HTTP
- Add WLED WebSocket API class for realtime control and feedback of the device via WebSockets
- Add WLED Client class which offers simplified commands and a friendly interface equivalent to WLED's JSON API