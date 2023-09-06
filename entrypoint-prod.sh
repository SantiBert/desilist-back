#!/bin/sh

# start cron daemon.
crond -b -l 8

# start app
pm2-runtime ecosystem.production.config.js
