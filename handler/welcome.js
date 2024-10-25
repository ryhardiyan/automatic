module.exports = {
    async participantsUpdate(chatUpdate) {
        const { id, participants, action } = chatUpdate
        if (global.db.data.settings[conn.user.jid].self == true) return
        if (this.isInit) return
        if (global.db.data == null) await global.loadDatabase()
        let chat = global.db.data.group.find(v => v.jid == id)
        let ppgc = 'https://telegra.ph/file/45315c8cc2cceb27ab81b.png'
        let text = ''
        switch (action) {
            case 'add':
            case 'remove':
                if (chat.welcome) {
                    const groupMetadata = await this.groupMetadata(id)
                    for (let user of participants) {
                        let name = this.getName(user)
                        let pp = await this.profilePictureUrl(id, 'image').catch(_=> ppgc)
                        text = (action === 'add' ? (`Hi, @user!\nWelcome in group @subject\n\n@desc`).replace('@subject', groupMetadata.subject).replace('@desc', groupMetadata.desc?.toString() || '') :
                        ('Goodbye @user!\n\nKalo balik lagi nitip seblak yaah!')).replace('@user', '@' + user.split('@')[0])
                        this.reply(id, text, null, {
                            ephemeralExpiration: 86400,
                            contextInfo: {
                                mentionedJid: [user],
                                externalAdReply :{
                                    showAdAttribution: true,
                                    mediaType: 1,
                                    title: global.set.name, 
                                    thumbnail: await this.getBuffer(pp),
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.set.linkGc
                                }
                            }
                        }, fakeMen)
                    }
                }
            break
        }
    }
};