#!/usr/bin/env bash


startBot()
{
if [ ! -d "db" ]; then
    mkdir db
fi
tsc
npm run start
}

startBot || {
echo "run failed, installing dependencies"
echo "requiring sudo rights, read this file to know what it does!"

##nstalling lastest version of npm
sudo apt-get install npm
sudo npm install -g n
sudo n stable

sudo apt-get install build-essential python2.7
sudo npm install -g node-gyp typescript
startBot
}

##sudo apt-get install sqlite3
##npm install uws --save
##npm install better-sqlite3 --save
##npm install discord.js --save
