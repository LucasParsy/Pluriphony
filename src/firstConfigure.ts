import Server from "./server";
import SQLite from "better-sqlite3";
import Discord, {DMChannel} from "discord.js";
import Utils from "./utils";


const guildsCollected: Array<string> = [];

export async function addUserToInit(msg: Discord.Message, sql: SQLite.Database, guilds?: Map<string, Server>, server: Server = new Server(sql, msg.guild)) {
    let channel: DMChannel;
    try {
        channel = await msg.author.createDM();
    } catch (e) {
        return console.log(`DM channel not created:  ${e}`);
    }

    const filter = (m: Discord.Message) => {
        return !m.author.bot
    };

    const guildId = msg.guild.id;
    if (guildsCollected.indexOf(guildId) !== -1) {
        await msg.reply("someone is already configuring this bot!");
        return;
    }

    guildsCollected.push(guildId);
    const collector = channel.createMessageCollector(filter, {time: 1000 * 60 * 30});


    let step = 0;
    const methods = ["setLang", "setPrefix", "setAdminRoles", "setModRoles",
        "setVocChan", "setBotChan", "setRateSpeaker", "setTopSpeaker"];
    const prompts = <Array<string>>["langPrompt", "prefixPrompt", "adminRolePrompt", "modRolePrompt",
        "vocChanPrompt", "botChanPrompt", "rateSpeakerPrompt", "topSpeakerPrompt"];

    msg.delete();
    await channel.send(server.lang.initWelcome);
    channel.send(server.lang[prompts[0]]);
    collector.on('collect', async function (msg: Discord.Message) {
        msg.content = msg.content.trim();
        //console.log(`Init: collected ${msg.content}`);

        const resBool = await server[methods[step]](msg.content, channel);
        if (resBool)
            step++;

        if (step !== prompts.length)
            channel.send(server.lang[prompts[step]]);
        else {
            channel.send(Utils.fillTemplateString(server.lang.endedInit, {w: server.prefix}));
            if (guilds)
                server.completeInit();
            collector.stop("ended Init");
            await channel.delete();
            const index = guildsCollected.indexOf(guildId);
            if (index !== -1)
                guildsCollected.splice(index, 1);
            if (guilds)
                guilds.set(server.id, server);
        }
    });
}
