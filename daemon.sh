#!/usr/bin/env bash
#/etc/init.d/evart

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
    start)
      gulp dev --cwd /home/admin/evart
      ;;
    *)
      echo "Usage: /etc/init.d/evart {start}"
      exit 1
    ;;
esac

exit 0
