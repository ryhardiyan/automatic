/*module.exports = {
    async presenceUpdate(presenceUpdate) {
        console.log(JSON.stringify(null, presenceUpdate, 4))
        const id = presenceUpdate.id;
        const nouser = Object.keys(presenceUpdate.presences);
        const status = presenceUpdate.presences[nouser]?.lastKnownPresence;
        const user = global.db.data.users[nouser[0]];
    
        if (user?.afk && status === "composing" && user.afk > -1) {
            if (user.banned) {
                user.afk = -1;
                user.afkReason = "User Banned Afk";
                return;
            }
            
            await console.log("AFK - TICK");
            const username = nouser[0].split("@")[0];
            const timeAfk = new Date() - user.afk;
            const caption = `\nTerdeteksi @${username} sedang mengetik, selamat datang dari AFK\n\nAlasan: ${user.afkReason ? user.afkReason : "No Reason"}\nSelama ${timeAfk.toTimeString()} Yang Lalu\n`;
            
            this.reply(
                id,
                caption,
                null, {
                    contextInfo: {
                        mentionedJid: [nouser[0]],
                        externalAdReply: {
                            title: "AFK Stopped",
                            thumbnail: set.thumbnail
                        },
                    },
                }
            )
            user.afk = -1;
            user.afkReason = "";
        }
    }
}*/