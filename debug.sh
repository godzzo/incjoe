#!/bin/bash

function docmd {
    echo "$@";

    $@;
}

docmd node --inspect-brk "$1";
