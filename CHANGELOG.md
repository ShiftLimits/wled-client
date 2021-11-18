# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
Nothing yet.

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