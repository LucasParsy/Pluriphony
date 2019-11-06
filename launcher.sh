#!/usr/bin/env bash


startBot()
{
    if [[ ! -f "token.json" ]]; then
	>&2 echo "please create a valid 'token.json' file"
	exit 1
    fi

    if [[ ! -d "db" ]]; then
        mkdir db
    fi
    tsc
    npm run start
}

startBot || {
    echo "run failed, installing dependencies"
    echo "requiring sudo rights, read this file to know what it does!"

    ##installing lastest version of npm
    if (command -v pacman); then
	sudo pacman -S --needed npm base-devel python2 sqlite3
    elif (command -v apt-get); then
	sudo apt-get install npm build-essential python2.7 sqlite3
    elif (command -v yum); then
	sudo yum install npm build-essential python2.7 sqlite3
    else
	echo "please update this script with your distribution package manager"
    fi

    sudo npm install -g n
    sudo n stable

    npm install

    startBot
}

