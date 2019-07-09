import Discord from "discord.js";
import SQLite from "better-sqlite3";
import Poll from "./poll";

interface commandCallback {
    (params: Array<String>, msg: Discord.Message, sql: SQLite.Database): void
}

interface commandCallbackObject {
    [index: string]: commandCallback
}

export default class Commands {

    static adminC: commandCallbackObject = {
        command_create_poll: Poll.createPoll,
        command_del_poll_choice: Poll.removeChoicePoll,
    };

    static userC: commandCallbackObject = {
        command_add_poll_choice: Poll.addChoicePoll,
    };


};
