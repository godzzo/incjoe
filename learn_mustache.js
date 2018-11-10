
/*
 */

'use strict'

var mustache = require('mustache');

const template = `<!DOCTYPE HTML>
<html>
<body onload="loadUser()">
<div id="target">Loading...</div>
<script id="template" type="x-tmpl-mustache">
Hello {{ name }}!
</script> 
</body>
</html>`;

const rendered = mustache.render(template, {name: "Luke"});

console.log(rendered);
