/*
 */

'use strict'

const fs = require('fs');
const mustache = require('mustache');

function LoadFile(filePath, json) {
    let text = fs.readFileSync(filePath).toString();

    const content = [];

    while (text.indexOf('<include src="') > -1) {
        const pos = text.indexOf('<include src="');
    
        content.push( text.substring(0, pos) );
    
        text = text.substring(pos + 14);
    
        const after = text.indexOf('></include>');
    
        const incTag = text.substring(0, after);
    
        const incParms = incTag.replace(/"/g, '').replace(/ data=/g, ' ');
        const parms = incParms.split(/ /g);
    
        console.log( '[' + parms[0] + ':' + parms[1] + ']' );
    
        content.push( ParseInclude(parms[0], parms[1]) );

        text = text.substring(after + 11);
    }

    if (text.length > 0) {
        content.push( text );
    }

    let html = content.join("\n");

    html = ReplaceKeys(html, json);

    return html;
}

function ParseInclude(src, data) {
    let jsonData = {};

    if (data) {
        jsonData = JsonFromFile (data);
    }

    let content;

    if (Array.isArray(jsonData)) {
        const contents = [];

        for (const jsonItem of jsonData) {
            content = LoadFile(src, jsonItem);

            contents.push(content);
        }

        content = contents.join('\n');
    } else {

        content = LoadFile(src, jsonData);
    }

    return content;
}

function JsonFromFile (filePath) {
    const text = fs.readFileSync(filePath).toString();
    let data = null;

    try {

        data = JSON.parse(text);
    } catch (e) {
        
        console.error(`Problem with file: ${filePath}`, e);

        throw e;
    }

    return data;
}

function ReplaceKeys(content, jsonData) {
    if (jsonData) {

        const rendered = mustache.render(content, jsonData);
        
        return rendered;
    } else {

        return content;
    }
}

module.exports = {
    LoadFile,
    ParseInclude,
    ReplaceKeys,
    JsonFromFile
};
