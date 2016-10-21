#!/usr/bin/env bash

kill -s SIGINT `ps -A | grep -m1 labiak | grep -oE "^ *[0-9]+"`

#for pid in `ps -A | grep labiak | grep -oE "^ *[0-9]+"`; do
#    kill -s SIGINT $pid
#done
