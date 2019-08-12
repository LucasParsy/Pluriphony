import Discord, {Emoji, Guild, Message, TextChannel} from "discord.js";
import Server from "./server";

export default class Utils {


    /*
    @brief: find a channel given its name
    when sending from a guild a "#channel" message, Discord will change it to "<#1234567>" (the chan id)...
    @param {string} the name of the channel
    @param [Discord.Guild} the guild from the received message
    @return {undefined | Discord.Channel} the found channel or undefined if not found
     */
    static findChan(name: string, guild: Discord.Guild): undefined | Discord.Channel {
        if (name.startsWith("<") && name.endsWith(">"))
            return guild.channels.get(name.slice(2, name.length - 1));
        else
            return guild.channels.find(value => value.name === name.trim());
    }

    /*
    @brief: same as above, but with role.
    @param {string} the name of the role
    @param [Discord.Guild} the guild from the received message
    @return {undefined | Discord.Role} the found role or undefined if not found
     */
    static findRole(name: string, guild: Discord.Guild): undefined | Discord.Role {
        if (name.startsWith("<") && name.endsWith(">"))
            return guild.roles.get(name.slice(3, name.length - 1));
        else
            return guild.roles.find(value => value.name === name.trim());
    }

    /*

    static getLetterEmoji(letter: number) {
        return (":regional_indicator_" + String.fromCharCode(97 + letter) + ":")
    }


    static fillTemplateString(templateString: string, templateVars: Object) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }

    static getKeyByValue(object: LocStrings, value: string): string | undefined {
        return Object.keys(object).find(key => object[key] === value);
    }

    static userHasRole(haystack: Array<string>, arr: Array<Discord.Role>): boolean {
        return arr.some(function (v) {
            return haystack.includes(v.id);
        });
    }

    static showMessageAndDelete(msg: Discord.Message, str: string) {
        msg.reply(str)
            .then(sent => {
                if (sent instanceof Discord.Message)
                    sent.delete(1000 * 60).then();
                msg.delete(1000 * 60);
            })
            .catch(console.error);
    }

    static boolToSQLInt = (b: boolean): number => b ? 1 : 0;
    static SQLIntToBool = (i: number): boolean => i === 1;

    //see https://stackoverflow.com/questions/51447954/sending-a-message-the-first-channel-with-discord-js
//flipped "type == "text" condition, seems wrong. Needs to be verified.
    static getFirstTextChannel(guild: Guild): TextChannel | null {
        const sortedChannels = guild.channels.sort(function (chan1, chan2) {
            if (chan1.type !== "text") return -1;

            const perm = chan1.permissionsFor(guild.me);
            if (perm === null || !perm.has("SEND_MESSAGES")) return -1;
            return chan1.position < chan2.position ? -1 : 1;
        });

        const chan = sortedChannels.first();
        if (chan instanceof TextChannel)
            return chan;
        return null;
    }
}


