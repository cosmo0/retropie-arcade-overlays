var fs = require('fs');
var path = require('path');

// the folder with the overlays to check
var overlaysFolder = "overlays-artworks/configs/all/retroarch/overlay/arcade/";

// the folder with the rom configs to create
var romsFolder = "overlays-artworks/roms/";

// rom config template
var template = fs.readFileSync('src/import-template-game-fullscreen.cfg', { encoding: 'utf-8' });

// for each overlay, create a rom config if it doesn't exist yet
fs.readdir(overlaysFolder, function(err, files) {
    if (err) throw err;

    for (let file of files) {
        // process only cfg files
        if (!file.endsWith('.cfg')) {
            continue;
        }

        console.log('###### Processing ' + file);

        var game = file.replace('.cfg', '');
        var romcfg = path.join(romsFolder, game + '.zip.cfg');

        if (!fs.existsSync(romcfg)) {
            console.log('> CREATE');
            fs.writeFileSync(romcfg, template.replace('{{game}}', game));
        } else {
            console.log('OK');
        }
    }
});