/*
*/

'use strict'

// const mount = require('koa-mount');
const serve = require('koa-static');
const logger = require('koa-logger');
const fs = require('fs');
const path = require('path');

const ParseFile = require('./util_common.js').ParseFile;

// const common = require('./srv_common.js');

const Koa = require('koa');

const docRoot = process.argv.length > 3? process.argv[2]: './www';
const port = process.argv.length > 3? parseInt(process.argv[3]): 7722;

// const routing = [
//     {path: '/test-one', fn: (ctx, next) => BaseCall(ctx, next, TestOne)},
// ];

const app = new Koa();

app.use( logger() );

// for (const route of routing) {
//     console.log(`Adding route path: ${route.path} .`);

//     app.use( mount(route.path, route.fn) );
// }

console.log(`PARMS: `, {docRoot, port});

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

async function IncludeJoe (ctx) {

    const fileName = path.basename(ctx.request.url).replace(/\?.*/g, '');
    const dirPath = path.dirname(ctx.request.url);
    const templatePath = `${docRoot}/${dirPath}/tp_${fileName}`;
    const templateRoot = `${docRoot}/${dirPath}`;
    const outPath = `${templateRoot}/${fileName}`;

    const parms = ParseQueryString(ctx);

    console.log('fileName', fileName);
    console.log('filePath', dirPath);
    console.log('Template', templatePath);
    console.log('qs parms', parms);

    if ( fs.existsSync(templatePath) ) {
        console.log('Template Modify time', fs.statSync(templatePath).mtime)
        console.log('Output Modify time', fs.statSync(outPath).mtime)

        if (parms.gen) {
            console.log('Include!', {templatePath, outPath, parms});

            ParseFile(templatePath, outPath, parms, templateRoot);
        }
    }
}

function ParseQueryString (ctx) {

    const queryString = ctx.request.query;
    const parms = {};
    
    for (const name in queryString) {
        parms[name] = queryString[name];
    }
    
    return parms;
}
