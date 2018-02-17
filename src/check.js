/*
* Checks that the files are all correctly configured
*/

const fs = require('fs-extra');
const path = require('path');
const readlineSync = require('readline-sync');

let templateOverlay = fs.readFileSync('src/import-template-overlay.cfg', { encoding: 'utf-8' });

// check all packs
let packs = fs.readdirSync('.').filter(dir => dir.startsWith('overlays-'));
for (let pack of packs) {
    console.log('');
    console.log('');
    console.log('========== PACK %s ==========', pack);

    let templateRom = fs.readFileSync('src/import-template-game-' + pack.replace('overlays-', '') + '.cfg', { encoding: 'utf-8' });
    let romsFolder = path.join(pack, 'roms');
    let overlaysFolder = path.join(pack, 'configs/all/retroarch/overlay/arcade');

    let usedOverlays = [];

    console.log('===== Checking roms =====');

    let romsFiles = fs.readdirSync(romsFolder).filter(file => file.endsWith('.cfg') && !file.startsWith('_'));
    for (let romFile of romsFiles) {
        // get overlay file path
        let cfgContent = fs.readFileSync(path.join(romsFolder, romFile), { encoding: 'utf-8' });
        let overlayFile = /input_overlay[\s]*=[\s]*(.*\.cfg)/igm.exec(cfgContent)[1]; // extract overlay path
        overlayFile = overlayFile.substring(overlayFile.lastIndexOf('/')); // just the file name
        let packOverlayFile = path.join(overlaysFolder, overlayFile); // concatenate with pack path
    
        usedOverlays.push(overlayFile);

        // check that the overlay file exists
        if (!fs.existsSync(packOverlayFile)) {
            console.log('> Overlay %s for rom %s does not exist', packOverlayFile, romFile);
            readlineSync.keyInPause();
        }
    }

    console.log('%i roms processed', romsFiles.length);

    console.log('');
    console.log('===== Checking overlays =====');

    let overlaysFiles = fs.readdirSync(overlaysFolder).filter(file => file.endsWith('.cfg') && !file.startsWith('_'));
    for (let overlayFile of overlaysFiles) {
        // get image file name
        let overlayContent = fs.readFileSync(path.join(overlaysFolder, overlayFile), { encoding: 'utf-8' });
        let overlayImage = /overlay0_overlay[\s]*=[\s]*"?(.*\.png)"?/igm.exec(overlayContent)[1]

        // check that the image exists
        if (!fs.existsSync(path.join(overlaysFolder, overlayImage))) {
            console.log('> Image file %s for overlay %s does not exist', overlayImage, overlayFile);
            readlineSync.keyInPause();
        }

        // check that a rom config uses this overlay
        if (!usedOverlays.indexOf(overlayFile)) {
            console.log('> Overlay %s is not used by any rom config');
            if (readlineSync.keyInYNStrict('Do you wish to create it?')) {
                fs.writeFileSync(
                    path.join(romsFolder, overlayFile.replace('.cfg', '.zip.cfg')),
                    templateRom.replace('{{game}}', overlayFile.replace('.cfg', '')));
            }
        }
    }

    console.log('%i overlays processed', overlaysFiles.length);
}
