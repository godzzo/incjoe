/*
 */

'use strict'

const fs = require('fs');
const mustache = require('mustache');
const ejs = require('ejs');
const DomParser = require('dom-parser');

const parser = new DomParser();

const ctx = {
    templates: {},
    js: {},
    css: {}
};

let config = {
    templateEngine: 'mustache'
};

if ( fs.existsSync('./config.json') ) {
    config = JsonFromFile ('./config.json');
}

function ParseFile(inPath, outPath) {
    let full = LoadFile(inPath, undefined, ParseIncludeTag, ParseInclude, 'include');

    fs.writeFileSync(outPath, full);

    full = LoadFile(outPath, undefined, ParseLaterTag, ParseLater, 'later');

    full = LateParse(full);

    fs.writeFileSync(outPath, full);
}

function LateParse(content) {
    content = content.replace(
        '<script id="templates"></script>', 
        `<script id="templates"> window.templates = ${ JSON.stringify(ctx.templates) }; </script>`
    );
    
    return content;
}

function ParseLater(filePath, pel) {
    
    let content = [];

    if (pel.name == 'script') {
        for (const tname in ctx.js) {
            console.log(`LATER JS TAG ${tname}.`);
            const tag = ctx.js[tname];
            content.push(`<script src="${ tag.src }"></script>`);
        }
    } else if (pel.name == 'css') {
        for (const tname in ctx.css) {
            console.log(`LATER CSS TAG ${tname}.`);
            const tag = ctx.css[tname];
            content.push(`<link rel="stylesheet" href="${ tag.href }">`);
        }
    } else {
        console.error(`Unknown later.name ( ${pel.name} ) !`);
    }

    console.log(`LATER ${pel.name}:`, content);

    return content.join("\n");
}

function ParseLaterTag(el) {
    const name = el.getAttribute("name");
    
    return {name};
}

function ParseIncludeTag(el) {
    const src = el.getAttribute("src");
    const data = el.getAttribute("data");
    const parms = el.getAttribute("parms");
    const name = el.getAttribute("name");
    const engine = el.getAttribute("engine");

    const inner = el.innerHTML;

    return {src, data, parms, name, inner, engine};
}

function LoadFile(filePath, json, parseTag, fnc, tagName='include', templateEngine) {
    if ( ! templateEngine ) {
        templateEngine = config.templateEngine;
    }

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

        const parsedEl = parseTag(el);

        console.log( 'attrs', parsedEl );

        content.push( fnc(filePath, parsedEl) );
        
        text = text.substring(after + endTag.length);
    }

    if (text.length > 0) {
        content.push( text );
    }

    let html = content.join("");

    html = ReplaceKeys(html, json, templateEngine);

    return html;
}

function ReadContent(filePath) {
    let content;

    if ( filePath.startsWith('inner:') ){

        content = filePath.substring('inner:'.length);
    } else {

        content = fs.readFileSync(filePath).toString();

        const laterJsPath = filePath.replace(/\.html/gi, '-later-js.json')
        const laterCssPath = filePath.replace(/\.html/gi, '-later-css.json')

        if (filePath.endsWith('.html')) {
            console.log(`Check LaterJS ${ laterJsPath } : ${ fs.existsSync(laterJsPath) }`);
            console.log(`Check LaterJS ${ laterCssPath } : ${ fs.existsSync(laterCssPath) }`);

            if (fs.existsSync(laterJsPath)) {
                const jsLater = JsonFromFile(laterJsPath);

                for (const jsli of jsLater) {
                    if (!jsli.name) jsli.name = jsli.src;
                    ctx.js[jsli.src] = jsli;
                }
            }

            if (fs.existsSync(laterCssPath)) {
                const cssLater = JsonFromFile(laterCssPath);

                for (const cssli of cssLater) {
                    if (!cssli.name) cssli.name = cssli.href;
                    ctx.css[cssli.href] = cssli;
                }
            }
        }
    }

    return content;
}

function ParseInclude(filePath, pel) {
    let jsonData = {};
    let parmsObj = {};

    if (!pel.src || pel.src == null) {
        pel.src = 'inner:' + pel.inner;
    } else {
        pel.name = pel.src;
    }

    if (pel.parms) {
        const keyVals = pel.parms.split(/;/g);

        for (const keyVal of keyVals) {
            const keyTags = keyVal.split(/\:/g);

            parmsObj[ keyTags[0] ] = keyTags[1];
        }
    }

    if (pel.data && pel.data != null) {
        jsonData = JsonFromFile (pel.data);
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
            json.template = pel.name;
            json._position = i;
            json._time = new Date().getTime();

            ctx.templates[pel.name] = escape( ReadContent(pel.src) );

            content = LoadFile(pel.src, json, ParseIncludeTag, ParseInclude, 'include', pel.engine);

            contents.push(content);
        }

        content = contents.join('');
    } else {

        // jsonData.parms = parmsObj;
        const json = Object.assign(jsonData, parmsObj);
        json.config = config;
        json.template = pel.name;
        json._time = new Date().getTime();

        ctx.templates[pel.name] = escape( ReadContent(pel.src) );

        content = LoadFile(pel.src, json, ParseIncludeTag, ParseInclude, 'include', pel.engine);
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

function ReplaceKeys(content, data, templateEngine) {
    if (data) {
        let rendered;

        if (templateEngine == "mustache") {
            rendered = mustache.render(content, data);
        } else if (templateEngine == "ecma") {
            rendered = eval('`' + content + '`');
        } else if (templateEngine == "ejs") {
            rendered = ejs.render(content, data);
        }
        
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
    LateParse,
    ParseFile
};
