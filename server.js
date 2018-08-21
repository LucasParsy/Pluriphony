const ServerInit = require('./serverInit.js');
const dbUtils = require('./database.js');


class Server extends ServerInit {

    constructor(sql, guild, prefix, lang, admRoles, modRoles, vocChans, botChan, rateSpeaker, topSpeaker) {
        super(sql, guild, prefix, lang, admRoles, modRoles, vocChans, botChan, rateSpeaker, topSpeaker);
    }

    soft_delete(sql, chan) {
        if (!dbUtils.isServerInDB(this.id, sql))
            return;
        console.log("soft-deleting table " + this.name);
        chan.send(this.lang.deletingTable);
        var command = sql.prepare("UPDATE servers SET left = 1 WHERE (id=?);");
        command.run(this.id);
    }

    delete(sql, chan) {
        if (!dbUtils.isServerInDB(this.id, sql))
            return;
        console.log("deleting table " + this.name);
        chan.send(this.lang.deletingTable);
        command = sql.prepare("DELETE FROM users WHERE (serverId=?);");
        command.run(this.id);
        var command = sql.prepare("DELETE FROM servers WHERE (id=?);");
        command.run(this.id);
    }
}

module.exports = Server;