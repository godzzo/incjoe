/*
 */

'use strict'

const ParseFile = require('./util_common.js').ParseFile;

let inPath, outPath;

if (process.argv.length > 3) {
    inPath = process.argv[2];
    outPath = process.argv[3];
} else {
    inPath = "bstrap/tp_album.html";
    outPath = "bstrap/album.html";
}

(async () => {
	await ParseFile(inPath, outPath);
})();
