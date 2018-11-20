
'use strict'

const data = {name: "hello", code: 111};

const sampleText = `
<html>

<div>
	[[<include 
		data="data/egyedi_jellemzok.json"
		engine="ecma"><span class="travel-badge green hide"
		 [class]="'travel-badge green' + (query_egyedi_jellemzok.includes('${data.code}') ? '' : ' hide')"> ${data.name} </span></include>]]
</div>

<p>
	[[<include src="fragment/result-list/icons-item.html" data="data/egyedi_jellemzok.json">var htmlparser = require("htmlparser2");
		var parser = new htmlparser.Parser({
			onopentag: function(name, attribs){
				if(name === "script" && attribs.type === "text/javascript"){
					console.log("JS! Hooray!");
				}
			},
			ontext: function(text){
				console.log("-->", text);
			},
			onclosetag: function(tagname){
				if(tagname === "script"){
					console.log("That's it?!");
				}
			}
		}, {decodeEntities: true});
		parser.write("Xyz <script type='text/javascript'>var foo = '<<bar>>';</ script>");
		parser.end();</include>]]
</p>

</html>
`;

SecondTry(sampleText);

function SecondTry(text) {
	const tagName = 'include';
	const beginTag = `<${tagName}`;
	const endTag = `</${tagName}>`;
	
	const content = [];

	while (text.indexOf(beginTag) > -1) {
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

		text = text.substring(endTag.length);
	}

	if (text.length > 0) {
		content.push( text );
	}

	console.log('html', content.join(""));
}

function FirstTry() {
	const htmlparser = require("htmlparser2");
	
	const dom = htmlparser.parseDOM(sampleText);

	console.log(dom);
}
