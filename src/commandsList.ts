import Discord, {TextChannel} from "discord.js";
import SQLite from "better-sqlite3";
import Poll from "./poll";
import Server from "./server";
import {WaitingStatus} from "./WaitlistUserInfo";
import ServerCommands from "./ServerCommands";
import Utils from "./utils";

interface commandCallback {
    (params: Array<String>, msg: Discord.Message, server: Server): void
}

interface CommandInfos {
    callback: commandCallback; //Discord.User.tag
    help: string;
}

interface commandCallbackObject {
    [index: string]: CommandInfos
}


export default class Commands {

    static adminC: Record<string, CommandInfos> = {
        "command_set_lang": {callback: ServerCommands.setLang, help: "langPrompt"},
        "command_set_prefix": {callback: ServerCommands.setPrefix, help: "prefixPrompt"},
        "command_set_admin_roles": {callback: ServerCommands.setAdminRoles, help: "adminRolePrompt"},
        "command_set_mod_roles": {callback: ServerCommands.setModRoles, help: "modRolePrompt"},
        "command_set_voc_chan": {callback: ServerCommands.setVocChan, help: "vocChanPrompt"},
        "command_set_bot_chan": {callback: ServerCommands.setBotChan, help: "botChanPrompt"},
        "command_configure": {callback: ServerCommands.configure, help: "configure_help"},
        //command_create_poll: { callback: Poll.createPoll, help: "invalid_chan"},
        //command_del_poll_choice: { callback: Poll.removeChoicePoll, help: "invalid_chan"}
    };

    static userC: commandCallbackObject = {
        "command_help": {callback: Commands.help, help: "helpPrompt"},
        //command_add_poll_choice: { callback: Poll.addChoicePoll, help: "invalid_chan"}
    };

    static async help(params: Array<String>, msg: Discord.Message, server: Server) {
        let embed = new Discord.RichEmbed();

        embed.setTitle(server.lang.help_title);

        if (msg.member && ((msg.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD!)) ||
            (Utils.userHasRole(server.admRoles, msg.member.roles.array())))) {
            embed.addField(server.lang.help_admin_commands_title, "**-----------------------**");
            for (let title in Commands.adminC)
                embed.addField(server.lang[title], server.lang[Commands.adminC[title].help]);
            embed.addField("-----------------------", "\u200b");
        }
        for (let title in Commands.userC)
            embed.addField(server.lang[title], server.lang[Commands.userC[title].help]);

        let nms = await msg.reply(embed) as Discord.Message;
        msg.delete(1000 * 60);
        nms.delete(1000 * 60);
    }
};
