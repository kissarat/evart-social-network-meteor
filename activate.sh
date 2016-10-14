#!/usr/bin/env bash

export ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ ! -x $ROOT/admin/config.js ]; then
    echo 'module.exports = {"port": 54321}' > $ROOT/admin/config.js
fi

export METEOR_SETTINGS=`node $ROOT/config.js`
export KNEX=`node $ROOT/config.js `
export PS1="\W-\t\\$ \[$(tput sgr0)\]"

bash
