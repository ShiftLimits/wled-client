# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Removed
- Remove `info.leds.pin` as it is no longer available in WLED 0.13.0
- Remove `state.presetCycle` as it is no longer available in WLED 0.13.0, use playlists instead
- Remove `state.nightlight.fade` as it is no longer available in WLED 0.13.0, use `state.nightlight.mode` instead

## [0.12.0-0.1] - 2021-11-16
Initial release!

### Added
- Add fully documented WLED JSON API typings
- Add fully documented WLED Client API typings
- Add WLED JSON API class for control of the device specifically via JSON over HTTP
- Add WLED WebSocket API class for realtime control and feedback of the device via WebSockets
- Add WLED Client class which offers simplified commands and a friendly interface equivalent to WLED's JSON API