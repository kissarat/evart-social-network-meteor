#!/usr/bin/env bash

sudo apt-get install build-essential postgresql mongodb libpq-dev imagemagick curl
curl https://install.meteor.com/ | sh
wget https://nodejs.org/dist/v6.6.0/node-v6.6.0-linux-x64.tar.xz
tar xvf node*.xz
rm node*.xz
cd node*
CURRENT=`pwd`
sudo mv bin/* /usr/local/bin/
sudo mv lib/* /usr/local/lib/
sudo mv include/* /usr/local/include/
rm -r node*
cd /usr/local/lib/node_modules/npm
./configure
make
sudo make install
cd $CURRENT
tar xvf meteor.tar.gz
source run.sh
