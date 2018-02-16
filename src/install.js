const fs = require('fs-extra');
const path = require('path');
const process = require('process');
const readlineSync = require('readline-sync');

// TODO: handle SAMBA shares

console.log('=== Overlay pack installer ===');

/**
 * Checks that the specified folder can be read, and possibly written to.
 * 
 * @param {String} folder The folder to check
 * @param {Boolean} checkWrite Whether to try to write into
 */
var checkAccess = function checkAccess (folder, checkWrite) {
    try {
        fs.ensureDirSync(folder);
    } catch (err) {
        console.error('The folder %s does not exist or cannot be read, and cannot be created!', folder);
        console.log('Exiting...');
        process.exit(1);
    }

    if (fs.existsSync(folder)) {
        if (checkWrite) {
            var testFile = path.join(folder, '_test-install.txt');
            try {
                fs.writeFileSync(testFile, 'test');
                if (fs.existsSync(testFile)) {
                    fs.unlinkSync(testFile);
                } else {
                    console.error('Unable to write files into the folder %s!', folder);
                    console.log('Exiting...');
                    process.exit(2);
                }
            } catch (err) {
                console.error('Unable to write files into the folder %s: %o', folder, err);
                console.log('Exiting...');
                process.exit(2);
            }

            console.log('%s can be written to', folder);
        } else {
            console.log('%s can be read', folder);
        }
    } else {
        console.error('The folder %s does not exist or cannot be read!', folder);
        console.log('Exiting...');
        process.exit(1);
    }
}

// ask the user which overlay package they want
console.log('');
console.log('1) Which overlay pack do you wish to install?');

// list overlay packages
var packs = fs.readdirSync('.').filter(folder => folder.startsWith('overlays-'));
for (let p of packs) {
    console.log('- ' + p);
}

var pack = readlineSync.question('Type your choice: overlays-');
pack = 'overlays-' + pack;

checkAccess(pack, false);

// ask the path to the roms
console.log('');
console.log('2) Where are you arcade roms located?');
console.log('(ex: /Volumes/roms/mame-libretro)');
var roms = readlineSync.question('Path to the roms: ');

checkAccess(roms, true);

// ask the path to retropie config folder
console.log('');
console.log('3) How can I access the retropie shared config folder?')
console.log('(ex: /Volumes/configs/)')
var configsShare = readlineSync.question('Path to the configs: ');
var configs = path.join(configsShare, 'all/retroarch/overlay/arcade');

checkAccess(configs, true);

// ask whether to overwrite files if any
console.log('');
console.log('4) Do you wish to overwrite existing configs, if any?');
var overwrite = [ 'y', 'yes', 'true', '1' ].indexOf(readlineSync.question('y/N: ').toLowerCase()) >= 0;

// list the available rom configs
console.log('');
console.log('=== COPYING FILES ===');
var availableConfigs = fs.readdirSync(path.join(pack, 'roms'));
for (let cfg of availableConfigs) {
    // only process config files
    if (!cfg.endsWith('.cfg')) {
        continue;
    }

    let zip = cfg.replace('.cfg', '');
    let overlay = cfg.replace('.zip', '');

    console.log('--- Processing %s', cfg);

    // check if the matching rom exists
    if (!fs.existsSync(path.join(roms, zip))) {
        console.log('### rom does not exist, skipping ###');
        continue;
    }

    // copy the rom config
    if (overwrite || !fs.existsSync(path.join(roms, cfg))) {
        console.log('copy rom config');
        fs.copyFileSync(path.join(pack, 'roms', cfg), path.join(roms, cfg));
    }

    // read the rom config to get the overlay instead of hard-coding it
    let romContent = fs.readFileSync(path.join(pack, 'roms', cfg), { encoding: 'utf-8' });
    let overlayPath = /input_overlay[\s]*=[\s]*(.*\.cfg)/igm.exec(romContent)[1]; // extract overlay path
    overlayPath = overlayPath.substring(overlayPath.lastIndexOf('/')); // just the file name
    overlayPath = path.join(pack, 'configs/all/retroarch/overlay/arcade/', overlayPath); // concatenate with pack path

    if (fs.existsSync(overlayPath)) {
        // copy the overlay config
        if (overwrite || !fs.existsSync(path.join(configs, overlay))) {
            console.log('copy overlay config');
            fs.copyFileSync(overlayPath, path.join(configs, overlay));
        }

        // get the overlay image file name
        let overlayContent = fs.readFileSync(overlayPath, { encoding: 'utf-8' });
        let overlayFile = /overlay0_overlay[\s]*=[\s]*(.*\.png)/igm.exec(overlayContent)[1]

        // copy the overlay image
        if (overwrite || !fs.existsSync(path.join(configs, overlayFile))) {
            console.log('copy overlay image');
            fs.copyFileSync(overlayPath, path.join(configs, overlayFile));
        }
    } else {
        console.error('Overlay config not found: ' + overlayPath);
        process.exit(1);
    }
}

console.log('All roms configs have been copied');

// copy common config if any
var commonCfg = path.join(pack, 'configs/all/retroarch/overlay_cfg');
if (fs.existsSync(commonCfg)) {
    console.log('');
    console.log('=== COPYING COMMON CONFIGS ===')

    // check if folder exists on the share
    let shareCommonCfg = path.join(configsShare, 'all/retroarch/overlay_cfg');
    fs.ensureDirSync(shareCommonCfg);

    // copy common config files
    let commonCfgFiles = fs.readdirSync(commonCfg);
    for (let cfg of commonCfgFiles) {
        if (overwrite || !fs.existsSync(path.join(shareCommonCfg, cfg))) {
            console.log('Copy ' + cfg);
            fs.copyFileSync(path.join(commonCfg, cfg), path.join(shareCommonCfg, cfg));
        }
    }

    console.log('Common configs have been copied');
}

// copy shaders
console.log('');
console.log('=== COPYING SHADERS ===');
var shaders = path.join(pack, 'configs/all/retroarch/shaders');
var shareShaders = path.join(configsShare, 'all/retroarch/shaders');
fs.copySync(shaders, shareShaders, { overwrite: overwrite });
console.log('Shaders have been copied');