import Discord, {Guild, Message, TextChannel} from "discord.js";

export default class Utils {

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
}


