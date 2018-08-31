import ServerInit = require('./serverInit.js');

const dbUtils = require('./database.js');

export class Server extends ServerInit.ServerInit {

    soft_delete() {
        if (!dbUtils.isServerInDB(this.id, this.sql))
            return;
        console.log("soft-deleting table " + this.name);
        //chan.send(this.lang.deletingTable);
        const command = this.sql.prepare("UPDATE servers SET left = 1 WHERE (id=?);");
        command.run(this.id);
    }

    delete() {
        if (!dbUtils.isServerInDB(this.id, this.sql))
            return;
        console.log("deleting table " + this.name);
        //chan.send(this.lang.deletingTable);
        let command = this.sql.prepare("DELETE FROM users WHERE (serverId=?);");
        command.run(this.id);
        command = this.sql.prepare("DELETE FROM servers WHERE (id=?);");
        command.run(this.id);
    }
}