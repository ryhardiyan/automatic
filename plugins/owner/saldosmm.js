let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    
    const { key } = await conn.reply(m.chat, `PLEASE WAIT A MINUTE`, m)
    
    try {
        let res = await (await fetch(`https://indosmm.id/api/v2?key=3b057e3dcec8771602f42954c1cb864b&action=balance`)).json()
        const { balance, currency } = res
        let send = `*\`MY PROFILE\`*

EMAIL: ryhardev@gmail.com
USERNAME: RyharDev
BALANCE: ${currency} ${balance}`   
        conn.editMessage(m.chat, key, send, m)
    } catch (error) {
        conn.editMessage(m.chat, key, "INVALID APIKEY", m)
        console.log(error)
    }
}
handler.command = /^(saldosmm)$/i

handler.owner = true

module.exports = handler