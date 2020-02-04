import Discord, {TextChannel, VoiceChannel} from "discord.js";

import Server from "./server";
import Utils from "./utils";
import WaitlistReactions from "./WaitlistReactions";
import WaitlistEmbedUI from "./WaitlistEmbedUI";
import {WaitlistUserInfo} from "./WaitlistUserInfo";


export class Debate {
    public botChan: string;
    public vocChan: string;
    public streamerMode: boolean;
    public waitTime: number;

    static verifyChannels(bChan: string, vChan: string, streamer: boolean, server: Server, msg: Discord.Message): boolean {
        let chan = server.guild.client.channels.get(bChan);
        if (chan == undefined || !(chan instanceof TextChannel)) {
            return false;
        }
        let perm = chan.permissionsFor(server.guild.me);
        if (perm === null || !perm.has("SEND_MESSAGES")) {
            return false;
        }
        // !perm.has("MANAGE_MESSAGES") //supprimer message des autres

        chan = server.guild.client.channels.get(vChan);
        if (chan == undefined || !(chan instanceof VoiceChannel)) {
            return false;
        }
        perm = chan.permissionsFor(server.guild.me);
        if (perm === null || !perm.has("CONNECT")) {
            return false;
        }
        if (streamer) {
            if (!perm.has("MOVE_MEMBERS"))
                msg.reply("WARNING NO AUTOMOVE");
        } else {
            if (!perm.has("MUTE_MEMBERS") && !streamer)
                msg.reply("WARNING NO MUTE");
        }


        return true;
    }

    constructor(bChan: string, vChan: string, sMode: boolean, waitTime: number) {
        this.botChan = bChan;
        this.vocChan = vChan;
        this.streamerMode = sMode;
        this.waitTime = waitTime;
    }

}


async function updateWaitlistStatus(speakingTime: number, channelName: string, guild: Server) {
    let speakerInfos = fillSpeakingUserInfo();
    let waitingInfos = fillWaitlistInfo();
    let contentHeader = WaitlistEmbedUI.generateWaitlistContentHeader(speakingTime, channelName, guild);
    let embed = WaitlistEmbedUI.generateWaitlistEmbed(speakerInfos, waitingInfos, guild);

    let botchan: Discord.Channel | undefined = guild.guild.client.channels.get(guild.botChan);
    if (botchan == undefined || !(botchan instanceof TextChannel)) {

    } else {
        let msg: Discord.Message = await botchan.send(contentHeader, embed) as Discord.Message;
        await WaitlistReactions.setupReactions(msg);

        try {
            msg = await msg.edit(contentHeader, embed);
        } catch (e) {

        }

    }

}

function fillSpeakingUserInfo(): Array<WaitlistUserInfo> {
    return [];
}

function fillWaitlistInfo(): Array<WaitlistUserInfo> {
    return [];
}
