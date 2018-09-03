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

var gObj = {
    id: 42,
    name: "testServer",
    roles: {
        find: function (fn: any): Object | undefined {
            if (fn({name: "admin"}) || fn({name: "modo"}))
                return {id: 89};
        }
    },
    channels: {
        find: function (fn: any): Object | undefined {
            if (fn({name: "vocal"}))
                return {id: 78, type: "voice", name: ""};
            if (fn({name: "botchan"}))
                return {id: 79, type: "text", name: ""};
        }
    }
};

// @ts-ignore
var guild = <Guild>gObj;

var channel = <DMChannel> {
    send: function (res: string) {
        this.lastMessageID = res
    }
};

var guild2 = Object.assign({}, guild, {id: 43, name: "newServer"});

DbUtils.createTables(sql);
var tableCount = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table'").pluck().get();
assert.equal(tableCount, 3);
assert.equal(DbUtils.isServerInDB("42", sql), false);
// @ts-ignore
var testServer = new Server(sql, guild, "py", "fr", [1, 2], [3, 4], 5, 7, true, true);
assert(DbUtils.isServerInDB("42", sql));

var sameServer = new Server(sql, guild);
assert.equal(sameServer.id, 42);
//assert(Array.isArray(sameServer.vocChan));
assert.equal(sameServer.vocChan, 5);
assert.equal(sameServer.botChan, 7);
assert.equal(sameServer.topSpeaker, true);


DbUtils.updateUserValues("tuxlu", 42, sql, 1, 2, 0);
DbUtils.updateUserValues("tuxlu", 42, sql, 12, 8, 10);
var upResults = sql.prepare("SELECT posVotes, negVotes, speakTime FROM users WHERE (name='tuxlu' AND serverId=42);").get();
assert(upResults.posVotes === 13 && upResults.negVotes === 10 && upResults.speakTime === 10);

var cfServer = new Server(sql, guild2);
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
    var res = await cfServer.setVocChan("vocal", channel);
    assert(res);
    res = await cfServer.setVocChan("botChan", channel);
    assert(res === false);
    res = await cfServer.setBotChan("#botChan", channel);
    assert(res);
    cfServer.completeInit();
    assert(DbUtils.isServerInDB(cfServer.id, sql));
    cfServer.delete();
}

testAsyncMethods(cfServer);

//dbUtils.createReview("testServeur", "utilisateur", "ceci est une review");

testServer.soft_delete(sql, channel);
var tableSoftDeleted = sql.prepare("SELECT left FROM servers WHERE id = 42").pluck().get();
assert.equal(tableSoftDeleted, 1);


testServer.delete(sql, channel);
assert.equal(DbUtils.isServerInDB("42", sql), false);
