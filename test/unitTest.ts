import assert from "assert";
import path from 'path';
import fs from 'fs';
import SQLite from "better-sqlite3";
import {DMChannel, Role, Guild} from "discord.js";

import Server from "../src/server";
import DbUtils from '../src/database.js';

const tableName = path.join(__dirname, '..', 'db', 'unitTest-table.sqlite');


if (fs.existsSync(tableName))
    fs.unlinkSync(tableName);
const sql = new SQLite(tableName);

const gObj = {
    id: "42",
    name: "testServer",
    roles: {
        find: function (fn: any): Object | undefined {
            if (fn({name: "admin"}) || fn({name: "modo"}))
                return {id: "89"};
        }
    },
    channels: {
        find: function (fn: any): Object | undefined {
            if (fn({name: "vocal"}))
                return {id: "78", type: "voice", name: ""};
            if (fn({name: "botchan"}))
                return {id: "79", type: "text", name: ""};
        }
    }
};

// @ts-ignore
const guild = <Guild>gObj;

const channel = <DMChannel>{
    send: function (res: string) {
        this.lastMessageID = res
    }
};

const guild2 = Object.assign({}, guild, {id: "43", name: "newServer"});

DbUtils.createTables(sql);
const tableCount = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table'").pluck().get();
assert.strictEqual(tableCount, 3);
assert.strictEqual(DbUtils.isServerInDB("42", sql), false);
// @ts-ignore
const testServer = new Server(sql, guild, "py", "fr", ["1", "2"], ["3", "4"], "5", "7", true, true);
assert(DbUtils.isServerInDB("42", sql));

const sameServer = new Server(sql, guild);
assert.strictEqual(sameServer.id, "42");
//assert(Array.isArray(sameServer.vocChan));
assert.strictEqual(sameServer.vocChan, "5");
assert.strictEqual(sameServer.botChan, "7");
assert.strictEqual(sameServer.topSpeaker, true);


DbUtils.updateUserValues("tuxlu", 42, sql, 1, 2, 0);
DbUtils.updateUserValues("tuxlu", 42, sql, 12, 8, 10);
const upResults = sql.prepare("SELECT posVotes, negVotes, speakTime FROM users WHERE (name='tuxlu' AND serverId=42);").get();
assert(upResults.posVotes === 13 && upResults.negVotes === 10 && upResults.speakTime === 10);

const cfServer = new Server(sql, guild2);
assert(!DbUtils.isServerInDB(guild2.id, sql));
assert(cfServer.setLang("wrong", channel) === false);
assert(channel.lastMessageID.startsWith(cfServer.lang.invalid_lang));
assert(cfServer.setLang("fr", channel));
assert(cfServer.setPrefix("py", channel));
assert(cfServer.setAdminRoles("admin, modo", channel));
assert(cfServer.setModRoles("modo", channel));
assert(cfServer.setRateSpeaker("y", channel));
assert(cfServer.setTopSpeaker("n", channel));


async function testAsyncMethods(cfServer: Server) {
    let res = await cfServer.setVocChan("vocal", channel);
    assert(res);
    res = await cfServer.setVocChan("botChan", channel);
    assert(!res);
    res = await cfServer.setBotChan("#botChan", channel);
    assert(res);
    cfServer.completeInit();
    assert(DbUtils.isServerInDB(cfServer.id, sql));
    cfServer.delete();
}

// noinspection JSIgnoredPromiseFromCall
testAsyncMethods(cfServer);

//dbUtils.createReview("testServeur", "utilisateur", "ceci est une review");

testServer.soft_delete();
const tableSoftDeleted = sql.prepare("SELECT left FROM servers WHERE id = 42").pluck().get();
assert.strictEqual(tableSoftDeleted, 1);


testServer.delete();
assert.strictEqual(DbUtils.isServerInDB("42", sql), false);
