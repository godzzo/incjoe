/*
*/

'use strict'

// const mount = require('koa-mount');

const serve = require('koa-static');
const logger = require('koa-logger');

// const common = require('./srv_common.js');

const Koa = require('koa');

const docRoot = process.argv[2];
const port = parseInt(process.argv[3]);


const app = new Koa();

app.use(logger());

/*
for (const route of common.routing) {
    console.log(`Adding route path: ${route.path} .`);

    app.use(mount(route.path, route.fn));
}
*/

app.use( serve( docRoot ) );

app.listen(port);

console.log(` listening on port ${port} `);
