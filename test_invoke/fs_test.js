
'use strict'

const fs = require('fs');

function ReadText(parms, ctx) {
    if (parms.fileName) {
        return fs.readFileSync(parms.fileName);
    } else {
        return "";
    }
}

module.exports = {
    ReadText
};