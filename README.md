# Includer JOE (abbreviation: ijoe, incjoe)


## Table of Contents

- [Simple include without templating](#simple)
- [*Include* inner text with data](#inner)
- [Render with parameters without json](#parms)
- [Configuration](#configuration)
- [Limitations](#limitations)
- [Additive JS, CSS](#additive-js-css)
- [Bash usefull things](#bash-usefull-things)
- [Web JOE](#web-joe)
- [Server JOE with QS parms substitution](#server-joe-with-qs-parms-substitution)
- [Server JOE with invokation](#server-joe-with-invokation)

## Simple

Include a file without templating:

```xml
<include src="fragment/index/head.html" engine="none"></include>
```

## Inner

You can omit src attribute Joe would use the inner text as template content.
You can use inner text node as template, and use json array to render it multiple times, like this:

```xml
    <table class="table">
        <thead class="thead-dark">
            <tr>
                <th scope="col">#</th>
                <th scope="col"> Név </th>
                <th scope="col"> Leírás </th>
                <th scope="col"> Link </th>
                <th scope="col"> Példa </th>
            </tr>
        </thead>
        <tbody>

            <include data="data/index/table-rows.json" engine="ejs">
                <tr>
                    <th scope="row"> <%= _position %> </th>
                    <td> <%= name %> </td>
                    <td> <%= description %> </td>
                    <td> <a href="<%= url %>">LINK</a> </td>
                    <td> <a href="<%= sample_url %>">SAMPLE</a> </td>
                </tr>
            </include>

        </tbody>
    </table>
```

Joe recognize the json is array and render it as much as the array length:

```javascript
[
    {
        "name": "Album",
        "description": "Megy a Modal + Form - elem hozzáadása (append, prepend, replace!)",
        "url": "album.html",
        "sample_url": "https://getbootstrap.com/docs/4.1/examples/album/"
    },
    {
        "name": "Carousel",
        "description": "Figyelni kell az id -ra, ha nem megy a vezérlés akkor el van írva",
        "url": "carousel.html",
        "sample_url": "https://getbootstrap.com/docs/4.1/components/carousel/"
    },
    {
        "name": "Floating labels",
        "description": "Szép bejelentkezési form, a validáció érdekes és az input -on belüli felső magyarázó szöveg.",
        "url": "floating-labels.html",
        "sample_url": "https://getbootstrap.com/docs/4.1/examples/floating-labels/"
    }
]
```

## Parms


You could send data with the `parms` attribute. It handles two separator, `:` the key value separator, and `;` the property separator. 

```xml
<include src="fragment/index/head.html" engine="mustache" parms="name:index;title:Főoldal;sticky:on"></include>
```

It will generate this *json*:

```javascript
{
  "name": "index",
  "title": "Főoldal",
  "sticky": "on"
}
```

The template:

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="img/favicon.ico">

    <title> {{ title }} </title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">

    {{ #sticky }} 
    <link rel="stylesheet" href="css/sticky-footer-navbar.css">
    {{ /sticky }}

    {{ #css }} 
    <!-- Custom styles for this template -->
    <link href="css/{{ css }}.css" rel="stylesheet">
    {{ /css }}

    <!-- Fragment -ek css -ei -->
    <later name="css"></later>
</head>
```


## Configuration

It is a **config.json** file, and you have to put it the main template.
You can use three template engine here (**mustache, ejs, ecma** = string literal like `Hello ${someVar}`).
This means Joe use this setting as default, if you not set in the `<include ... engine="ejs"></include>` tag.

```js
{
    "templateEngine": "mustache",
    "printFragmentBlock": true
}
```

## Limitations

You could not use self closed include or later tags, you have to use like this:

```xml
<include ...>...</include>
```

Not this:
```xml
<include .../>
```

## Additive JS, CSS

By `later` tag, and naming convention Joe collects the fragment additive JS and CSS dependencies, and append to the later tag position. For example you have a `unite_gallery.html` fragment and it has css and js dependencies, you should crate a `unite_gallery-later-js.json` for js and a `unite_gallery-later-css.json` for css needs. Joe look for `-later-js.json` and `-later-css.json` postfixed files every included files.

unite_gallery-later-js.json
```js
[
    {"src": "/unitegallery/js/unitegallery.js"},
    {"src": "/unitegallery/themes/default/ug-theme-default.js"}
]
```

unite_gallery-later-css.json
```js
[
    {"href": "/unitegallery/css/unite-gallery.css"},
    {"href": "/unitegallery/themes/default/ug-theme-default.css"}
]
```

Joe will try to find the `<later name="css"></later>` and `<later name="script"></later>` to insert all fragment dependencies:

```html
<head>
    ...
    <!-- Fragment -ek css -ei -->
    <later name="css"></later>
</head>

<body>
    ...
    <!-- Fragment -ek script -jei -->
    <later name="script"></later>
</body>
```

Joe make a unique set, for not inserting the same thing multiple times. If you have multiple jquery in multiple urls, you could use `{"href": ..., "name": JQuery"}` and Joe will use only one, but the **last** one.

## Bash usefull things

You can compile the following command an `index.html` *page* by `tp_index.html` template file:
```sh
user@server:~/Test/incjoe$ ijoe tp_index.html
```

Or you can compile all tp_ prefixed template files to html pages:
```sh
user@server:~/Test/incjoe$ incjoe
```

The functions, and settings, what I put my `.bashrc` file:
```sh
export INCJOE_HOME='/home/user/incjoe';

function ijoe {
    tpname=`echo -en $1 | sed 's/tp_//gi'`;

    echo "Building by tp_$tpname To $tpname";.

    node $INCJOE_HOME/do_include_html.js ./tp_$tpname ./$tpname;
}

function incjoe {
    ls -1  | grep tp_ | while read prename; do
        name=`echo -en $prename | sed 's/tp_//gi'`;
        echo $name;
        node $INCJOE_HOME/do_include_html.js ./tp_$name ./$name;
    done;
}
```

## Web JOE

### Try it: 

Run server:
```sh
user@machine:~/Test/incjoe$ ./run_server.sh 

util_run.sh LOADED :)
:START: 2018-11-17 11:35:58
node ./srv_koa.js  >>./log/srv_koa.log 2>>./log/srv_koa-err.log
```

And browse: [http://localhost:7722/samples/album/](http://localhost:7722/samples/album/)

Click the : **Add new picture** button and fill the form and push the **Save Form** button, the new picture will be placed in the example album.

### How it works

 Joe have a `web_incjoe.js` script file, which can **append / prepend / replace** the templates in runtime (means in browser on the client side).

The **script id=templates** needed in your template if you want to use the template contents in the browser:
```js
<script id="templates"></script>
```

Need your templates use the template property:
```html
<div... data-incjoe-template="{{ template }}">
</div>
```

I choose to show the form in the modal, you don't have to (bootstrap handle this):
```html
<a href="#" data-toggle="modal" data-target="#modalAlbumItem">Új kép beszúrása</a>
```

And define by html attributes for Joe, what to do with form data:
* `data-incjoe-target="#album_item_container"`
  - The CSS selector of the template container 
    - Joe will try to find out the template id by `data-incjoe-template`
      - and try to load from window.templates 
      - *where the includer replaced the `<script id="templates"></script>` with templates json*
* `data-incjoe-submit="prepend"` 
  - The actions how to save the data
    - **prepend** - insert as first child
    - **append** - append as last child
    - **replace** - replcae content

The form button (right now only use mustache, later ejs and ecma string literal):

```html
<form>...
    <button type="button" 
        id="form-message-submit" 
        class="btn btn-primary" 
        data-incjoe-submit="prepend"
        data-incjoe-target="#album_item_container"
    >
        Save Form
    </button>
</form>
```

## Server JOE with QS parms substitution

Running JOE as server:
```sh
user@machine:~/Test/incjoe$ node srv_incjoe.js ./www 7722

PARMS:  { docRoot: './www', port: 7722 }
  <-- GET /samples/album/index.html?name=hello&age=23&gen=true
fileName index.html
filePath /samples/album
Template ./www//samples/album/tp_index.html
qs parms { name: 'hello', age: '23', gen: 'true' }
Template Modify time 2018-11-17T11:07:58.323Z
Output Modify time 2018-11-17T11:08:28.887Z

Include! { templatePath: './www//samples/album/tp_index.html',
```

Browse your template output name (tp_album.html >> album.html) and give the **gen** querystring parameter for Joe to compile the template:
[http://localhost:7722/samples/album/index.html?name=Moose&age=23&gen=true](http://localhost:7722/samples/album/index.html?name=Moose&age=23&gen=true)

You can substitute a QueryString parameters as **ctx.parms**.name in your templates.
```html
<h1 class="jumbotron-heading">
    Album example - 

    {{ #ctx.parms }}{{ #ctx.parms.name }}
        {{ ctx.parms.name }}
    {{ /ctx.parms.name }}{{ /ctx.parms }}
</h1>
```

## Server JOE with invokation

Joe could call server side logic for substitute the `<invoke name="EatLess"></invoke>` tags by name.

Some static and one mysql and one mysql with formatter invokation
www/samples/album/**tp_invoke_test.html**
```html
<div id="EatLess">
    <invoke name="EatLess"></invoke>
</div>
<div id="ExerciseMore">
    <invoke name="ExerciseMore"></invoke>
</div>
<div id="LearnEveryDay">
    <invoke name="LearnEveryDay"></invoke>
</div>
<div id="ReadText">
    <invoke name="ReadText"></invoke>
</div>

<div id="SqlTest1">
    <invoke name="SqlTest1"></invoke>
</div>
<div id="SqlTest2">
    <invoke name="SqlTest2"></invoke>
</div>
```

The needed configuration for this:
```js
    "invokable": [
        {
            "name": "EatLess",
            "mask": ".*invoke_test.*",
            "module": "./test_invoke/simple.js",
            "action": "EatLess"
        },
        {
            "name": "ExerciseMore",
            "mask": ".*invoke_test.*",
            "module": "./test_invoke/simple.js",
            "action": "ExerciseMore"
        },
        {
            "name": "LearnEveryDay",
            "mask": ".*invoke_test.*",
            "module": "./test_invoke/simple.js",
            "action": "LearnEveryDay"
        },
        {
            "name": "ReadText",
            "mask": ".*invoke_test.*",
            "module": "./test_invoke/fs_test.js",
            "action": "ReadText"
        },
        {
            "name": "SqlTest1",
            "mask": ".*invoke_test.*",
            "module": "./util_ijoe_mysql.js",
            "action": "RunSql",
            "sql": "SELECT adv_id FROM cars LIMIT 10"
        },
        {
            "name": "SqlTest2",
            "mask": ".*invoke_test.*",
            "module": "./util_ijoe_mysql.js",
            "action": "RunSql",
            "sql": "SELECT adv_id FROM cars LIMIT 10",
            "formatAction": "FormatSqlToChange",
            "formatModule": "./test_invoke/mysql_test.js"
        }
    ]
```

You can use **RunSql** with sql (named parameter, syntax :uriParameterName, and substitution with ecma strin literal - ${someSugar}).

The RunSql handle **formatterAction** who can manipulate the result.
