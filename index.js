const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./token.json').token;

const Utils = require("./utils.js");
const dbUtils = require('./database.js');
const Server = require('./server.ts');
const initMethods = require('./init.js');

const SQLite = require("better-sqlite3");
const sql = new SQLite('./db/table.sqlite');
const Poll = require("./Poll.js");

var guilds = new Map();

//var boolToSQLInt = (b) =>  b ? 1 : 0;
//var SQLIntToBool = (i) =>  i === 1;
Boolean.prototype.toInt = function () {
    return this.valueOf() ? 1 : 0
};
Number.prototype.toBoolean = function () {
    return (this.valueOf() === 1);
};

dbUtils.createTables(sql);


function checkGuildInitialized(guild) {
    if (!guild.available)
        return true;
    const id = guild.id;
    if (dbUtils.isServerInDB(id, sql)) {
        guilds.set(id, new Server(sql, guild));
        return true;
    }
    return false;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.guilds.array().forEach((guild) => {
        checkGuildInitialized(guild)
    })
});

client.on("guildCreate", (guild) => {
    if (!checkGuildInitialized(guild)) {
        guild.channels.sort(function (chan1, chan2) {
            if (chan1.type !== `text`) return 1;
            if (!chan1.permissionsFor(guild.me).has(`SEND_MESSAGES`)) return -1;
            return chan1.position < chan2.position ? -1 : 1;
        }).first().send(`Thanks for adding me! admin, please type "py configure" to set me up.`);
    }
});

client.on("guildDelete", (guild) => {
    if (guilds.has(guild.id))
        guilds.get(guild.id).soft_delete(sql);
});


function setupServer() {

}

function getLetterEmoji(letter) {
    return (":regional_indicator_" + String.fromCharCode(97 + letter) + ":")
}


var adminCommands = {
    command_create_poll: Poll.createPoll,
    command_suppr_poll_choice: Poll.removeChoicePoll,
};

var usersCommands = {
    command_add_poll_choice: Poll.addChoicePoll,
};

function showInvalidRightsCommand(command, msg, guild) {
    var str = Utils.fillTemplateString(guild.lang.command_admin_reserved, {w: command});
    Utils.showMessageAndDelete(msg, str);
}

function showInvalidCommand(command, msg, guild) {
    var str = Utils.fillTemplateString(guild.lang.command_not_found, {w: command});
    //todo: str += la string d'aide générale, bien longue.
    Utils.showMessageAndDelete(msg, str);
}


client.on('message', msg => {
        if (msg.guild) {
            //console.log(msg.guild.roles.find("name", "notExisting"));
            //console.log(msg.guild.roles.find("name", "modoAutogéré"));

            if (guilds.has(msg.guild.id)) {
                if (!msg.content.startsWith(guilds.get(msg.guild.id).prefix))
                    return;
                const guild = guilds.get(msg.guild.id);
                const command = msg.content.substring(guild.prefix.length).trim();
                //commands are localized: get the command title
                const commandArray = command.split(" ");
                const CommandName = commandArray[0];
                const title = Utils.getKeyByValue(guild.lang, CommandName);
                if (title === undefined)
                    return showInvalidCommand(CommandName, msg, guild);
                if (adminCommands.hasOwnProperty(title)) {
                    if (!(msg.member && msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD)) &&
                        !(msg.member && Utils.userHasRole(guild.admRoles, msg.member.roles.values())))
                        return showInvalidRightsCommand(CommandName, msg, guild);
                    adminCommands[title](commandArray.slice(1), msg, sql);
                    return;
                }

                if (!usersCommands.hasOwnProperty(title))
                    return showInvalidCommand(CommandName, msg, guild);
                usersCommands[title](commandArray.slice(1), msg, sql);
            }

            else if ((msg.content).replace(/ /g, '') === "pyconfigure" &&
                msg.member && msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD)) {
                initMethods.addUserToInit(msg, sql, guilds);
            }


            /*
            if (msg.content.startsWith("startPoll")) {
                var poll_values = ["val"];
                message.channel.send("hello").then(poll => {
                    for (var i = 0; i < poll_values.length; i++) {
                        message.react(getLetterEmoji(i));
                    }
                    message.edit();
                    //message.removeAllListeners(); //removes AwaitReactions
                    message.awaitReactions(filter, {max: 99999, time: maxTime, errors: ['time']})
                    {
                    }

                }).catch(console.error)
            }
            */
        }
    }
);


//client.emojis.exists("name", name); //check emoji exists

//client.on('messageReactionAdd', (reaction, user) => {
//});

client.login(token);
