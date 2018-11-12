/*
 */

'use strict'

const fs = require('fs');
const mustache = require('mustache');
const DomParser = require('dom-parser');

const parser = new DomParser();

const ctx = {
    templates: {}
};

let config = {};

if ( fs.existsSync('./config.json') ) {
    config = JsonFromFile ('./config.json');
}

function LateParse(content) {
    content = content.replace(
        '<script id="templates"></script>', 
        `<script id="templates"> window.templates = ${ JSON.stringify(ctx.templates) }; </script>`
    );
    
    return content;
}

function LoadFile(filePath, json, fnc, tagName='include') {
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
        const name = el.getAttribute("name");
        const inner = el.innerHTML;

        // console.log( 'attrs', {data, src, parms, inner, name} );

        content.push( fnc(src, data, parms, inner, filePath, name) );
        
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
    let content;

    if ( filePath.startsWith('inner:') ){

        content = filePath.substring('inner:'.length);
    } else {

        content = fs.readFileSync(filePath).toString();
    }

    return content;
}

function ParseInclude(src, data, parms, inner, filePath, name) {
    let jsonData = {};
    let parmsObj = {};

    if (!src || src == null) {
        src = 'inner:' + inner;
    } else {
        name = src;
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

        let i= 0;

        for (const jsonItem of jsonData) {
            i++;
            // jsonItem.parms = parmsObj;
            const json = Object.assign(jsonItem, parmsObj);
            json.config = config;
            json.template = name;
            json._position = i;
            json._time = new Date().getTime();

            ctx.templates[name] = escape( ReadContent(src) );

            content = LoadFile(src, json, ParseInclude);

            contents.push(content);
        }

        content = contents.join('');
    } else {

        // jsonData.parms = parmsObj;
        const json = Object.assign(jsonData, parmsObj);
        json.config = config;
        json.template = name;
        json._time = new Date().getTime();

        ctx.templates[name] = escape( ReadContent(src) );

        content = LoadFile(src, json, ParseInclude);
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
    JsonFromFile,
    LateParse
};
