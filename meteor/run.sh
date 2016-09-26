#!/usr/bin/env bash

export MONGO_URL=mongodb://127.0.0.1:27017/evart
export ROOT_URL=http://evart.com
PIDS_FILENAME=/tmp/evart.pids

cd $HOME/evart/
git pull origin master
cd $HOME
if [ -x $HOME/meteor.tar.gz ]; then
    mv $HOME/bundle $HOME/bundle-old
    tar xvf $HOME/meteor.tar.gz -C $HOME
    mv $HOME/bundle-old/programs/server/node_modules $HOME/bundle/programs/server
    rm $HOME/meteor.tar.gz
    rm -rf $HOME/bundle-old
fi

node $HOME/evart/config > $HOME/evart/meteor/settings.json
export METEOR_SETTINGS=`cat $HOME/settings.json`

npm install --production -C $HOME/bundle/programs/server

if [ -x /tmp/evart.pids ]; then
    for i in `cat $PIDS_FILENAME`; do
        kill $i
    done
fi

export PORT=3001
node $HOME/bundle/main.js &
echo $! > $PIDS_FILENAME
export PORT=3002
node $HOME/bundle/main.js &
echo $! > $PIDS_FILENAME

node $HOME/evart/file/server.js --port 9081 &
echo $! > $PIDS_FILENAME
node $HOME/evart/file/server.js --port 9082 &
echo $! > $PIDS_FILENAME

node $HOME/evart/file/convert.js &
echo $! > $PIDS_FILENAME
node $HOME/evart/file/convert.js &
echo $! > $PIDS_FILENAME

sudo service nginx reload
echo Done
