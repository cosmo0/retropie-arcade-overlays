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
var templateGame = fs.readFileSync('import-template.cfg', { encoding: 'utf-8' });
var templateOverlay = fs.readFileSync('import-template-overlay.cfg', { encoding: 'utf-8' });

/*******************
* DEFINE PATHS
********************/

// defaults bezel to first one
var useFirstBezel = true;

// source folder of the overlays
var source = "tmp/source/";
//var source = "_sources/orionsangel/Mame/Artwork/";

// output for the rom config
var outputRom = "tmp/output/roms/";
//var outputRom = "overlays-orionsangel/roms/";

// output for the overlay
var outputOvl = "tmp/output/overlay/";
//var outputOvl = "overlays-orionsangel/configs/all/retroarch/overlay/arcade/";

/*******************
* PROCESS SOURCE
********************/

// get existing artworks
var files = fs.readdirSync(source);
files.forEach(function(file) {
    var game = file.replace('.zip', '');

    if (!file.endsWith('.zip')) { return; }

    console.log("########## PROCESSING " + file + " ##########");

    // initialize unzipper for this artwork
    var zip = new admzip(source + '/' + file);

    /*
    console.log("---------------- ZIP FILES ----------------");
    var zipEntries = zip.getEntries();
    zipEntries.forEach(function (zipEntry) {
        console.log("-- " + zipEntry.name);
    });
    */

    // parse the layout file
    parser.parseString((zip.readAsText('default.lay')), function (parseErr, layout) {
        if (parseErr) throw parseErr;

        /*
        console.log("---------------- LAYOUT ----------------");
        console.log(JSON.stringify(layout));
        // example:
        // {"mamelayout":{"$":{"version":"2"},"element":[{"$":{"name":"bezel"},"image":[{"$":{"file":"1942_bezel.png"}}]},{"$":{"name":"bezel_alt1"},"image":[{"$":{"file":"1942_bezel_alt1.png"}}]},{"$":{"name":"bezel_alt2"},"image":[{"$":{"file":"1942_bezel_alt2.png"}}]},{"$":{"name":"screen_bezel"},"image":[{"$":{"file":"vert_screen_bezel.png"}}]},{"$":{"name":"screen_mask"},"image":[{"$":{"file":"vert_screen_mask.png"}}]}],"view":[{"$":{"name":"Cab Artwork"},"screen":[{"$":{"index":"0"},"bounds":[{"$":{"x":"555","y":"0","width":"810","height":"1080"}}]}],"overlay":[{"$":{"element":"screen_mask"},"bounds":[{"$":{"x":"554","y":"0","width":"812","height":"1080"}}]}],"backdrop":[{"$":{"element":"screen_bezel"},"bounds":[{"$":{"x":"518","y":"0","width":"884","height":"1080"}}]}],"bezel":[{"$":{"element":"bezel"},"bounds":[{"$":{"x":"0","y":"0","width":"1920","height":"1080"}}]}]},{"$":{"name":"Cab Artwork (alt1)"},"screen":[{"$":{"index":"0"},"bounds":[{"$":{"x":"555","y":"0","width":"810","height":"1080"}}]}],"overlay":[{"$":{"element":"screen_mask"},"bounds":[{"$":{"x":"554","y":"0","width":"812","height":"1080"}}]}],"backdrop":[{"$":{"element":"screen_bezel"},"bounds":[{"$":{"x":"518","y":"0","width":"884","height":"1080"}}]}],"bezel":[{"$":{"element":"bezel_alt1"},"bounds":[{"$":{"x":"0","y":"0","width":"1920","height":"1080"}}]}]},{"$":{"name":"Unused (alt2)"},"screen":[{"$":{"index":"0"},"bounds":[{"$":{"x":"555","y":"0","width":"810","height":"1080"}}]}],"overlay":[{"$":{"element":"screen_mask"},"bounds":[{"$":{"x":"554","y":"0","width":"812","height":"1080"}}]}],"backdrop":[{"$":{"element":"screen_bezel"},"bounds":[{"$":{"x":"518","y":"0","width":"884","height":"1080"}}]}],"bezel":[{"$":{"element":"bezel_alt2"},"bounds":[{"$":{"x":"0","y":"0","width":"1920","height":"1080"}}]}]}]}}
        */

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
            if (element.$.name === view.bezel[0].$.element) {
                 return element.image[0].$.file;
            }
        })[0];
        
        console.log(game + ' image: ' + bezelFile);

        // get the screen position
        var screenPos = view.screen[0].bounds[0];

        // compute orientation
        var orientation = screenPos.width > screenPos.height ? "h" : "v";
        console.log(game + ' orientation: ' + orientation);

        // extract the bezel image
        console.log(game + ' extracting image...');
        var outputImage = outputOvl + '/' + game + '.png';
        if (fs.existsSync(outputImage)) {
            fs.unlinkSync(outputImage);
        }
        zip.extractEntryTo(bezelFile, outputOvl, false, true);
        fs.renameSync(outputOvl + '/' + bezelFile, outputImage);

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
                fs.writeFileSync(outputImage, bufferOptim);
                console.log(game + ' image optimized');

                // create the libretro cfg file for the overlay
                fs.writeFileSync(outputOvl + '/' + game + '.cfg', templateOverlay.replace('{{game}}', game));
                console.log(game + ' overlay config written');

                // create the libretro cfg file for the rom

                console.log(game + ' rom config written');
            });
        });
    });
});
