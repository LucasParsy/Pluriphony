import Discord from "discord.js";

var Polls = new Map();

module.exports = {
    createPoll: function (params: Array<String>, msg: Discord.Message, sql: any) {
        msg.reply("creating poll soon");
    },

    addChoicePoll: function (params: Array<String>, msg: Discord.Message, sql: any) {
    },

    removeChoicePoll: function (params: Array<String>, msg: Discord.Message, sql: any) {
    }
};
