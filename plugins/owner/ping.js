let os = require('os')
let util = require('util')
let { performance } = require('perf_hooks')
let { sizeFormatter } = require('human-readable')
let axios = require('axios')
let si = require('systeminformation')

let format = sizeFormatter({
  std: 'JEDEC', // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600))
  seconds %= 24 * 3600
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60
  return `${days}d ${hours}h ${minutes}m`
}

let handler = async (m, { conn }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us')) //groups.filter(v => !v.read_only)
  const used = process.memoryUsage()
  const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  })
  let old = performance.now()
  await m.reply('_Testing speed..._')
  let neww = performance.now()
  let speed = neww - old

  // Fetch external IP and related info
  let ipInfo = await axios.get('https://ipinfo.io/json').then(res => res.data).catch(() => ({}))

  // Get network interfaces
  let networkInterfaces = os.networkInterfaces()
  let macAddresses = Object.values(networkInterfaces).flat().map(iface => iface.mac).filter(mac => mac !== '00:00:00:00:00:00')

  // Get disk information
  let diskInfo = await si.diskLayout()
  let diskUsage = await si.fsSize()

  // Get process information
  let processes = await si.processes()

  // Get BIOS information
  let biosInfo = await si.bios()

  // Get battery information (if available)
  let batteryInfo = await si.battery()

  // Get GPU information
  let graphicsInfo = await si.graphics()

  m.reply(`
*Merespon dalam ${speed} millidetik*

\`STATUS :\`
- *${groupsIn.length}* Group Chats
- *${groupsIn.length}* Groups Joined
- *${groupsIn.length - groupsIn.length}* Groups Left
- *${chats.length - groupsIn.length}* Personal Chats
- *${chats.length}* Total Chats

\`PROVIDER INFO :\`
*IP:* ${ipInfo.ip || 'N/A'}
*REGION:* ${ipInfo.region || 'N/A'}
*ISP:* ${ipInfo.org || 'N/A'}

\`SYSTEM INFO :\`
*HOSTNAME:* ${os.hostname()}
*PLATFORM:* ${os.platform()}
*OS:* ${os.type()} ${os.release()}
*ARCH:* ${os.arch()}

\`SERVER INFO :\`
*MAC:* ${macAddresses.join(', ')}
*SERVER TIME:*
${new Date().toLocaleString()}
*LAST BOOT:* 
${new Date(Date.now() - os.uptime() * 1000).toLocaleString()}
*BATTERY INFO:* ${batteryInfo.hasBattery ? `${batteryInfo.percent}% (${batteryInfo.isCharging ? 'Charging' : 'Not Charging'})` : 'No Battery'}

\`SERVER VERSION :\`
*KERNEL:* ${os.version()}
*NODE.JS:* ${process.version}
*BIOS:* ${biosInfo.version}

\`RUNTIME INFO :\`
*OS:* ${formatUptime(os.uptime())}
*HOSTING:* ${formatUptime(process.uptime())}

\`PROCESS INFO :\`
Total: ${processes.all}
Running: ${processes.running}
Blocked: ${processes.blocked}
Sleeping: ${processes.sleeping}
Stopped: ${processes.stopped}
Unknown: ${processes.unknown}

\`STORAGE INFO :\`
*RAM:* ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}
*DISK:* ${diskInfo.map(disk => `${disk.device} (${disk.type}) - ${disk.size} bytes`).join(', ')}
*GPU:* ${graphicsInfo.controllers.map(gpu => `${gpu.model} (${gpu.vram} MB)`).join(', ')}

\`STORAGE USAGE :\`
*DISK USAGE:* 
${diskUsage.map(disk => `${disk.fs} - ${format(disk.used)} / ${format(disk.size)}`).join(', ')}

\`NODEJS MEMORY USAGE :\`
${'```' + Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${format(used[key])}`).join('\n') + '```'}

${cpus[0] ? `\`TOTAL CPU USAGE :\`
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}

\`CPU CORE\'s USAGE (${cpus.length} CORE CPU\'s)\`
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
`.trim())
}

handler.help = ["ping"]
handler.tags = ["main"]
handler.command = /^(ping)$/i

module.exports = handler