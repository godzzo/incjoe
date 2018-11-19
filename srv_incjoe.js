/*
*/

'use strict'

const serve = require('koa-static');
const logger = require('koa-logger');
const fs = require('fs');
const path = require('path');

const ParseFile = require('./util_common.js').ParseFile;
const JsonFromFile = require('./util_common.js').JsonFromFile;
const InvokeContent = require('./util_common.js').InvokeContent;

const Koa = require('koa');

const {docRoot, port, configPath} = InitArguments();
const config = InitConfig(configPath);
const modules = InitModules(config);

const app = new Koa();

app.use( logger() );

// app.use( (ctx, next) => BaseCall(ctx, next, TestOne) );
app.use( (ctx, next) => BaseCall(ctx, next, IncludeJoe) );

app.use( serve(docRoot) );

app.listen(port);


async function BaseCall(ctx, next, cb){
    try {
        await next();

        await cb(ctx);
    } catch (e) {
        console.error(e);
    }
}

async function TestOne (ctx) {
    
    console.log('url', ctx.request.url);
    
    const fileName = path.basename(ctx.request.url).replace(/\?.*/g, '');
    const dirPath = path.dirname(ctx.request.url);
    const templatePath = `${docRoot}/${dirPath}/tp_${fileName}`;
    
    console.log('fileName', fileName);
    console.log('filePath', dirPath);
    console.log('Template', templatePath);

    if ( fs.existsSync(templatePath) ) {
        console.log('Template Stat', fs.statSync(templatePath).mtime)
    }

    console.log('qs parms', ParseQueryString(ctx) );
}

function ParseUrl(ctx) {
    const url = ctx.request.url;
    const fileName = path.basename(url).replace(/\?.*/g, '');
    const dirPath = path.dirname(url);
    const templatePath = `${docRoot}/${dirPath}/tp_${fileName}`;
    const templateRoot = `${docRoot}/${dirPath}`;
    const outPath = `${templateRoot}/${fileName}`;

    console.log('fileName', fileName);
    console.log('filePath', dirPath);
    console.log('Template', templatePath);
    console.log('url typeof', typeof(url), url);

    return {url, fileName, dirPath, templatePath, templateRoot, outPath};
}

async function IncludeJoe (ctx) {
    const {url, fileName, dirPath, templatePath, templateRoot, outPath} = ParseUrl(ctx);
    const parms = ParseQueryString(ctx);

    if ( fs.existsSync(templatePath) ) {
        if (parms.gen) {
            console.log('Include!', {templatePath, outPath, parms});

            ParseFile(templatePath, outPath, parms, templateRoot);
        }

        const content = {};

        config.invokable.forEach( (setting) => {
            if ( new RegExp(setting.mask).test(url) ) {
                LoadContent(setting, content, parms, ctx);
            }
        });

        ctx.response.body = InvokeContent( outPath, {content, config: {templateEngine: 'none'} } );
    }
}

function LoadContent(setting, content, parms, ctx) {
    if (!modules[setting.module]) {
        console.error(`Not found ${setting.module} module, for ( ${setting.mask} )!`, setting);
    }
    else {
        if (!modules[setting.module][setting.action]) {
            console.error(`Not found ${setting.action} action, for ( ${setting.mask} )!`, setting);
        }
        else {
            const action = modules[setting.module][setting.action];
            content[setting.name] = action(parms, ctx);
        }
    }
}

function ParseQueryString (ctx) {

    const queryString = ctx.request.query;
    const parms = {};
    
    for (const name in queryString) {
        parms[name] = queryString[name];
    }
    
    console.log('qs parms', parms);

    return parms;
}

function InitConfig(configPath) {
    let config = {invokable: {}};

    if ( fs.existsSync(configPath) ) {
        config = JsonFromFile(configPath);
    }

    return config;
}

function InitModules(config) {
    const modules = {};

    config.invokable.forEach( (setting) => {
        const mdl = require(setting.module);
        
        if ( ! modules[setting.module] ) {
            modules[setting.module] = mdl;
        }
    } );

    return modules;
}

function InitArguments() {
    const docRoot = process.argv.length > 2? process.argv[2]: './www';
    const port = process.argv.length > 3? parseInt(process.argv[3]): 7722;
    const configPath = process.argv.length > 4? process.argv[4]: './config.json';

    console.log('Arguments: ', {docRoot, port, configPath});

    return {docRoot, port, configPath};
}