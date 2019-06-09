/*
 */

'use strict'

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const ejs = require('ejs');
const DomParser = require('dom-parser');

const parser = new DomParser();

function InitContext(inPath, parms, rootPath, extra) {
	console.log("InitContext, extra", JSON.stringify(extra, null, 4));

    let ctx = {
        templates: {},
        js: {},
		css: {},
		data: {},
		content: {},
        parms: parms,
        rootPath
    };
    
    let config = {
        templateEngine: 'mustache',
        printFragmentBlock: true
    };
    
    const dirPath = path.dirname(inPath);

    if ( fs.existsSync(`${dirPath}/config.json`) ) {
        const cfg = JsonFromFile (`${dirPath}/config.json`);

        Object.assign(config, cfg);
    }
    
    ctx.config = config;

	ctx = Object.assign(ctx, extra);

	console.log("InitContext, ctx", JSON.stringify(ctx, null, 4));

    return ctx;
}

async function ParseFile(inPath, outPath, parms, rootPath='.', onDemand=false, extra={}) {

    const ctx = InitContext(inPath, parms, rootPath, extra);

    let full = await LoadFile(inPath, undefined, ParseIncludeTag, ParseInclude, 'include', undefined, ctx);

    full = await LoadFile('inner:' + full, undefined, ParseLaterTag, ParseLater, 'later', undefined, ctx);

    full = LateParse(full, ctx);

	if (!onDemand) {
		fs.writeFileSync(outPath, full);
	} else {
		return full;
	}
}

async function InvokeContent(path, ctx) {
    const full = await LoadFile(path, undefined, ParseInvokeTag, ParseInvoke, 'invoke', undefined, ctx);

    return full;
}

function LateParse(content, ctx) {
    content = content.replace(
        '<script id="templates"></script>', 
        `<script id="templates"> window.templates = ${ JSON.stringify(ctx.templates) }; </script>`
    );
    
    return content;
}

function ParseInvokeTag(el) {
    const name = el.getAttribute("name");
    
    return {name};
}

function ParseInvoke(filePath, pel, ctx) {
    if (ctx.content[pel.name]) {
        
        return ctx.content[pel.name];
    } else {
        console.error(`Invoke content not found ${pel.name}!`, ctx);

        return "";
    }
}

function ParseLater(filePath, pel, ctx) {
    
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

function ParseIncludeTag(el, inner) {
    const src = el.getAttribute("src");
    const data = el.getAttribute("data");
    const parms = el.getAttribute("parms");
    const name = el.getAttribute("name");
	const engine = el.getAttribute("engine");
	const variable = el.getAttribute("variable");
	const invoke = el.getAttribute("invoke");
	const content = el.getAttribute("content");

    // const inner = el.innerHTML;

    return {src, data, parms, name, inner, engine, variable, invoke, content};
}

async function LoadFile(filePath, json, parseTagFnc, parserFnc, tagName='include', templateEngine, ctx) {
    if ( ! templateEngine ) {
        templateEngine = ctx.config.templateEngine;
    }

    let text = ReadContent(filePath, ctx);

    const beginTag = `<${tagName}`;
    const endTag = `</${tagName}>`;

    const content = [];

    while (text.indexOf(beginTag) > -1) {
        text = await LoadFileTextHandling(text, tagName, beginTag, endTag, content, parseTagFnc, parserFnc, filePath, ctx);
    }

    if (text.length > 0) {
        content.push( text );
    }

    let html = content.join("");

    html = ReplaceKeys(html, json, templateEngine, ctx);

    return html;
}

async function LoadFileTextHandling(text, tagName, beginTag, endTag, content, parseTagFnc, parserFnc, filePath, ctx) {
	const pos = text.indexOf(beginTag);
	
	content.push(text.substring(0, pos));
	
	text = text.substring(pos);

	const tagClosePos = text.indexOf('>');

	const beginTagContent = text.substring(0, tagClosePos+1);
	text = text.substring(tagClosePos+1);

	const after = text.indexOf(endTag);

	const innerContent = text.substring(0, after);
	text = text.substring(after);

	const incTag = beginTagContent + endTag;

	console.log('incTag', incTag);
	console.log('innerContent', innerContent);

	const parsedEl = parseElement(incTag, tagName, parseTagFnc, innerContent);

	content.push( await parserFnc(filePath, parsedEl, ctx) );
	
	text = text.substring(endTag.length);

	return text;
}

function parseElement(incTag, tagName, parseTagFnc, innerContent) {
	console.log('PARSE', incTag);
	console.log('INNER', innerContent);

    const dom = parser.parseFromString(incTag);
    const el = dom.getElementsByTagName(tagName)[0];
    const parsedEl = parseTagFnc(el, innerContent);

    console.log('attrs', parsedEl);

    return parsedEl;
}

function ReadContent(filePath, ctx) {
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
                const jsLater = JsonFromFile(laterJsPath, ctx);

                for (const jsli of jsLater) {
                    if (!jsli.name) jsli.name = jsli.src;
                    ctx.js[jsli.src] = jsli;
                }
            }

            if (fs.existsSync(laterCssPath)) {
                const cssLater = JsonFromFile(laterCssPath, ctx);

                for (const cssli of cssLater) {
                    if (!cssli.name) cssli.name = cssli.href;
                    ctx.css[cssli.href] = cssli;
                }
            }
        }
    }

    return content;
}

async function ParseInclude(filePath, pel, ctx) {
    let jsonData = {};
    let parmsObj = {};

    if (!pel.src || pel.src == null) {
        pel.src = 'inner:' + pel.inner;
    } else {
        pel.src = `${ctx.rootPath}/${pel.src}`;
        pel.name = pel.src;
    }

    // TODO: Handle parms array selector for example: '|'
    ParseIncludeParseParms(pel, parmsObj);

	// content

	if (pel.data && pel.data != null) {
		jsonData = JsonFromFile (pel.data, ctx);

	} else if (pel.variable) {
		if ( ! ctx.data[pel.variable] ) { console.error(`Variable not found ${pel.variable}!`); }

		jsonData = ctx.data[pel.variable];
	} else if (pel.invoke) {
		jsonData = await ctx.invoke(pel.invoke, parmsObj);
	}

	console.log("jsonData is "+typeof(jsonData), JSON.stringify(jsonData, null, 4));

	let content = "";

	if (pel.content) {
		if ( ! ctx.content[pel.content] ) { console.error(`Content not found ${pel.content}!`); }

		content = ctx.content[pel.content];
	} else {

		content = await ParseIncludeMakeContent(jsonData, parmsObj, ctx, pel);
	}

	return content;
}

function ParseIncludeParseParms(pel, parmsObj) {
    if (pel.parms) {
        const keyVals = pel.parms.split(/;/g);

        for (const keyVal of keyVals) {
            const keyTags = keyVal.split(/\:/g);

            parmsObj[keyTags[0]] = keyTags[1];
        }
    }
}

async function ParseIncludeMakeContent(jsonData, parmsObj, ctx, pel) {
    let content;

    if (Array.isArray(jsonData)) {
        const contents = [];
        let i = 0;

        for (const jsonItem of jsonData) {
            i++;
            content = await ParseIncludeLoadFile(jsonItem, parmsObj, ctx, pel, i);
            contents.push(content);
        }

        content = contents.join('');
    } else {
        content = await ParseIncludeLoadFile(jsonData, parmsObj, ctx, pel, 1);
    }
    
    return content;
}

async function ParseIncludeLoadFile(jsonItem, parmsObj, ctx, pel, i) {
    const json = Object.assign(jsonItem, parmsObj);

    json.config = ctx.config;
    json.ctx = ctx;
    json.template = pel.name;
    json._time = new Date().getTime();
    json._position = i;

    ctx.templates[pel.name] = escape( ReadContent(pel.src, ctx) );

    const content = await LoadFile(pel.src, json, ParseIncludeTag, ParseInclude, 'include', pel.engine, ctx);

    return content;
}

function JsonFromFile (filePath, ctx) {
    const text = fs.readFileSync(ctx? `${ctx.rootPath}/${filePath}`: filePath).toString();
    let data = null;

    try {

        data = JSON.parse(text);
    } catch (e) {
        
        console.error(`Problem with file: ${filePath}`, e);

        throw e;
    }

    return data;
}

function ReplaceKeys(content, data, templateEngine, ctx) {
    if (data) {
        let rendered;

        console.log(`templateEngine: ${templateEngine}`);

        if (templateEngine == "mustache") {
            rendered = mustache.render(content, data);
        } else if (templateEngine == "ecma") {
            rendered = eval('`' + content + '`');
        } else if (templateEngine == "ejs") {
            rendered = ejs.render(content, data);
        } else if (templateEngine == "javascript") {
            rendered = eval(content);
        } else {
            console.log(`Template not used, for this one.`);
            
            rendered = content;
        }
        
        return rendered;
    } else {

        return content;
    }
}

async function CallAction(module, action, obj) {
    if (module && action) {
        const mdl = require(module);

        return await mdl[action](obj);
    }
}

module.exports = {
    LoadFile,
    ParseInclude,
    ReplaceKeys,
    JsonFromFile,
    LateParse,
    ParseFile,
    InvokeContent,
    CallAction
};
