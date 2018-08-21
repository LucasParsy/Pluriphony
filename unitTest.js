const assert = require('assert');

var fs = require('fs');
const SQLite = require("better-sqlite3");

const dbUtils = require('./database.js');
const Server = require('./server.js');


const tableName = './db/unitTest-table.sqlite';
if (fs.existsSync(tableName))
    fs.unlinkSync(tableName);
const sql = new SQLite(tableName);

var guild = {
    id: 42,
    name: "testServer",
    roles: {
        find: function (a, b) {
            if (b === "admin" || b === "modo")
                return {id: 89};
        }
    },
    channels: {
        find: function (a, b) {
            if (b === "vocal")
                return {id: 78, type: "voice"};
            if (b === "botChan")
                return {id: 79, type: "text"};
        }
    }
};


var channel = {
    str: "",
    send: function (res) {
        this.str = res
    }
};

var guild2 = Object.assign({}, guild, {id: 43, name: "newServer"});

dbUtils.createTables(sql);
var tableCount = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table'").pluck().get();
assert.equal(tableCount, 3);
assert.equal(dbUtils.isServerInDB(42, sql), false);
var testServer = new Server(sql, guild, "py", "fr", [1, 2], [3, 4], 5, 7, true, true);
assert(dbUtils.isServerInDB(42, sql));

var sameServer = new Server(sql, guild);
assert.equal(sameServer.id, 42);
//assert(Array.isArray(sameServer.vocChans));
assert.equal(sameServer.vocChans, 5);
assert.equal(sameServer.botChan, 7);
assert.equal(sameServer.topSpeaker, true);


dbUtils.updateUserValues("tuxlu", 42, sql, 1, 2, 0);
dbUtils.updateUserValues("tuxlu", 42, sql, 12, 8, 10);
var upResults = sql.prepare("SELECT posVotes, negVotes, speakTime FROM users WHERE (name='tuxlu' AND serverId=42);").get();
assert(upResults.posVotes === 13 && upResults.negVotes === 10 && upResults.speakTime === 10);

var cfServer = new Server(sql, guild2);
assert(!dbUtils.isServerInDB(guild2.id, sql));
assert(cfServer.setLang("wrong", channel) === false);
assert(channel.str.startsWith(cfServer.lang.invalid_lang));
assert(cfServer.setLang("fr", channel));
assert(cfServer.setPrefix("py", channel));
assert(cfServer.setAdminRoles("admin, modo", channel));
assert(cfServer.setModRoles("modo", channel));
assert(cfServer.setRateSpeaker("y", channel));
assert(cfServer.setTopSpeaker("n", channel));


async function testAsyncMethods(cfServer) {
    var res = await cfServer.setVocChan("vocal", channel);
    assert(res);
    res = await cfServer.setVocChan("botChan", channel);
    assert(res === false);
    res = await cfServer.setBotChan("#botChan", channel);
    assert(res);
    cfServer.completeInit();
    assert(dbUtils.isServerInDB(cfServer.id, sql));
    cfServer.delete(sql, channel);
}

testAsyncMethods(cfServer);

//dbUtils.createReview("testServeur", "utilisateur", "ceci est une review");

testServer.soft_delete(sql, channel);
var tableSoftDeleted = sql.prepare("SELECT left FROM servers WHERE id = 42").pluck().get();
assert.equal(tableSoftDeleted, 1);


testServer.delete(sql, channel);
assert.equal(dbUtils.isServerInDB(42, sql), false);
