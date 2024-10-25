let fs = require('fs')
let chalk = require('chalk')

global.set = {
    limit: "10",
    name: "Luoyisse",
    version: "3.0.0",
    wait: "🔄",
    sukses: "💯",
    gagal: "🚫",
    textwait: "sedang di proses...",
    textsukses: "Media telah dikirimkan ke chat pribadi",
    textgagal: "terjadi kesalahan saat mendownload media, silahkan lapor ke atmin...",
    linkIg: "https://www.instagram.com/",
    linkGh: "https://github.com",
    linkGc: "https://chat.whatsapp.com/KicelGs2cOx4vZAs1xGBfv",
    thumbnail: "https://telegra.ph/file/1cdcec170333ccb0eff98.jpg",
    owner: [
        ['6282323780821', 'RyharDev', true], // ['number', 'name', dev?]
    ],
    api: {
        name: { 
            s: {// API Prefix
                //neoxr: 'https://api.neoxr.my.id',
            }
        },
        key: {
            s: {// APIKey Here
               //'https://api.neoxr.my.id': '5VC9rvNx',
            }
        }
    },
}

global.fakeMen = {
    "key": {
        "participants":"6282323780821@s.whatsapp.net",
        "remoteJid": "status@broadcast", // "0@s.whatsapp.net",
        "fromMe": false,
        "id": "WhatsApp Bot Terverifikasi"
    },
    "message": {
        "conversation": "WhatsApp Bot Terverifikasi"
    },
    "participant": "0@s.whatsapp.net"
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})