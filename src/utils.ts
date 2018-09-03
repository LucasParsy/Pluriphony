import Discord, {Guild, Message, TextChannel} from "discord.js";


export default class Utils {

    static fillTemplateString(templateString: String, templateVars: Object) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }


    static getKeyByValue(object: Object, value: String) {
        return Object.keys(object).find(key => object[key] === value);
    }

    static userHasRole(haystack: Array<String>, arr: Array<Discord.Role>) {
        return arr.some(function (v) {
            return haystack.includes(v.id);
        });
    }

    static showMessageAndDelete(msg: Discord.Message, str: String) {
        msg.reply(str)
            .then(sent => {
                if (sent instanceof Discord.Message) {
                    sent.delete(1000 * 60);
                    msg.delete(1000 * 60);
                }
                msg.delete(1000 * 60);
            })
            .catch(console.error);
    }
}
