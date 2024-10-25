require('./handler/config')
const sessionName = "session";

const {
    default: makeWASocket,
    Browsers,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    getAggregateVotesInPollMessage,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    PHONENUMBER_MCC,
    proto,
    useMultiFileAuthState,
    WAMessageKey
} = require("@whiskeysockets/baileys");
const _ = require("lodash");
const WebSocket = require('ws')
const cp = require('child_process')
const syntaxerror = require("syntax-error");
const chalk = require('chalk')
const path = require("path");
const pino = require("pino");
const simple = require('./lib/simple')
const fs = require("fs");
const NodeCache = require("node-cache");
const os = require('os');
const readline = require("readline");

const useStore = false;
const usePairingCode = true;
const useMobile = false;

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in set.api.name.s ? set.api.name.s[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: set.api.key.s[name in set.api.name.s ? set.api.name.s[name] : name] } : {}) })) : '')
global.prefix = new RegExp("^[" + "‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-".replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + "]");

const timestamp = { start: new Date }
//logger
const logger = require("pino")({
    transport: {
        target: "pino-pretty",
        options: {
            levelFirst: true,
            ignore: "hostname",
            translateTime: true,
        },
    },
}).child({ creator: "RyharDev" });
logger.level = "trace";

const P = require("pino")({
   level: "silent",
});

//...
process.on('uncaughtException', console.error)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

// Plugin loader
const pluginFolder = path.join(__dirname, "plugins");
const pluginFilter = fs.readdirSync(pluginFolder, { withFileTypes: true }).filter((v) => v.isDirectory());
const pluginFile = (filename) => /\.js$/.test(filename);

pluginFilter.map(async ({ name }) => {
    global.plugins = {};
    let files = await fs.readdirSync(path.join(pluginFolder, name));
    for (let filename of files) {
        try {
            global.plugins[filename] = require(path.join(pluginFolder, name, filename));
            fs.watch(pluginFolder + "/" + name, global.reload);
        } catch (e) {
            logger.error(e);
            delete global.plugins[filename];
        }
    }
});
logger.info("All plugins has been loaded.");

global.reload = async (_event, filename) => {
    if (pluginFile(filename)) {
        let subdirs = await fs.readdirSync(pluginFolder);
        subdirs.forEach((files) => {
            let dir = path.join(pluginFolder, files, filename);
            if (fs.existsSync(dir)) {
                if (dir in require.cache) {
                    delete require.cache[dir];
                    if (fs.existsSync(dir)) logger.info(`re - require plugin '${filename}'`);
                    else {
                        logger.warn(`deleted plugin '${filename}'`);
                        return delete global.plugins[filename];
                    }
                } else logger.info(`requiring new plugin '${filename}'`);
                let err = syntaxerror(fs.readFileSync(dir), filename);
                if (err) logger.error(`syntax error while loading '${filename}'\n${err}`);
                else
                try {
                    global.plugins[filename] = require(dir);
                } catch (e) {
                    logger.error(e);
                } finally {
                    global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
                }
            }
        });
    }
};
Object.freeze(global.reload);

var low;
try {
    low = require("lowdb");
} catch {
    low = require("./lib/lowdb");
} 
const { Low, JSONFile } = low;
global.db = new Low(new JSONFile("./database/database.json"));


//store
const store = useStore ? makeInMemoryStore({ logger }) : undefined;
store?.readFromFile("./session");

// Save session every 1m
setInterval(() => {
   store?.writeToFile("./session");
}, 10000 * 6);

const msgRetryCounterCache = new NodeCache();

//question
const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

//
async function connectionUpdate(update) {
    console.log(update)
    const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin } = update
    if (isNewLogin) conn.isInit = true
    if (connection == 'connecting') console.log(chalk.redBright('⚡ Activate the Bot, please wait a moment...'))
    if (connection == 'open') console.log(chalk.green('✅ Connected'))
    if (isOnline == true) console.log(chalk.green('Status Online'))
    if (isOnline == false) console.log(chalk.red('Status Offline'))
    if (receivedPendingNotifications) console.log(chalk.yellow('Waiting New Messages'))
    if (connection == 'close') console.log(chalk.red('⏱️ Connection stopped and tried to reconnect...'))
    timestamp.connect = new Date
    if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && conn.ws.readyState !== WebSocket.CONNECTING) {
        start();
    }
    //if (global.db.data == null) await loadDatabase();
}

//Connection
global.start = async function() {
   let { state, saveCreds } = await useMultiFileAuthState(sessionName);
   let { version, isLatest } = await fetchLatestBaileysVersion();
   
   global.conn = makeWASocket({
      version,
      logger: P, // P for hidden log console
      printQRInTerminal: !usePairingCode, // If you want to use scan, then change the value of this variable to false
      mobile: useMobile,
      browser: ['Mac OS', 'safari', '5.1.10'], // If you change this then the pairing code will not work
      auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, P),
      },
      msgRetryCounterCache,
   });
   
   simple.simple()
   store?.bind(conn.ev);
   conn.ev.on("creds.update", saveCreds); // to save creds
    
   // pengganti qr
   if (usePairingCode && !conn.authState.creds.registered) {
      if (useMobile) {
         throw new Error("cannot use mobile api");
      }
      const phoneNumber = await question("Enter WhatsApp Number: ");
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(`pairing with this code: ${code}`);
   }

   // event
   conn.ev.on("connection.update", connectionUpdate.bind(conn));
   conn.ev.on("messages.upsert", require("./handler/handler").handler.bind(conn));
   conn.ev.on("group-participants.update", require("./handler/welcome.js").participantsUpdate.bind(conn))
   //conn.ev.on("presence.update", require("./handler/presenceUpdate.js").presenceUpdate.bind(conn))
   return conn;
}

// Load database if database didn't load properly
loadDatabase();
async function loadDatabase() {
    await global.db.read();
    global.db.data = {
        users: {},
        group: [],
        stats: {},
        msgs: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = _.chain(global.db.data);
}

// Save database every minute
setInterval(async () => {
    await global.db.write();
}, 30 * 1000);

// auto clearTmp
if (global.db) {
    setInterval(async () => {
        if (global.db.data) await global.db.write();
        const tmp = [os.tmpdir(), 'tmp'];
        tmp.forEach(filename => {
            cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-not', '-name', 'ktdprjct', '-delete']);
        });
    }, 30 * 1000);
}
start().catch((e) => console.error(e));
