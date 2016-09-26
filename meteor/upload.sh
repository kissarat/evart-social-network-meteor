#!/usr/bin/env bash

if [ ! -d /tmp/meteor-build ]; then
    meteor build /tmp/meteor-build --architecture os.linux.x86_64
    scp -i $HOME/.ssh/evart-social-network.pem /tmp/meteor-build/meteor.tar.gz admin@evart.com:/home/admin/
fi
ssh -i $HOME/.ssh/evart-social-network.pem admin@evart.com "bash -s" < run.sh
