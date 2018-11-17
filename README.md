# Includer JOE (abbreviation: ijoe, incjoe)


## Table of Contents

- [Simple include without templating](#simple)
- [*Include* inner text with data](#inner)
- [Render with parameters without json](#parms)
- [Configuration](#configuration)
- [Limitations](#limitations)


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
