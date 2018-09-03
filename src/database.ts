import fs from 'fs';
import path from "path";


const reviewsFile = fs.createWriteStream(path.join(__dirname, '..', 'db', "reviews.txt"), {flags: 'a'});

function

createSingleTable(parameters: { name: string, command: string, sql: any }) {
    let {name, command, sql} = parameters;
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = ?;").get(name);
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare(command).run();

        // Ensure that the "id" row is always unique and indexed.
    }
}


export default class DbUtils {
    static createTables(sql: any) {
        console.log("creating tables");
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
        createSingleTable({
            name: "servers",
            command: "CREATE table servers (id INTEGER PRIMARY KEY, name TEXT, prefix TEXT, lang TEXT, admRoles TEXT, modRoles TEXT," +
                " vocChans TEXT, botChan TEXT, rateSpeaker INTEGER , topSpeaker INTEGER, statTotComm INTEGER," +
                " statMaxWaitlist INTEGER, left INTEGER DEFAULT 0 CHECK (rateSpeaker IN (0,1) AND topSpeaker IN (0,1) AND left IN (0,1)));",
            sql: sql
        });
        sql.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_servers ON servers (id);").run();


        createSingleTable({
            name: "users",
            command: "CREATE table users (name TEXT, serverId INTEGER, posVotes INTEGER, negVotes INTEGER, speakTime INTEGER, " +
                "FOREIGN KEY(serverId) REFERENCES servers(id));",
            sql: sql
        });

        createSingleTable({
            name: "polls",
            command: "CREATE table polls (serverId INTEGER, voteTime INTEGER, numVotes INTEGER, numChoices INTEGER, " +
                "publicQuestionAdd INTEGER, FOREIGN KEY(serverId) REFERENCES server(id));",
            sql: sql
        });
    }


    static addPollToDatabase(parameters: { serverId: number, voteTime: number, numVotes: number, numChoices: number, publicQuestionAdd: boolean, sql: any }) {
        let {serverId, voteTime, numVotes, numChoices, publicQuestionAdd, sql} = parameters;
        var command = sql.prepare("INSERT into polls VALUES (?, ?, ?, ?, ?);");
        command.run(serverId, voteTime, numVotes, numChoices, publicQuestionAdd ? 1 : 0)
    }


    static createReview(serverName: string, username: string, review: string) {
        const res = new Date().toLocaleString() + "  " + serverName + " , " + username + "\n" + review + "\n\n";
        reviewsFile.write(res)
    }


    static isServerInDB(id: string, sql: any) {
        const command = sql.prepare("SELECT id FROM servers WHERE (id=?);");
        const res = command.get(id);
        return (res !== undefined)
    }


    static isUserInDB(name: string, server: number, sql: any) {
        var command = sql.prepare("SELECT serverId FROM users WHERE (name=? AND serverId=?);");
        var res = command.get(name, server);
        return (res !== undefined)
    }

    static updateUserValues(name: string, server: number, sql: any, posVotes: number, negVotes: number, speakTime: number) {
        var command = sql.prepare("SELECT posVotes, negVotes, speakTime FROM users WHERE (name=? AND serverId=?);");
        var res = command.get(name, server);
        if (res === undefined) {
            command = sql.prepare("INSERT into users VALUES (?, ?, ?, ?, ?);");
            command.run(name, server, posVotes, negVotes, speakTime);
        }
        else {
            command = sql.prepare("UPDATE users SET posVotes = ? , negVotes = ?, speakTime = ? WHERE (name=? AND serverId=?);");
            command.run(posVotes + res.posVotes, negVotes + res.negVotes, speakTime + res.speakTime, name, server);
        }
    }

}
