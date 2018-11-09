#!/bin/bash

ls -1  | grep tp_ | while read prename; do name=`echo -en $prename | sed 's/tp_//gi'`; echo $name; node ../do_include_html.js ./tp_$name ./$name; done

