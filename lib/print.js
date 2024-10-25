const chalk = require("chalk");
const PhoneNumber = require('awesome-phonenumber')
module.exports = async (conn, m) => {
    let chat = await conn.getName(m.chat)
    let _name = await conn.getName(m.sender)
    let senderName = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')

    let colors = [
        "cyan",
        "greenBright",
        "blueBright",
        "yellowBright",
        "magentaBright",
        "cyanBright",
    ];
    let header_client =
        chalk.black(chalk.bgYellow((m.timestamp ? new Date(1000 * (m.timestamp.low || m.timestamp)) : new Date()).toTimeString()));
    let header_sender =
        chalk[pickRandom(colors)](chalk.bgBlack("=> " + senderName)) +
        " " + chalk.red("to") +" " +
        chalk.black(chalk.bgYellow((m.isGroup == false) ? "[PRIVATE]" : "[GROUP]") + " ") + chalk.cyan(chat + " ")// +
        //chalk.green((chats.type == "private") ?  chats.username : chats.title)
        
    let message = m.isCommand ? chalk.yellow(m.text) : m.text;
    console.log(header_client + "\n" + header_sender + "\n" + message + "\n");
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

let file = require.resolve(__filename);
let fs = require("fs");
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright("Update 'lib/print.js'"));
    delete require.cache[file];
    require(file);
});