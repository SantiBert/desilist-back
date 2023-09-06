#!/bin/sh

if [ -z "$1" ]; then
  echo 'You have to provide a file name'
  exit 0
else
  FILE_NAME=$1'_'$(date '+%Y-%m-%d_%H:%M:%S').tar
fi

if [ -z "$POSTGRES_DB" ]; then
  DB_NAME='desilist'
else
  DB_NAME=$POSTGRES_DB
fi

if [ -z "$POSTGRES_USER" ]; then
  DB_USER='postgres'
else
  DB_USER=$POSTGRES_USER
fi

if [ -z "$POSTGRES_PORT" ]; then
  DB_PORT='5432'
else
  DB_PORT=$POSTGRES_PORT
fi

if [ -z "$POSTGRES_HOST" ]; then
  DB_HOST='localhost'
else
  DB_HOST=$POSTGRES_HOST
fi

if [ -z "$DB_BACKUP_HOME" ]; then
  BACKUP_HOME='/opt/backup'
else
  BACKUP_HOME=$DB_BACKUP_HOME
fi

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -f $BACKUP_HOME'/'$FILE_NAME
