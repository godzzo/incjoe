/*
*/

'use strict'

const session = require('koa-session');
const serve = require('koa-static');
const logger = require('koa-logger');
const fs = require('fs');
const path = require('path');

const ParseFile = require('./util_common.js').ParseFile;
const JsonFromFile = require('./util_common.js').JsonFromFile;
const InvokeContent = require('./util_common.js').InvokeContent;

const Koa = require('koa');

const {docRoot, port, appRoot, config} = InitArguments();

const modules = InitModules(config);

const app = new Koa();

app.use( logger() );

app.keys = ['Includer_JOE_koa_webservice'];

const sessionConfig = {
	key: 'koa:sess', maxAge: 86400000, httpOnly: true, rolling: false, renew: false
};

app.use( session(sessionConfig, app) );

app.use( (ctx, next) => BaseCall(ctx, next, TestOne) );
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

async function TestOne(ctx) {

    console.log('session', ctx.session);

	ctx.session.working = ctx.session.working || 0;
	ctx.session.working++;

	console.log('session', ctx.session);

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
    const url = ctx.request.url.replace(/\?.*/g, '');
    const fileName = path.basename(url);
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
		
        if (parms.gen && config.srv.mode != 'POST_GEN') {
            console.log('Include!', {templatePath, outPath, parms});

            await ParseFile(templatePath, outPath, parms, templateRoot);
        }

        const {content, data} = await InvokeContents(url, parms, ctx);

		data.session = ctx.session;

        console.log("Invokable Contents: ", {content, data});

		// 'inner:'
		if (config.srv.mode == 'POST_GEN') {
			const body = await ParseFile(
				templatePath, outPath, parms, templateRoot, true, 
				{content, data, invoke: async (actionName, incParms) => {
					return await InvokeAction(actionName,  {...parms, ...ctx.session, ...incParms}, ctx);
				}});

			ctx.response.body = await InvokeContent( 'inner:' + body, {content, data, config} );
		} else {
			ctx.response.body = await InvokeContent( outPath, {content, config} );
		}

    }
}

async function InvokeAction(name, parms, ctx) {
	const data = {};
	const setting = config.invokable.find(el => el.name == name);

	if (!setting) {
		console.error(`Invokable action not found: ${name} )!`, config.invokable);
	} else {
		await LoadContent(setting, null, data, parms, ctx);
	}

	return data[name];
}

async function InvokeContents(url, parms, ctx) {
	const content = {};
	const data = {};

	for (const setting of config.invokable) {

		if (new RegExp(setting.mask).test(url)) {

			// Here was a funy incident without await, the contents not loaded, and the Invoke called :)
			await LoadContent(setting, content, data, parms, ctx);
		}
	}

	return {content, data};
}

async function LoadContent(setting, content, data, parms, ctx) {
    if (!modules[setting.module]) {
        console.error(`Not found ${setting.module} module, for ( ${setting.mask} )!`, setting);
    } else {
        if (!modules[setting.module][setting.action]) {
            console.error(`Not found ${setting.action} action, for ( ${setting.mask} )!`, setting);
        } else {
			console.log(`LoadContent ${setting.module} :: ${setting.action}`);

            const action = modules[setting.module][setting.action];
			
			let response;

			try {
				response = await action( {parms, ctx, setting, config, content, data} );
			} catch (error) {
				console.error(error);
			}
			
			console.log('LoadContent response', {response, setting});

			if (response) {
				if (setting.contentType && setting.contentType == 'object') {
					data[setting.name] = response;
				} else {
					content[setting.name] = response;
				}
			}

			console.log('LoadContent SET', {content, data});
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
	console.log('process.argv', process.argv);

    const configPath = process.argv.length > 2? process.argv[2]: './config.json';
    let docRoot = process.argv.length > 3? process.argv[3]: './www';
	let port = process.argv.length > 4? parseInt(process.argv[4]): 7722;
	let appRoot = process.argv.length > 5? parseInt(process.argv[5]): './app';

	const config = InitConfig(configPath);

	if (config.srv) {
		docRoot = config.srv.docRoot;
		port = config.srv.port;
		appRoot = config.srv.appRoot;
	}

	if (! config.srv.mode) {
		config.srv.mode = 'DEFAULT'; // POST_GEN
	}

    console.log('Arguments: ', JSON.stringify({docRoot, port, appRoot, config}, null, 4));

    return {docRoot, port, appRoot, config};
}