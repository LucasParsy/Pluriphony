import Discord from "discord.js";

module.exports = {

    fillTemplateString: function (templateString: String, templateVars: Object) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    },


    getKeyByValue: function (object: Object, value: String) {
        return Object.keys(object).find(key => object[key] === value);
    },

    userHasRole: function (haystack: Array<String>, arr: Array<Discord.Role>) {
        return arr.some(function (v) {
            return haystack.includes(v.id);
        });
    },

    showMessageAndDelete: function (msg: Discord.Message, str: String) {
        msg.reply(str)
            .then(sent => {
                if (sent instanceof Discord.Message) {
                    sent.delete(1000 * 60);
                }
                msg.delete(1000 * 60);
            })
            .catch(console.error);
    }

};
