# Retropie arcade overlays pack

Overlays (or bezels) are images added "above" the emulator, to mask the black borders around the image.

This pack adds overlays for arcade games.

**Usage of the pack in a commercial product is strictly forbidden.**

## Credits

Please see [credits](CREDITS.md) to check out the awesome original packs I picked from.  
I did mostly nothing except move files around and mess with config files.

## Contents

Compilation of arcade overlays for many games.

- [overlays-johnmerit](overlays-johnmerit/) : realistic overlays made by John Merit - 228 games configured
- [overlays-orionsangel](overlays-orionsangel/) : realistic overlays made by OrionsAngel - 342 games configured
- [overlays-artworks](overlays-artworks/) : artwork overlays compiled by mamehead - 90 games configured

## Requirements

- A Raspberry Pi 3 - not tested on another hardware, but there's no reason it shouldn't work.
- Retropie 4.3 - not tested on another version.
- A 16:9 screen in 1080p. This pack will be wrong in any other resolution. And it's useless on a 4:3 screen, since you don't have black borders.

## Installation

- Open the `configs` shared folder on you retropie installation (`\\retropie\configs\` on Windows, `smb://retropie/configs` on Mac)
- **Recommended:** backup the folder content!
- Copy the content of the `configs` folder from the chosen overlay into the share, and overwrite the files there.
- Copy the contents of the `roms` folder alongside your roms.

## Tools

https://github.com/JamieMason/ImageOptim-CLI