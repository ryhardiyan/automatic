/* 
* LICENSE RYHARDEV
* SCRIPT INI DIBUAT OLEH RYHARDEV
* KONTAK 082323780821
* WEBSITE RYHARSTORE.MY.ID
* DILARANG SHARING SCRIPT INI
* COPYRIGHT 2022 @RYHARDEV
*/

const chalk = require("chalk")
const fs = require("fs")

const payment = {
    qris: {
      link_nya: "", // LINK QRIS
      atas_nama: "" // A.N 
    },
    dana: {
      nomer: "", // NOMOR DANA
      atas_nama: "" // A.N
    },
    shoppepay: {
      nomer: "", // NOMOR SHOPPE
      atas_nama: "" // A.N
    },
    gopay: {
      nomer: "", // NOMOR GOPAY
      atas_nama: "" // A.N 
    }
}

const apikeyAtlantic = "YPvxVek7xfn0i4QEUnpIS9bazOoLMwSbLW3Cpr7amQpmUdRByrvhgmjPNOCj0CgltAzbeTX0lyvENArDvEZH91RS8XLNqJjH0zhJ" // APIKEY ATLANTIC H2H (https://atlantich2h.com/api)

const digiUsername = "" // ABAIKAN SAJA PROJECT GAGAL
const digiApikey = "" // ABAIKAN SAJA PROJECT GAGAL

  global.ownerNumber = "@s.whatsapp.net" // OWNER BOT
  global.kontakOwner = "" // KONTAK OWNER
  global.untung = "" // KEUNTUNGAN STORE (PERSEN)
  global.namaStore = "" // NAMA STORE
  global.botName = "" // NAMA BOT
  global.ownerName = "" // NAMA OWNER 
  global.dana = "Scan qris di atas"
  global.sawer = "Scan qris di atas"


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`UPDATE '${__filename}'`))
	delete require.cache[file]
	require(file)
})

module.exports = { payment, apikeyAtlantic }