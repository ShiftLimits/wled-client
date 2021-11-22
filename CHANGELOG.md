# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
Nothing yet.

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