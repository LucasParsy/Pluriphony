import Discord, {CollectorFilter, Guild, GuildMember, Message, ReactionCollector, TextChannel} from "discord.js";
import SQLite from "better-sqlite3";

import Server from "./server";
import {addUserToInit} from "./firstConfigure"
import Utils from "./utils";
import DbUtils from './database.js';
import Commands from './commandsList';
import path from "path";
import WaitlistReactions from "./WaitlistReactions";
import WaitlistEmbedUI from "./WaitlistEmbedUI";
import {WaitingStatus, WaitlistUserInfo} from "./WaitlistUserInfo";

const client = new Discord.Client();
const tableName = path.join(__dirname, '..', 'db', '../db/table.sqlite');
const sql = new SQLite(tableName);

const token = require('../token.json').token;


let guilds = new Map<string, Server>();

//var boolToSQLInt = (b) =>  b ? 1 : 0;
//var SQLIntToBool = (i) =>  i === 1;

/*
Boolean.prototype.toInt = function () {
    return this.valueOf() ? 1 : 0
};
Number.prototype.toBoolean = function () {
    return (this.valueOf() === 1);
};
*/

DbUtils.createTables(sql);


function checkGuildInitialized(guild: Discord.Guild) {
    if (!guild.available)
        return true;
    const id = guild.id;
    if (DbUtils.isServerInDB(id, sql)) {
        guilds.set(id, new Server(sql, guild));
        return true;
    }
    return false;
}

client.on('voiceStateUpdate', (oldM: GuildMember, newM: GuildMember) => {
    if (oldM.voiceChannel == newM.voiceChannel && oldM.mute != newM.mute)
        console.log(`user ${newM.displayName} has ${newM.mute ? "muted" : "unmuted"}`);
    else if (oldM.voiceChannel == undefined && newM.voiceChannel != undefined)
        console.log(`user ${newM.displayName} joined ${newM.voiceChannel.name}`);
    else if (newM.voiceChannel == undefined)
        console.log(`user ${newM.displayName} left ${oldM.voiceChannel.name}`);
    //oldMember.mute;
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.guilds.array().forEach((guild) => {
        checkGuildInitialized(guild)
    })
});


client.on("guildCreate", (guild) => {
    if (!checkGuildInitialized(guild)) {
        const chan = Utils.getFirstTextChannel(guild);
        if (chan !== null)
            chan.send(`Thanks for adding me! admin, please type "py configure" to set me up.`);
    }
});

client.on("guildDelete", (guild) => {
    if (guilds.has(guild.id))
        guilds.get(guild.id)!.soft_delete();
});


function showInvalidRightsCommand(command: string, msg: Message, guild: Server) {
    const str = Utils.fillTemplateString(guild.lang.command_admin_reserved, {w: command});
    Utils.showMessageAndDelete(msg, str);
}

function showInvalidCommand(command: string, msg: Message, guild: Server) {
    const str = Utils.fillTemplateString(guild.lang.command_not_found, {w: command});
    //todo: str += la string d'aide générale, bien longue.
    Utils.showMessageAndDelete(msg, str);
}


async function testMethod(msg: Discord.Message) {
    if (msg.content.startsWith("test")) {
        let author = msg.author;
        let channel = msg.channel as TextChannel;
        let nms : Discord.Message | null = null;

        let guild = guilds.get(msg.guild.id)!;
        let chan = guild.guild.client.channels.get(guild.botChan);
        if (chan == undefined || !(chan instanceof TextChannel))
            return Utils.panicError(Utils.fillTemplateString(guild.lang.error_text_channel_not_found, {w: guild.prefix}) , msg, channel, guild);

        try {
           nms = await chan.send("hello") as Discord.Message;
        } catch (e) {
            console.log(e);
            return Utils.panicError(Utils.fillTemplateString(guild.lang.error_chan_general, {w: channel.name}), msg, channel, guild);
        }

        let testI = 0;
        setInterval(async function () {
            if (nms) {
                if (nms.deleted)
                    nms = await (chan!! as TextChannel).send("you tried to erase me, you punk? " + testI) as Message;
                else
                    await nms.edit("world " + testI);
                testI++
            }
        }, 15 * 1000);
    }
}

client.on('message', msg => {
        testMethod(msg);

        if (msg.guild) {
            //console.log(msg.guild.roles.find("name", "notExisting"));
            //console.log(msg.guild.roles.find("name", "modoAutogéré"));
            if (guilds.has(msg.guild.id)) {
                const guild = guilds.get(msg.guild.id)!;
                if (!msg.content.startsWith(guild.prefix))
                    return;
                const command = msg.content.substring(guild.prefix.length).trim();
                //commands are localized: get the command title
                const commandArray = command.split(" ");
                const CommandName = commandArray[0];
                const title = Utils.getKeyByValue(guild.lang, CommandName);
                if (title === undefined)
                    return showInvalidCommand(CommandName, msg, guild);
                if (Commands.adminC.hasOwnProperty(title)) {
                    if (!(msg.member && msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD!)) &&
                        !(msg.member && Utils.userHasRole(guild.admRoles, msg.member.roles.array())))
                        return showInvalidRightsCommand(CommandName, msg, guild);
                    Commands.adminC[title].callback(commandArray.slice(1), msg, guild);
                    return;
                }

                if (!Commands.userC.hasOwnProperty(title))
                    return showInvalidCommand(CommandName, msg, guild);
                Commands.userC[title].callback(commandArray.slice(1), msg, guild);
            } else if ((msg.content).replace(/ /g, '') === "pyconfigure" &&
                msg.member && msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD!)) {
                addUserToInit(msg, sql, guilds).then();
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

client.login(token).then();
