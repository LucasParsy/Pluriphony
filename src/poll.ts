import Discord from "discord.js";
import SQLite from "better-sqlite3";

var pMap = new Map();

export default class Poll {
    static createPoll(params: Array<String>, msg: Discord.Message, sql: SQLite) {
        msg.reply("creating poll soon");
    }

    static addChoicePoll(params: Array<String>, msg: Discord.Message, sql: SQLite) {
    }

    static removeChoicePoll(params: Array<String>, msg: Discord.Message, sql: SQLite) {
    }
};
