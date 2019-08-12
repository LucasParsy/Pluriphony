import Discord from "discord.js";
import SQLite from "better-sqlite3";
import Server from "./server";

var pMap = new Map();

export default class Poll {
    static createPoll(params: Array<String>, msg: Discord.Message, server: Server) {
        msg.reply("creating poll soon");
    }

    static addChoicePoll(params: Array<String>, msg: Discord.Message, server: Server) {
    }

    static removeChoicePoll(params: Array<String>, msg: Discord.Message, server: Server) {
    }
};
