import SQLite from "better-sqlite3";
import Discord from "discord.js";

import Utils from "./utils";

interface langTableInt {
    [index: string]: LocStrings
}

type TextChan = Discord.DMChannel | Discord.TextChannel

const langTable = <langTableInt>{
    fr: require('../localization/fr.json'),
    en: require('../localization/en.json'),
};


export default class ServerBase {
    public sql!: SQLite.Database;
    public guild!: Discord.Guild;
    public id!: string;
    public name!: string;
    public prefix!: string;
    public lang!: LocStrings;
    public admRoles!: Array<string>;
    public modRoles!: Array<string>;
    public vocChan!: string;
    public botChan!: string;
    public rateSpeaker!: boolean;
    public topSpeaker!: boolean;

    private langName: string = "en";

    private statTotComm: number = 0;
    private statMaxWaitList: number = 0;
    private init: boolean = false;


    //todo: what do I do with these?
    /*
        private usersTalking = {};
        private waitList = [];
        private waitListMessageId: number = -1;
    */
    [index: string]: any


    constructor(sql: SQLite.Database, guild: Discord.Guild);
    constructor(sql: SQLite.Database, guild: Discord.Guild, prefix: string, lang: string,
                admRoles: Array<string>, modRoles: Array<string>, vocChan: string,
                botChan: string, rateSpeaker: boolean, topSpeaker: boolean);


    constructor(sql: SQLite.Database, guild: Discord.Guild, prefix?: string, lang?: string,
                admRoles?: Array<string>, modRoles?: Array<string>, vocChan?: string,
                botChan?: string, rateSpeaker?: boolean, topSpeaker?: boolean) {
        this._constructorReCallable(sql, guild, prefix, lang, admRoles, modRoles, vocChan, botChan, rateSpeaker, topSpeaker)
    }


    private _constructorReCallable(sql: SQLite.Database, guild: Discord.Guild, prefix?: string, lang?: string,
                                   admRoles?: Array<string>, modRoles?: Array<string>, vocChan?: string,
                                   botChan?: string, rateSpeaker?: boolean, topSpeaker?: boolean) {
        this.sql = sql;
        this.guild = guild;
        this.id = guild.id;
        this.name = guild.name;
        this.lang = langTable.en;

        if (prefix === undefined)
            return (this._constructorWithDB(sql));

        const command = sql.prepare("INSERT INTO servers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ? , ?, 0, 0, 0);");
        command.run(guild.id, guild.name, prefix, lang, admRoles!.toString(), modRoles!.toString(),
            vocChan!, botChan!, rateSpeaker ? "1" : "0", topSpeaker ? "1" : "0");


        this.prefix = prefix;

        this.lang = langTable[lang!];
        this.admRoles = admRoles!;
        this.modRoles = modRoles!;
        this.vocChan = vocChan!;
        this.botChan = botChan!;
        this.rateSpeaker = rateSpeaker!;
        this.topSpeaker = topSpeaker!;
        this.init = true;
    }

    private _constructorWithDB(sql: SQLite.Database) {
        const command = sql.prepare("SELECT * FROM servers WHERE (id=?);");
        let res = command.get(this.id);

        if (!res) {
            this.init = false;
            return;
        }

        this.prefix = res.prefix;
        this.lang = langTable[res.lang];
        this.admRoles = res.admRoles.split(',').map(String);
        this.modRoles = res.modRoles.split(',').map(String);
        this.vocChan = res.vocChan; //res.vocChan.split(',').map(Number);
        this.botChan = res.botChan;
        this.rateSpeaker = res.rateSpeaker === 1;
        this.topSpeaker = res.topSpeaker === 1;
        this.statTotComm = res.statTotComm;
        this.statMaxWaitList = res.statMaxWaitList;
        this.init = true;
    }

    private _updateDB(name: string, val: string) {
        if (!this.init)
            return;
        const command = this.sql.prepare('UPDATE servers SET ' + name + ' = ? WHERE id = ?');
        command.run(val, this.id);
    }

    setLang(str: string, chan: TextChan) {
        if (langTable.hasOwnProperty(str)) {
            this.lang = langTable[str];
            this.langName = str;
            this._updateDB("lang", str);
            chan.send(this.lang.lang_changed);
            return true;
        } else {
            chan.send(this.lang.invalid_lang);
            return false;
        }
    }

    setPrefix(str: string, chan: TextChan) {
        this.prefix = str;
        this._updateDB("prefix", str);
        chan.send(Utils.fillTemplateString(this.lang.prefix_changed, {w: str}));
        return true;
    }

    private _setRoles(str: string, chan: TextChan, nameRole: string) {
        const roles = str.split(',').map(String);
        let errorRoles: Array<string> = [];
        let finalRoles: Array<string> = [];

        roles.forEach((r) => {
            if (r.length == 0)
                return;
            //todo:fix unit test to use this form of find.
            let nr = Utils.findRole(r, this.guild);
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
        } else {
            chan.send(Utils.fillTemplateString(this.lang.invalid_roles, {w: errorRoles.toString()}));
            return false;
        }
    }

    setAdminRoles(str: string, chan: TextChan) {
        return this._setRoles(str, chan, "admRoles");
    }

    setModRoles(str: string, chan: TextChan) {
        return this._setRoles(str, chan, "modRoles");
    }

    private _sendInvalidChanString(chan: TextChan, chanName: String) {
        chan.send(Utils.fillTemplateString(this.lang.invalid_chan, {w: chanName}));
        return false;
    }

    private async _setChan(chanName: string, chan: TextChan, nameVar: string,
                           type: 'text' | 'voice', createChan: boolean) {
        if (chanName.startsWith('#'))
            chanName = chanName.substr(1);
        const nc = Utils.findChan(chanName, this.guild);
        if (nc && nc.type === type) {
            let channel = nc as Discord.TextChannel | Discord.VoiceChannel;
            this[nameVar] = channel.id;
            this._updateDB(nameVar, channel.id);
            chan.send(Utils.fillTemplateString(this.lang.chan_added, {w: channel.name}));
            return true;
        } else {
            if (createChan && this.guild.me.hasPermission(Discord.Permissions.FLAGS.MANAGE_CHANNELS!)) {
                try {
                    const chanCreated = await this.guild.createChannel(chanName, {type: type});
                    this[nameVar] = chanCreated.id;
                    this._updateDB(nameVar, chanCreated.id);
                    chan.send(Utils.fillTemplateString(this.lang.chan_created, {w: chanCreated.name}));
                    return true;
                } catch (e) {
                    return this._sendInvalidChanString(chan, chanName);
                }
            } else
                return this._sendInvalidChanString(chan, chanName);
        }
    }

    async setVocChan(str: string, chan: TextChan) {
        return await this._setChan(str, chan, "vocChan", "voice", false)
    }

    async setBotChan(str: string, chan: TextChan) {
        return await this._setChan(str.toLowerCase(), chan, "botChan", "text", true)
    }


    private _setBooleanVote(str: string, chan: TextChan, nameVar: string) {
        this[nameVar] = (str.startsWith('y') || str.startsWith('o'));
        this._updateDB(nameVar, Utils.boolToSQLInt(this[nameVar]).toString());
        chan.send(this.lang.paramBoolSet);
        return true;
    }

    setRateSpeaker(str: string, chan: TextChan) {
        return this._setBooleanVote(str, chan, "rateSpeaker");
    }

    setTopSpeaker(str: string, chan: TextChan) {
        return this._setBooleanVote(str, chan, "topSpeaker");
    }

    completeInit() {
        this._constructorReCallable(this.sql, this.guild, this.prefix, this.langName, this.admRoles, this.modRoles,
            this.vocChan, this.botChan, this.rateSpeaker, this.topSpeaker);
    }
}
