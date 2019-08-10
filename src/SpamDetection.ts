import Discord from "discord.js";

//this is recorded across all servers

let users: Array<string> = [];
const userRateNumberLimit = 20;
const userRateTimeLimit = 10 * 60 * 1000;


export default class SpamDetection {

    /*
        @brief: prevent the refreshing of the message if a user spams reaction buttons
        @param: {Discord.User} user the user that sent a reaction
        @return {boolean} true if user has not exceeded the limit of posts for the defined time, false otherwise.
    */

    static checkUserRate(user: Discord.User): boolean {
        let count = 1;
        users.forEach(function (i: String) {
            (i == user.id) && count++;
        });
        users.push(user.id);
        setTimeout(function () {
            users.pop()
        }, userRateTimeLimit);

        //console.log(`Reaction count: user ${user.username} reacted ${count} times this last ${userRateTimeLimit / 1000}s. limit is ${userRateNumberLimit} times`);
        return count < userRateNumberLimit;
    }
}