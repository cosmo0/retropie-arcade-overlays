var fs = require("fs");

var readlineSync = require("readline-sync");
var xml2js = require("xml2js");
var sharp = require("sharp");
var admzip = require("adm-zip");
var imagemin = require("imagemin");

/*******************
* Initialize objects
********************/

// xml parser
var parser = new xml2js.Parser();

// config template
var templateGame = fs.readFileSync('import-template-game.cfg', { encoding: 'utf-8' });
var templateOverlay = fs.readFileSync('import-template-overlay.cfg', { encoding: 'utf-8' });

/*******************
* DEFINE PATHS
********************/

// defaults bezel to first one
var useFirstBezel = true;


// source folder of the overlays
var source = "_sources/orionsangel/Mame/Artwork/";
// output for the rom config
var outputRom = "overlays-orionsangel/roms/";
// output for the overlay
var outputOvl = "overlays-orionsangel/configs/all/retroarch/overlay/arcade/";


/*
// source folder of the overlays
var source = "tmp/source/";
// output for the rom config
var outputRom = "tmp/output/roms/";
// output for the overlay
var outputOvl = "tmp/output/overlay/";
*/

/*******************
* PROCESS SOURCE
********************/

// whether to overwrite existing files
var overwrite = "x";
while (overwrite.toLowerCase() != "y" && overwrite.toLowerCase() != "n") {
    overwrite = readlineSync.question('Do you wish to overwrite existing files ? (y/n): ');
}
overwrite = (overwrite == "y");

// get existing artworks
var files = fs.readdirSync(source);
files.forEach(function(file) {
    var game = file.replace('.zip', '');

    if (!file.endsWith('.zip')) { return; }

    console.log("########## PROCESSING " + file + " ##########");

    // initialize unzipper for this artwork
    var zip = new admzip(source + '/' + file);

    // parse the layout file
    parser.parseString((zip.readAsText('default.lay')), function (parseErr, layout) {
        if (parseErr) throw parseErr;

        var view;

        // if there are multiple views, ask the user which one to use
        if (!useFirstBezel && layout.mamelayout.view.length > 1) {
            console.log('----------------');
            console.log('Please choose which bezel you want:');
            for (var v = 0; v < layout.mamelayout.view.length; v++) {
                console.log(v + ': ' + layout.mamelayout.view[v].$.name  + ' (bezel name: ' + layout.mamelayout.view[v].bezel[0].$.element + ')');
            }
            console.log('');
            var chosenView = "x";
            while (isNaN(chosenView)) {
                chosenView = readlineSync.question('Bezel to use: ');
            }
            view = layout.mamelayout.view[Number(chosenView)];
        } else {
            view = layout.mamelayout.view[0];
        }

        // get bezel file name
        var bezelFile = layout.mamelayout.element.map(function(element, idx) {
            for (var b = 0; b < view.bezel.length; b++) {
                if (element.image && element.$.name === view.bezel[b].$.element) {
                    return element.image[0].$.file;
                }
            }
        })[0];
        
        console.log(game + ' image: ' + bezelFile);

        // get the screen position
        var screenPos = view.screen[0].bounds[0].$;

        // compute orientation
        var orientation = screenPos.width > screenPos.height ? "h" : "v";
        console.log(game + ' orientation: ' + orientation);

        // extract the bezel image
        console.log(game + ' extracting image...');
        var outputImage = outputOvl + '/' + game + '.png';
        if (overwrite && fs.existsSync(outputImage)) {
            fs.unlinkSync(outputImage);
        }

        if (overwrite || !fs.existsSync(outputImage)) {
            zip.extractEntryTo(bezelFile, outputOvl, false, true);
            fs.renameSync(outputOvl + '/' + bezelFile, outputImage);
        }

        // process the bezel image
        console.log(game + ' processing image...');
        var img = sharp(outputImage);
        img.metadata()
        .then(function(meta) {
            // make sure the image is resized in 1080p
            if (meta.width > 1920 || meta.height > 1080) {
                console.log(game + ' resizing the image...');
                return img
                    .resize(1920, 1080)
                    .crop(sharp.strategy.center)
                    .toBuffer();
            }
            
            console.log(game + ' image is OK');
            return img.toBuffer();
        }).then(function (buffer) {
            // optimize the file to reduce the size
            console.log(game + ' optimizing the image...');
            imagemin.buffer(buffer)
            .then(function(bufferOptim) {
                // save the overlay file
                if (overwrite || !fs.existsSync(outputImage)) {
                    fs.writeFileSync(outputImage, bufferOptim);
                    console.log(game + ' image optimized');
                }

                // create the libretro cfg file for the overlay
                var outputOvlFile = outputOvl + '/' + game + '.cfg';
                if (overwrite || !fs.existsSync(outputOvlFile)) {
                    fs.writeFileSync(outputOvlFile, templateOverlay.replace('{{game}}', game));
                    console.log(game + ' overlay config written');
                }

                // create the libretro cfg file for the rom
                var outputRomFile = outputRom + '/' + game + '.zip.cfg';
                if (overwrite || !fs.existsSync(outputRomFile)) {
                    var gameConfig = templateGame.replace('{{orientation}}', orientation)
                        .replace('{{game}}', game)
                        .replace('{{width}}', screenPos.width)
                        .replace('{{height}}', screenPos.height)
                        .replace('{{x}}', screenPos.x)
                        .replace('{{y}}', screenPos.y);
                    fs.writeFileSync(outputRomFile, gameConfig);
                    console.log(game + ' rom config written');
                }
            });
        });
    });
});
