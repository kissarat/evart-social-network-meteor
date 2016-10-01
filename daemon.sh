#!/bin/sh
#/etc/init.d/evart

### BEGIN INIT INFO
# Provides:          evart
# Required-Start:    $all
# Required-Stop:     $remote_fs $syslog
# Default-Start:     3 4 5
# Default-Stop:      0 1 6
# Short-Description: Evart Social Network
# Description:       Meteor, file, convert servers
### END INIT INFO

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules
PID=/home/admin/evart.pid

case "$1" in
    start)
      su admin -c 'gulp prod --cwd /home/admin/evart > /home/admin/evart.log &'
      ;;
    *)
      echo "Usage: /etc/init.d/evart {start}"
      exit 1
    ;;
esac

exit 0
