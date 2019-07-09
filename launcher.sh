#!/usr/bin/env bash


startBot()
{
    if [[ ! -d "db" ]]; then
        mkdir db
    fi
    tsc
    npm run start
}

startBot || {
    echo "run failed, installing dependencies"
    echo "requiring sudo rights, read this file to know what it does!"

    ##nstalling lastest version of npm
    sudo apt-get install npm build-essential python2.7 sqlite3
    sudo npm install -g
    npm install @discordjs/uws
    sudo n stable

    #sudo npm install -g node-gyp typescript
    #sudo npm install better-sqlite3 --save
    #sudo npm install discord.js --save

    startBot
}

