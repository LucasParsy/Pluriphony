import Discord, {CollectorFilter, Message, ReactionCollector} from "discord.js";
import SpamDetection from "./SpamDetection";


export default class WaitlistReactions {

    /*
        @brief: add reactions to the Waitlist, and setup collector
    */
    static async setupReactions(msg: Discord.Message) {
        const filter: CollectorFilter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            return user.id != msg.author.id;
        };

        const collector: ReactionCollector = msg.createReactionCollector(filter, {time: 31 * 7 * 24 * 60 * 1000});
        collector.on('collect', (reaction: Discord.MessageReaction, reactionCollector: ReactionCollector) => {

            reaction.users.forEach(function (user: Discord.User, guildMemberId: string) {
                if (user.id == msg.author.id) //is pluriphony bot
                    return;
                //console.log(`${user.username} sent ${reaction.emoji.name}`);
                reaction.remove(user);
                if (user.bot) //is other bot
                    return;
                switch (reaction.emoji.name) {
                    case "⬆":
                        console.log("joining!");
                        break;
                    case "🖐":
                        console.log("passing");
                        break;
                    case "❌":
                        console.log("leaving");
                        break;
                    default:
                        break;
                }
                if (SpamDetection.checkUserRate(user)) {
                    1 + 1//updateMessage();
                    /*
                    todo: update db and message
                    check status user in waitlist:
                    if already passed
                    if not in waitlist but leaving
                    if in waitlist but joining
                    pass
                    else update message embed
                    */
                }
            });
        });

        collector.on('end', collected => {
            msg.delete();
            console.log(`Collected ${collected.size} items`);
        });

        await msg.react("⬆");
        await msg.react("🖐");
        await msg.react("❌");
    }
}
