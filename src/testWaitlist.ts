import Discord, {Message} from "discord.js";
import {WaitingStatus, WaitlistUserInfo} from "./WaitlistUserInfo";
import WaitlistEmbedUI from "./WaitlistEmbedUI";
import WaitlistReactions from "./WaitlistReactions";
import Server from "./server";

async function testMockWaitlist(msg: Discord.Message, guilds: Map<string, Server>) {
    let usersSpeaking: Array<WaitlistUserInfo> = [
        {
            name: "Usul#1234",
            isAdmin: true,
            time: 3600 + 20 * 60,
            timeEffectiveSpeaking: 42 * 60,
            waitingStatus: WaitingStatus.BASE
        },
        {
            name: "Louis-émile#4567",
            isAdmin: false,
            time: 10 * 60,
            timeEffectiveSpeaking: 8 * 60 + 30,
            waitingStatus: WaitingStatus.BASE
        },
        {
            name: "Unul#0000",
            isAdmin: false,
            time: 10 * 60,
            timeEffectiveSpeaking: 2 * 60 + 10,
            waitingStatus: WaitingStatus.BASE
        }];
    let usersWaiting: Array<WaitlistUserInfo> = [
        {
            name: "Karim#1234",
            isAdmin: false,
            time: 3600 + 45 * 60,
            timeEffectiveSpeaking: 42 * 60,
            waitingStatus: WaitingStatus.UP
        },
        {
            name: "Lucas#0102",
            isAdmin: false,
            time: 45 * 60 + 45,
            timeEffectiveSpeaking: 8 * 60 + 30,
            waitingStatus: WaitingStatus.DOWN
        },
        {
            name: "DanielV#1337",
            isAdmin: false,
            time: 30 * 60,
            timeEffectiveSpeaking: 2 * 60 + 10,
            waitingStatus: WaitingStatus.AFK
        },
        {
            name: "Ost#0564",
            isAdmin: false,
            time: 2 * 60,
            timeEffectiveSpeaking: 2 * 60 + 10,
            waitingStatus: WaitingStatus.NEW
        }
    ];
    let embed = WaitlistEmbedUI.generateWaitlistEmbed(usersSpeaking, usersWaiting, guilds.get(msg.guild.id)!);
    let content = WaitlistEmbedUI.generateWaitlistContentHeader(300, "test Channel", guilds.get(msg.guild.id)!);

    let nmsg = await msg.channel.send(content, embed) as Message;
    await WaitlistReactions.setupReactions(nmsg);
}