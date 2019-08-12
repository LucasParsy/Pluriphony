import Discord from "discord.js";
import Server from "./server";
import Utils from "./utils";
import {addUserToInit} from "./firstConfigure";

type TextChan = Discord.DMChannel | Discord.TextChannel

async function serverCall(params: Array<String>, msg: Discord.Message, callback: string, server: Server) {
    let parStr = params.join();
    if (parStr.length == 0) {
        let nms = await msg.reply(Utils.fillTemplateString(server.lang.error_no_args_command, {w: server.prefix})) as Discord.Message;
        nms.delete(60 * 1000);
        msg.delete(60 * 1000);
        return;
    }
    server[callback](parStr, msg.channel as TextChan);
}

export default class ServerCommands {
    static setLang = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setLang", server);
    static setPrefix = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setPrefix", server);
    static setAdminRoles = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setAdminRoles", server);
    static setModRoles = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setModRoles", server);
    static setVocChan = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setVocChan", server);
    static setBotChan = (params: Array<String>, msg: Discord.Message, server: Server) => serverCall(params, msg, "setBotChan", server);
    static configure = (params: Array<String>, msg: Discord.Message, server: Server) => addUserToInit(msg, server.sql, undefined, server);
}
