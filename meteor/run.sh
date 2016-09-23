#!/usr/bin/env bash

export MONGO_URL=mongodb://127.0.0.1/evart
export ROOT_URL=http://evart.com
export PORT=3000
export METEOR_SETTINGS=`cat /home/admin/settings.json`

if [ ! -x ./bundle/programs/server/node_modules ]; then
cd ./bundle/programs/server/
npm install --production
cd ../..
fi
cd /home/admin/bundle

node main.js
