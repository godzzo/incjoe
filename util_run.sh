#!/bin/bash

function log_state {
    now=`date '+%Y-%m-%d %H:%M:%S'`;

    echo ":$1: $now";

    echo ":$1: $now">>"./log/$2.log";
    echo ":$1: $now">>"./log/$2-err.log";
}

function run_script {

    name=`echo -en "$1" | sed 's/\..*//gi'`;

    log_state START "$name";

    echo "$2 ./$name.$3 "${@:4}" >>./log/$name.log 2>>./log/$name-err.log";

    $2 "./$name.$3" "${@:4}" >>"./log/$name.log" 2>>"./log/$name-err.log";

    log_state FINISH "$name";
}

function run_node {
    run_script "$1" "node" "js" "${@:2}"
}

function run_bash {
    run_script "$1" "bash" "sh" "${@:2}"
}

echo "util_run.sh LOADED :)"
