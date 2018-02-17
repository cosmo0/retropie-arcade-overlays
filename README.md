# Retropie arcade overlays pack

Overlays (or bezels) are images added "above" the emulator, to mask the black borders around the image.

This pack adds overlays for arcade games.

**Usage of the pack in a commercial product is strictly forbidden.**

## Credits

Please see [credits](CREDITS.md) to check out the awesome original packs I picked from.  
I did mostly nothing except move files around and mess with config files. If you think these overlays are good, please go thank the original authors.

If one of your file is here and you want me to remove it, or want to be credited, please [file an issue](https://github.com/cosmo0/retropie-arcade-overlays/issues).

## Contents

Compilation of arcade overlays for many games.

### [Realistic overlays](overlays-realistic/) (510 games)

Mix between [John Merit](https://forums.libretro.com/t/arcade-overlays/4084/), [OrionsAngel](https://www.youtube.com/orionsangel) and [Derek Moore](https://www.youtube.com/user/oldstarscream) works.

Makes your TV look like you're in front of an arcade cabinet. They have screen glare included in the overlay, and are configured to run with a scanline + curvature shader (zfast_crt_curve).

Orions Angel's overlays are configured to run at 720p, because at 1080p, with the shaders, some game are quite slow.  
John Merit are still configured to run at 1080p, because they were already configured like that when I got them, and I don't want to spend hours changing them.

### [Artwork overlays](overlays-artworks/) (784 games)

Mix between [Mamehead](https://forums.libretro.com/t/arcade-overlays/4084/284), [Derek Moore](https://www.youtube.com/user/oldstarscream), [UDb23](https://github.com/UDb23/rpie-ovl) and [Simbz33](https://github.com/simbz33/retropie-overlay) creations and compilations.

Artwork or fanart images around the game area, to maximize it, and just cover the black border around with an image. Sometimes it's inspired from the artwork on the real cabinet, sometimes it's completely custom-made.

## Requirements

- A Raspberry Pi 3 - not tested on another hardware, but there's no reason it shouldn't work.
- Retropie 4.3 - not tested on another version.
- A 16:9 screen in 1080p. This pack will be wrong in any other resolution. And it's useless on a 4:3 screen, since you don't have black borders.

## Installation

- Open the `configs` shared folder on you retropie installation (`\\retropie\configs\` on Windows, `smb://retropie/configs` on Mac)
- **Recommended:** backup the folder content!
- Copy the content of the `configs` folder from the chosen overlay into the share, and overwrite the files there.
- Copy the contents of the `roms` folder alongside your roms.
