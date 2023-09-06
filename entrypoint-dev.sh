#!/bin/sh

# start cron daemon.
crond -b -l 8

# start app
pm2-dev ecosystem.development.config.js
