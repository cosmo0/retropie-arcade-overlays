var xml2js = require("xml2js");
var fs = require("fs");
var sharp = require("sharp");

var parser = new xml2js.Parser();

/*******************
* DEFINE PATHS
********************/

// source folder of the overlays
var source = "tmp/source/";
//var source = "_sources/orionsangel/Mame/";

// output for the rom config
var outputRom = "tmp/output/roms/";
//var outputRom = "roms/";

// output for the overlay
var outputOvl = "tmp/output/overlay/";
//var outputOvl = "configs/all/retroarch/overlay/arcade/";

/*******************
* PARSE SOURCE
********************/

// get existing config files
var files = fs.readdirSync(source + "/Cfg/");    
for (var f = 0; f < files.length; f++) {
    console.log("########## Reading " + files[f]);

    parser.parseString((fs.readFileSync(source + "/Cfg/" + files[f])), function(err, cfg) {
        console.log(cfg);

        // for each config, compute the screen position
        
        // unzip the corresponding artwork zip

        // get the list of possible views

        // if there are multiple views, ask the user which one to use

        // create the libretro cfg file for the rom

        // create the libretro cfg file for the overlay

        // make sure the overlay is resized to 1080p
    });
}
