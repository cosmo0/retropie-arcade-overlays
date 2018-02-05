var fs = require('fs');
var child_process = require('child_process');
var readlineSync = require('readline-sync');

// output folder
console.log('Please enter the folder to optimize (artworks, johnmerit, orionsangel...):');
var folder = readlineSync.question('overlays-');
folder = 'overlays-' + folder;

if (fs.existsSync(folder)) {
    folder += "/configs/all/retroarch/overlay/arcade/";

    console.log('Optimizing ' + folder + '...');

    // optimize the images
    child_process.execFileSync('node_modules/.bin/imageOptim', [ '-a', '-s', '-d', folder ]);
}
