const Server = require('./server.js');
import SQLite from "better-sqlite3";
import Discord, {DMChannel} from "discord.js";


var userCollected: Array<number> = [];

module.exports =
    {
        addUserToInit: function (msg: Discord.Message, sql: SQLite, guilds: Map<number, any>) {
            msg.author.createDM().then((channel: DMChannel) => {
                const filter = (m: any) => {
                    return !m.author.bot
                };

                var msgId = msg.author.id;
                if (userCollected.indexOf(msgId) !== -1)
                    return;

                userCollected.push(msgId);
                const collector = channel.createMessageCollector(filter);

                var server = new Server(sql, msg.guild);
                var step = 0;
                var methods = ["setLang", "setPrefix", "setAdminRoles", "setModRoles",
                    "setVocChan", "setBotChan", "setRateSpeaker", "setTopSpeaker"];
                var prompts = ["langPrompt", "prefixPrompt", "adminRolePrompt", "modRolePrompt",
                    "vocChanPrompt", "botChanPrompt", "rateSpeakerPrompt", "topSpeakerPrompt"];

                msg.delete();
                channel.send(server.lang[prompts[0]]);
                collector.on('collect', async function (msg: any) {
                    msg.content = msg.content.trim();
                    console.log(`Collected ${msg.content}`);

                    var resBool = await server[methods[step]](msg.content, channel);
                    if (resBool)
                        step++;

                    if (step !== prompts.length)
                        channel.send(server.lang[prompts[step]]);
                    else {
                        channel.send(server.lang.endedInit);
                        server.completeInit();
                        guilds.set(server.id, server);
                        collector.stop();
                        channel.delete();
                        var index = userCollected.indexOf(msgId);
                        if (index !== -1)
                            userCollected.splice(index, 1);
                    }
                });
            }).catch((err: any) => {
                console.log(err);
                console.log(`DM channel not created:  ${err}`);
            });
        }

    };