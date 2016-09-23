#!/usr/bin/env bash

mkdir /tmp/meteor-build
meteor build /tmp/meteor-build --architecture os.linux.x86_64
scp -i ~/.ssh/evart-social-network.pem /tmp/meteor-build/meteor.tar.gz admin@52.57.93.143:/home/admin/
scp -i ~/.ssh/evart-social-network.pem settings.json admin@52.57.93.143:/home/admin/
scp -i ~/.ssh/evart-social-network.pem run.sh admin@52.57.93.143:/home/admin/
