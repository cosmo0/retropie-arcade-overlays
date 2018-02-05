var fs = require('fs');
var path = require('path');
var process = require('process');

var readlineSync = require('readline-sync');

/*
    TODO
    - copy common files :
        - shaders
        - _common/h/v.cfg
        - generic overlays
    - handle samba shares
*/

console.log('=== Overlay pack installer ===');

/**
 * Checks that the specified folder can be read, and possibly written to.
 * 
 * @param {String} folder The folder to check
 * @param {Boolean} checkWrite Whether to try to write into
 */
var checkAccess = function checkAccess (folder, checkWrite) {
    if (fs.existsSync(folder)) {
        if (checkWrite) {
            var testFile = path.join(folder, '_test-overlay-install.txt');
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
var configs = readlineSync.question('Path to the configs: ');
configs = path.join(configs, 'all/retroarch/overlay/arcade');

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

    // TODO: read the rom config to get the overlay instead of hard-coding it

    let overlayPath = path.join(pack, 'configs/all/retroarch/overlay/arcade/');
    if (fs.existsSync(path.join(overlayPath, overlay))) {
        // copy the overlay config
        if (overwrite || !fs.existsSync(path.join(configs, overlay))) {
            console.log('copy overlay config');
            fs.copyFileSync(path.join(overlayPath, overlay), path.join(configs, overlay));
        }

        // get the overlay image file name
        var overlayContent = fs.readFileSync(path.join(overlayPath, overlay), { encoding: 'utf-8' });
        var overlayFile = /overlay0_overlay[\s]*=[\s]*(.*\.png)/igm.exec(overlayContent)[1]

        // copy the overlay image
        if (overwrite || !fs.existsSync(path.join(configs, overlayFile))) {
            console.log('copy overlay image');
            fs.copyFileSync(path.join(overlayPath, overlayFile), path.join(configs, overlayFile));
        }
    } else {
        console.log('generic overlay');
    }
}
