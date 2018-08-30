import SQLite from "better-sqlite3";
import Discord from "discord.js";

const Utils = require("./utils.js");

const langTable = {
    fr: require('./localization/fr.json'),
    en: require('./localization/en.json')
};

class ServerInit {
    public sql!: SQLite;
    public guild!: Discord.Guild;
    public id!: Number;
    public name!: string;
    public prefix!: string;
    public lang!: LocStrings;
    public admRoles!: Array<Number>;
    public modRoles!: Array<Number>;
    public vocChan!: Number;
    public botChan!: Number;
    public rateSpeaker!: Boolean;
    public topSpeaker!: Boolean;

    private langName: string = "en";

    private statTotComm: Number = 0;
    private statMaxWaitlist: Number = 0;
    private init: Boolean = false;


    //todo: what do I do with these?
    private usersTalking = {};
    private waitList = [];
    private waitListMessageId: Number = -1;


    constructor(sql: SQLite, guild: Discord.Guild, prefix: string, lang: string,
                admRoles: Array<Number>, modRoles: Array<Number>, vocChan: Number,
                botChan: Number, rateSpeaker: Boolean, topSpeaker: Boolean) {
        this._constructorRecallable(sql, guild, prefix, lang, admRoles, modRoles, vocChan, botChan, rateSpeaker, topSpeaker)
    }


    _constructorRecallable(sql: SQLite, guild: Discord.Guild, prefix: string, lang: string,
                           admRoles: Array<Number>, modRoles: Array<Number>, vocChan: Number,
                           botChan: Number, rateSpeaker: Boolean, topSpeaker: Boolean) {
        this.sql = sql;
        this.guild = guild;
        this.id = Number(guild.id);
        this.name = guild.name;
        this.lang = langTable.en;

        if (prefix === undefined)
            return (this._constructorWithDB(sql));

        const command = sql.prepare("INSERT INTO servers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ? , ?, 0, 0, 0);");
        command.run(guild.id, guild.name, prefix, lang, admRoles.toString(), modRoles.toString(),
            vocChan.toString(), botChan.toString(), rateSpeaker ? 1 : 0, topSpeaker ? 1 : 0);


        this.prefix = prefix;

        this.lang = langTable[lang];
        this.admRoles = admRoles;
        this.modRoles = modRoles;
        this.vocChan = vocChan;
        this.botChan = botChan;
        this.rateSpeaker = rateSpeaker;
        this.topSpeaker = topSpeaker;
        this.init = true;
    }

    _constructorWithDB(sql: SQLite) {
        const command = sql.prepare("SELECT * FROM servers WHERE (id=?);");
        let res = command.get(this.id);

        if (!res) {
            this.init = false;
            return;
        }

        this.prefix = res.prefix;
        this.lang = langTable[res.lang];
        this.admRoles = res.admRoles.split(',').map(Number);
        this.modRoles = res.modRoles.split(',').map(Number);
        this.vocChan = parseInt(res.vocChan); //res.vocChan.split(',').map(Number);
        this.botChan = parseInt(res.botChan);
        this.rateSpeaker = res.rateSpeaker == true;
        this.topSpeaker = res.topSpeaker == true;
        this.statTotComm = res.statTotComm;
        this.statMaxWaitlist = res.statMaxWaitlist;
        this.init = true;
    }

    _updateDB(name: string, val: string) {
        if (!this.init)
            return;
        const command = this.sql.prepare("UPDATE servers SET ? = ? WHERE (id=?);");
        command.run(name, val, this.id);
    }

    setLang(str: string, chan: Discord.DMChannel) {
        if (langTable.hasOwnProperty(str)) {
            this.lang = langTable[str];
            this.langName = str;
            this._updateDB("lang", str);
            chan.send(this.lang.lang_changed);
            return true;
        }
        else {
            chan.send(this.lang.invalid_lang);
            return false;
        }
    }

    setPrefix(str: string, chan: Discord.DMChannel) {
        this.prefix = str;
        this._updateDB("prefix", str);
        chan.send(Utils.fillTemplateString(this.lang.prefix_changed, {w: str}));
        return true;
    }

    _setRoles(str: string, chan: Discord.DMChannel, nameRole: string) {
        const roles = str.split(',').map(String);
        let errorRoles: Array<string> = [];
        let finalRoles: Array<string> = [];

        roles.forEach((r) => {
            let nr = this.guild.roles.find("name", r.trim());
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

    setAdminRoles(str: string, chan: Discord.DMChannel) {
        return this._setRoles(str, chan, "admRoles");
    }

    setModRoles(str: string, chan: Discord.DMChannel) {
        return this._setRoles(str, chan, "modRoles");
    }

    _setChan(str: string, chan: Discord.DMChannel, nameVar: string, type: 'text' | 'voice', createChan: Boolean) {
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
            if (createChan && this.guild.me.hasPermission(Discord.Permissions.FLAGS.MANAGE_CHANNELS!)) {
                const that = this;
                this.guild.createChannel(str, type)
                    .then(function (chanCreated: Discord.Channel) {
                            that[nameVar] = chanCreated.id;
                            that._updateDB(nameVar, chanCreated.id);
                            chan.send(Utils.fillTemplateString(that.lang.chan_created, {w: str}));
                            return true;
                        }
                    )
                    .catch(function (error: any) {
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

    async setVocChan(str: string, chan: Discord.DMChannel) {
        return await this._setChan(str, chan, "vocChan", "voice", false)
    }

    async setBotChan(str: string, chan: Discord.DMChannel) {
        return await this._setChan(str.toLowerCase(), chan, "botChan", "text", true)
    }


    _setBooleanVote(str: string, chan: Discord.DMChannel, nameVar: string) {
        this[nameVar] = (str.startsWith('y') || str.startsWith('o'));
        this._updateDB(nameVar, this[nameVar]);
        chan.send(this.lang.paramBoolSet);
        return true;
    }

    setRateSpeaker(str: string, chan: Discord.DMChannel) {
        return this._setBooleanVote(str, chan, "rateSpeaker");
    }

    setTopSpeaker(str: string, chan: Discord.DMChannel) {
        return this._setBooleanVote(str, chan, "topSpeaker");
    }

    completeInit() {
        this._constructorRecallable(this.sql, this.guild, this.prefix, this.langName, this.admRoles, this.modRoles,
            this.vocChan, this.botChan, this.rateSpeaker, this.topSpeaker);
    }
}

module.exports = ServerInit;