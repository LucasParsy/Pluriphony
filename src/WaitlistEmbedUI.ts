import Discord from "discord.js";
import Server from "./server";
import Utils from "./utils";
import {WaitingStatus, WaitlistUserInfo} from "./WaitlistUserInfo";

function _formatTime(seconds: number): string {
    const moduloTime = 15;
    seconds -= seconds % moduloTime;

    let minutes = Math.floor((seconds % 3600) / 60);
    let hours = Math.floor(seconds / 3600);

    let minutesInitial = "mn";
    let res = "";
    if (seconds % 60 != 0 || (hours == 0 && minutes == 0)) {
        minutesInitial = "m";
        res = `${seconds % 60}s`;
    }
    if (minutes != 0)
        res = `${minutes}${minutesInitial}${res}`;
    if (hours != 0)
        res = `${hours}h${res}`;
    return res;
}

function _getUserFormattedName(user: WaitlistUserInfo): string {
    let parts = user.name.split("#");
    return `${parts[0]}\`#${parts[1]}\``;
}

function _getIconFromStatus(status: WaitingStatus) {
    switch (status) {
        case WaitingStatus.BASE:
            return "";
        case WaitingStatus.DOWN:
            return ":arrow_down: ";
        case WaitingStatus.UP:
            return ":arrow_up: ";
        case WaitingStatus.NEW:
            return ":new: ";
        case WaitingStatus.AFK:
            return ":zzz: ";
    }
}

export default class WaitlistEmbedUI {


    /*
    @brief: generate the content header for the Waitlist
    @param {number} speakingTime the time each person is allowed to talk. only informative.
    @param {string} the name of the vocal channel
    @param {Server} guild : the general server infos, used for localized strings
    @return {Discord.RichEmbed} the header
    */
    static generateWaitlistContentHeader(speakingTime: number, channelName: string, guild: Server): string {
        let formattedTime = _formatTime(speakingTime);
        let title = Utils.fillTemplateString(guild.lang.debate_title, {w: channelName});
        if (speakingTime != 0)
            title += Utils.fillTemplateString(guild.lang.debate_subtitle_speaking_time, {w: formattedTime});
        return title;
    }

    /*
        @brief: generate the embed for the Waitlist from the parameters
        @param {Array<WaitlistUserInfo>} usersSpeaking the list of users on the vocal channel
        @param {Array<WaitlistUserInfo>} usersWaiting the list of users on the waitlist
        @param {Server} guild : the general server infos, used for localized strings
        @return {Discord.RichEmbed} the beautiful embed
    */
    static generateWaitlistEmbed(usersSpeaking: Array<WaitlistUserInfo>, usersWaiting: Array<WaitlistUserInfo>,
                                 guild: Server): Discord.RichEmbed {
        let embed = new Discord.RichEmbed();

        embed.setFooter(guild.lang.waitlist_footer);
        embed.setColor("ORANGE"); //or 12548932
        embed.addField(`:microphone2: ${guild.lang.airing_title} :microphone2:`,
            "**-----------------------**");

        if (usersSpeaking.length == 0)
            embed.addField(guild.lang.waitlist_nobody_speaking_title, guild.lang.waitlist_nobody_speaking_subtitle);

        for (let user of usersSpeaking) {
            let crownString = user.isAdmin ? " :crown:" : "";
            embed.addField(_getUserFormattedName(user) + crownString,
                Utils.fillTemplateString(guild.lang.airing_subtitle, {
                    w: `${_formatTime(user.time)}`,
                    effectiveTime: _formatTime(user.timeEffectiveSpeaking)
                }));
        }

        embed.addField("-----------------------", "\u200b");
        embed.addField(`:clock2: ${guild.lang.waitlist_title} :clock2:`,
            "-----------------------");

        if (usersWaiting.length == 0)
            embed.addField(guild.lang.waitlist_nobody_waiting_title, guild.lang.waitlist_nobody_waiting_subtitle);

        usersWaiting.forEach((user, index) => {
            const waitingIcon = _getIconFromStatus(user.waitingStatus);
            embed.addField(`${index + 1}: ${_getUserFormattedName(user)}`,
                Utils.fillTemplateString(guild.lang.waiting_subtitle,
                    {i: waitingIcon, w: _formatTime(user.time)}));

        });
        embed.addField("-----------------------", "\u200b");
        embed.addField(guild.lang.waitlist_bottom_help_title, guild.lang.waitlist_bottom_help_subtitle);

        return embed;
        //embed.setThumbnail("https://raw.githubusercontent.com/LucasParsy/Pluriphony/master/logo.png");
    }
}
