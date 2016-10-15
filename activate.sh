#!/usr/bin/env bash

export ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export METEOR_SETTINGS=`node $ROOT/config.js`
export KNEX=`node $ROOT/config.js postgresql`
export PS1="\W-\t\\$ \[$(tput sgr0)\]"

bash
