const simple = require('../lib/simple')
module.exports = {
    async handler(chatUpdate) {
        if (!chatUpdate) return;
        if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return;
        const Tnow = (new Date()/1000).toFixed(0)
        const sel = Tnow - m.messageTimestamp
        if (sel > global.Intervalmsg) return console.log(new ReferenceError(`Pesan ${Intervalmsg} detik yang lalu diabaikan agar tidak spam`))
        
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            
            //database
            try {
                require('../database/database') (m, this)
            } catch (e) {
                console.error(e)
            }
            
            const isROwner = [this.user.jid, ...set.owner.map(([number]) => number)].map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)      
            if (typeof m.text !== 'string') m.text = ''
            
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!plugin.all) continue
                if (typeof plugin.all !== 'function') continue
                try {
                    await plugin.all.call(this, m, chatUpdate)
                } catch (e) {
                    if (typeof e === 'string') continue
                    console.error(e)
                }
            }
            if (m.isBaileys) return
            
            let usedPrefix;
            
            let isOwner = isROwner || m.fromMe
            let groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
            let participants = (m.isGroup ? groupMetadata.participants : []) || []
            let user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {} // User Data
            let bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {} // Your Data
            let ownerGroup = (m.isGroup ? groupMetadata.owner : []) || []
            let isRAdmin = user && user?.admin == 'superadmin' || false // Is User Super Admin?
            let isAdmin = user && user?.admin == 'admin' || false // Is User Admin?
            let isBotAdmin = bot && bot?.admin == 'admin' || false // Are you Admin?
            let setting = global.db.data.settings[conn.user.jid]
            
            
            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin) continue;
                if (plugin.disabled) continue
                
                const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
                let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
                let match = (
                    _prefix instanceof RegExp // RegExp Mode?
                      ? [[_prefix.exec(m.text), _prefix]]
                      : Array.isArray(_prefix) // Array?
                    ? _prefix.map((p) => {
                        let re =
                            p instanceof RegExp // RegExp in Array?
                              ? p
                              : new RegExp(str2Regex(p));
                        return [re.exec(m.text), re];
                    })
                    : typeof _prefix === "string" // String?
                    ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
                    : [[[], new RegExp()]]
                ).find((p) => p[1]);
                
                if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    ownerGroup,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    chatUpdate
                })) continue
                if (typeof plugin !== 'function') continue
                
                if ((usedPrefix = (match[0] || "")[0])) {
                    let noPrefix = m.text.replace(usedPrefix, "");
                    let [command, ...args] = noPrefix.trim().split` `.filter((v) => v);
                    args = args || [];
                    let _args = noPrefix.trim().split` `.slice(1);
                    let text = _args.join` `
                    command = (command || "").toLowerCase();
                    
                    let isAccept =
                    plugin.command instanceof RegExp // RegExp Mode?
                    ? plugin.command.test(command)
                    : Array.isArray(plugin.command) // Array?
                    ? plugin.command.some((cmd) =>
                        cmd instanceof RegExp // RegExp in Array?
                        ? cmd.test(command)
                        : cmd === command
                    )
                    : typeof plugin.command === "string" // String?
                    ? plugin.command === command
                    : false;
                    
                    if (!isAccept) continue;
                    m.plugin = name;
                    // wajib regist
                    /*let user = global.db.data.users[m.sender];
                    if (name != 'daftar.js' && !user.registered && !isOwner) { // pengecualian fitur regist
                        m.reply("Anda terdeteksi belum terdaftar di database bot\nDaftar dulu sebelum pakai bot\n\nContoh:\n.reg ryhardev.14")
                        return
                    }*/
                    
                    if (setting.self == true) { // maintenanve
                        if (!isOwner)
                            return
                    }
                    
                    if (m.sender in global.db.data.users) { // jika user d banned
                        let user = global.db.data.users[m.sender]
                        if (!isOwner && user.banned == true)
                            return
                    }
                    
                    if (plugin.rowner && !isROwner) { // Real Owner
                        m.reply('khusus owner.')
                        continue
                    }
                    
                    if (plugin.group && !m.isGroup) { // Group Only
                        m.reply('khusus group.')
                        continue
                    } 
                    
                    if (plugin.botAdmin && !isBotAdmin) { // You Admin
                        m.reply('bot bukan atmin.')
                        continue
                    }
                    
                    if (plugin.admin && !isAdmin && isROwner) { // User Admin
                        m.reply('khusus atmin.')
                        continue
                    }
                    
                    m.isCommand = true;
                    
                    let extra = {
                        match,
                        usedPrefix,
                        noPrefix,
                        _args,
                        args,
                        command,
                        ownerGroup,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isRAdmin,
                        isOwner,
                        isAdmin,
                        isBotAdmin,
                        text,
                        conn: this,
                        chatUpdate,
                        m
                    };
                    try {
                        let users = global.db.data.users[m.sender]
                        
                        if(setting.groupmode == false) {
                            if (!isOwner  && !m.chat.endsWith('g.us')) {
                                if (!users.premium) {
                                    if (name != 'daftar.js') {
                                        if (users.warning === 3) {
                                            users.banned = true
                                            throw m.reply("Tebanned!")
                                        } else {
                                            users.warning += 1
                                            throw m.reply(global.peringatan.replace("%angka", users.warning))
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (setting.error.includes(name)) {
                            if (!isOwner) return m.reply("Fitur dalam perbaikan 🛠️")
                        }
                        
                        //call
                        await plugin.call(this, m, extra);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        } finally {
            require("../lib/print")(this, m).catch((e) => console.log(e));
        }
        //autoRead
        //await conn.readMessages([m.key])
    }
}