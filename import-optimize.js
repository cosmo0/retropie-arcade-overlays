var child_process = require('child_process');

// output folder
var output = "overlays-orionsangel/configs/all/retroarch/overlay/arcade/"

// optimize the images
child_process.execFileSync('node_modules/.bin/imageOptim', [ '-a', '-s', '-d', output ]);
