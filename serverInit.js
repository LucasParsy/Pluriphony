const Discord = require("discord.js");
const Utils = require("./utils.js");
const langTable = {
    fr: require('./localization/fr.json'),
    en: require('./localization/en.json')
};

class ServerInit {

    _setDefaultConstructorVars() {
        this.usersTalking = {};
        this.waitList = [];
        this.waitListMessageId = -1;
    }

    constructor(sql, guild, prefix, lang, admRoles, modRoles, vocChans, botChan, rateSpeaker, topSpeaker) {
        this._constructorRecallable(sql, guild, prefix, lang, admRoles, modRoles, vocChans, botChan, rateSpeaker, topSpeaker)
    }


    _constructorRecallable(sql, guild, prefix, lang, admRoles, modRoles, vocChans, botChan, rateSpeaker, topSpeaker) {
        this.sql = sql;
        this.guild = guild;
        this.id = guild.id;
        this.name = guild.name;
        this.lang = langTable.en;
        this._langName = "en";

        if (prefix === undefined)
            return (this._constructorWithDB(sql));

        var command = sql.prepare("INSERT INTO servers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ? , ?, 0, 0, 0);");
        command.run(guild.id, guild.name, prefix, lang, admRoles.toString(), modRoles.toString(), vocChans.toString(), botChan.toString(), rateSpeaker ? 1 : 0, topSpeaker ? 1 : 0);


        this.prefix = prefix;

        if (typeof lang === 'string' || lang instanceof String)
            this.lang = langTable[lang];
        this.admRoles = admRoles;
        this.modRoles = modRoles;
        this.vocChans = vocChans;
        this.botChan = botChan;
        this.rateSpeaker = rateSpeaker;
        this.topSpeaker = topSpeaker;
        this.statTotComm = 0;
        this.statMaxWaitlist = 0;
        this.init = true;
        this._setDefaultConstructorVars()
    }

    _constructorWithDB(sql) {
        var command = sql.prepare("SELECT * FROM servers WHERE (id=?);");
        var res = command.get(this.id);

        if (!res) {
            this.init = false;
            return;
        }

        this.prefix = res.prefix;
        this.lang = langTable[res.lang];
        this.admRoles = res.admRoles.split(',').map(Number);
        this.modRoles = res.modRoles.split(',').map(Number);
        this.vocChans = parseInt(res.vocChans); //res.vocChans.split(',').map(Number);
        this.botChan = parseInt(res.botChan);
        this.rateSpeaker = res.rateSpeaker == true;
        this.topSpeaker = res.topSpeaker == true;
        this.statTotComm = res.statTotComm;
        this.statMaxWaitlist = res.statMaxWaitlist;
        this.init = true;
        this._setDefaultConstructorVars()
    }

    _constructorNotInitialized() {

    }

    _updateDB(name, val) {
        if (!this.init)
            return;
        var command = sql.prepare("UPDATE servers SET ? = ? WHERE (id=?);");
        command.run(name, val, this.id);
    }

    setLang(str, chan) {
        if (langTable.hasOwnProperty(str)) {
            this.lang = langTable[str];
            this._langName = str;
            this._updateDB("lang", str);
            chan.send(this.lang.lang_changed);
            return true;
        }
        else {
            chan.send(this.lang.invalid_lang);
            return false;
        }
    }

    setPrefix(str, chan) {
        this.prefix = str;
        this._updateDB("prefix", str);
        chan.send(Utils.fillTemplateString(this.lang.prefix_changed, {w: str}));
        return true;
    }

    _setRoles(str, chan, nameRole) {
        var roles = str.split(',').map(String);
        var errorRoles = [];
        var finalRoles = [];

        roles.forEach((r) => {
            var nr = this.guild.roles.find("name", r.trim());
            if (nr)
                finalRoles.push(nr.id);
            else
                errorRoles.push(r);
        });

        if (!errorRoles.length) {
            chan.send(this.lang.roles_set);
            this[nameRole] = finalRoles;
            this._updateDB(nameRole, finalRoles.toString());
            return true;
        }
        else {
            chan.send(Utils.fillTemplateString(this.lang.invalid_roles, {w: errorRoles.toString()}));
            return false;
        }
    }

    setAdminRoles(str, chan) {
        return this._setRoles(str, chan, "admRoles");
    }

    setModRoles(str, chan) {
        return this._setRoles(str, chan, "modRoles");
    }

    _setChan(str, chan, nameVar, type, createChan) {
        if (str.startsWith('#'))
            str = str.substr(1);
        var nc = this.guild.channels.find("name", str.trim());
        if (nc && nc.type === type) {
            this[nameVar] = nc.id;
            this._updateDB(nameVar, nc.id);
            chan.send(Utils.fillTemplateString(this.lang.chan_added, {w: str}));
            return true;
        }
        else {
            if (createChan && this.guild.me.hasPermission(Discord.Permissions.FLAGS.MANAGE_CHANNELS)) {
                var that = this;
                this.guild.createChannel(str, type)
                    .then(function (chanCreated) {
                            this[nameVar] = chanCreated.id;
                            that._updateDB(nameVar, chanCreated.id);
                            chan.send(Utils.fillTemplateString(this.lang.chan_created, {w: str}));
                            return true;
                        }
                    )
                    .catch(function (error) {
                        chan.send(Utils.fillTemplateString(that.lang.invalid_chan, {w: str}));
                        return false;
                    });
            }
            else {
                chan.send(Utils.fillTemplateString(this.lang.invalid_chan, {w: str}));
                return false;
            }
        }
    }

    async setVocChan(str, chan) {
        return await this._setChan(str, chan, "vocChans", "voice", false)
    }

    async setBotChan(str, chan) {
        return await this._setChan(str.toLowerCase(), chan, "botChan", "text", true)
    }


    _setBooleanVote(str, chan, nameVar) {
        this[nameVar] = (str.startsWith('y') || str.startsWith('o'));
        this._updateDB(nameVar, this[nameVar]);
        chan.send(this.lang.paramBoolSet);
        return true;
    }

    setRateSpeaker(str, chan) {
        return this._setBooleanVote(str, chan, "rateSpeaker");
    }

    setTopSpeaker(str, chan) {
        return this._setBooleanVote(str, chan, "topSpeaker");
    }

    completeInit() {
        this._constructorRecallable(this.sql, this.guild, this.prefix, this._langName, this.admRoles, this.modRoles,
            this.vocChans, this.botChan, this.rateSpeaker, this.topSpeaker);
    }
}

module.exports = ServerInit;