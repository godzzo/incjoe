/*
 */

'use strict'

const fs = require('fs');
const mustache = require('mustache');
const DomParser = require('dom-parser');

const parser = new DomParser();

let config = {};

if ( fs.existsSync('./config.json') ) {
    config = JsonFromFile ('./config.json');
}

function LoadFile(filePath, json, tagName='include') {
    let text = ReadContent(filePath);

    const beginTag = `<${tagName}`;
    const endTag = `</${tagName}>`;

    const content = [];

    while (text.indexOf(beginTag) > -1) {
        const pos = text.indexOf(beginTag);
    
        content.push( text.substring(0, pos) );
    
        text = text.substring(pos);
    
        const after = text.indexOf(endTag);
    
        const incTag = text.substring(0, after + endTag.length);

        console.log( 'PARSE', incTag );

        const dom = parser.parseFromString(incTag);

        const el = dom.getElementsByTagName(tagName)[0];

        const src = el.getAttribute("src");
        const data = el.getAttribute("data");
        const parms = el.getAttribute("parms");
        const inner = el.innerHTML;

        console.log( 'attrs', {data, src, parms, inner} );

        content.push( ParseInclude(src, data, parms, inner, filePath) );
        
        text = text.substring(after + endTag.length);
    }

    if (text.length > 0) {
        content.push( text );
    }

    let html = content.join("");

    html = ReplaceKeys(html, json);

    return html;
}

function ReadContent(filePath) {
    if ( filePath.startsWith('inner:') ){

        return filePath.substring('inner:'.length);
    } else {

        return fs.readFileSync(filePath).toString();
    }
}

function ParseInclude(src, data, parms, inner, filePath) {
    let jsonData = {};
    let parmsObj = {};

    if (!src || src == null) {
        src = 'inner:' + inner;
    }

    if (parms) {
        const keyVals = parms.split(/;/g);

        for (const keyVal of keyVals) {
            const keyTags = keyVal.split(/\:/g);

            parmsObj[ keyTags[0] ] = keyTags[1];
        }
    }

    if (data && data != null) {
        jsonData = JsonFromFile (data);
    }

    let content;

    if (Array.isArray(jsonData)) {
        const contents = [];

        for (const jsonItem of jsonData) {
            // jsonItem.parms = parmsObj;
            const json = Object.assign(jsonItem, parmsObj);
            json.config = config;
            json.template = filePath;

            content = LoadFile(src, json);

            contents.push(content);
        }

        content = contents.join('');
    } else {

        // jsonData.parms = parmsObj;
        const json = Object.assign(jsonData, parmsObj);
        json.config = config;
        json.template = filePath;

        content = LoadFile(src, json);
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
