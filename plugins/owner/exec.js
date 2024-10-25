let cp = require('child_process')
let { promisify } = require('util')
let exec = promisify(cp.exec).bind(cp)

let handler = async (m, { conn, command, text }) => {
  let o
  try {
    o = await exec(command.trimStart()  + ' ' + text.trimEnd())
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout.trim()) {
      let a = stdout.replace(/C:/gi, '').replace(/Users/gi, 'home').replace(/rdp/gi, 'usr').replace(/Desktop/gi, 'root')
      if (text.startsWith('$ node test')) return conn.reply(m.chat, "error")
      conn.reply(m.chat, a)
    }
    if (stderr.trim()) {
      let b = stderr.replace(/C:/gi, '').replace(/Users/gi, 'home').replace(/rdp/gi, 'usr').replace(/Desktop/gi, 'root')
      conn.reply(m.chat, text.startsWith('$ node test') ? b : b).then(_=> {
        if (text.startsWith('$ node test')) conn.reply(m.chat, "Eror don't restart bot, kocok lagi 😎") 
      })
    }
  }
}
handler.help = ['$']
handler.tags = ['owner']
handler.customPrefix = /^[$]/
handler.command = new RegExp
handler.rowner = true
module.exports = handler
