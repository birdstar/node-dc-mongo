#!/bin/sh

NODE_ENV=$1

if [ -z $NODE_ENV ]
then echo "please input NODE_ENV"
exit 1
fi

echo $NODE_ENV

pm2 start pm2.json --env $NODE_ENV --no-daemon
#npm start