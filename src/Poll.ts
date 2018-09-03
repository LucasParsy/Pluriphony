import Discord from "discord.js";

var pMap = new Map();

export default class Poll {
    static createPoll(params: Array<String>, msg: Discord.Message, sql: any) {
        msg.reply("creating poll soon");
    }

    static addChoicePoll(params: Array<String>, msg: Discord.Message, sql: any) {
    }

    static removeChoicePoll(params: Array<String>, msg: Discord.Message, sql: any) {
    }
};
