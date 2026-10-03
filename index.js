console.clear();
console.log('Starting...');
require('../setting/config');

const { 
    default: makeWASocket, 
    prepareWAMessageMedia, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeInMemoryStore, 
    generateWAMessageFromContent, 
    generateWAMessageContent, 
    jidDecode, 
    proto, 
    relayWAMessage, 
    getContentType, 
    getAggregateVotesInPollMessage, 
    downloadContentFromMessage, 
    fetchLatestWaWebVersion, 
    InteractiveMessage, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    generateForwardMessageContent, 
    MessageRetryMap 
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const chalk = requie('chalk');
const { Boom } = require('@hapi/boom');
const { color } = require('./lib/color');
const { smsg, sendGmail, formatSize, isUrl, generateMessageTag, getBuffer, getSizeMedia, runtime, fetchJson, sleep } = require('./lib/myfunction');

const usePairingCode = true;
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => { rl.question(text, resolve) });
}

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function kiranastart() {
	const {
		state,
		saveCreds
	} = await useMultiFileAuthState("session")
	const kirana = makeWASocket({
		printQRInTerminal: !usePairingCode,
		syncFullHistory: true,
		markOnlineOnConnect: true,
		connectTimeoutMs: 60000,
		defaultQueryTimeoutMs: 0,
		keepAliveIntervalMs: 10000,
		generateHighQualityLinkPreview: true,
		patchMessageBeforeSending: (message) => {
			const requiresPatch = !!(
				message.buttonsMessage ||
				message.templateMessage ||
				message.listMessage
			);
			if (requiresPatch) {
				message = {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadataVersion: 2,
								deviceListMetadata: {},
							},
							...message,
						},
					},
				};
			}

			return message;
		},
		version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
		browser: ["Ubuntu", "Chrome", "20.0.04"],
		logger: pino({
			level: 'fatal'
		}),
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, pino().child({
				level: 'silent',
				stream: 'store'
			})),
		}
	});


if (usePairingCode && !kirana.authState.creds.registered) {
    console.clear(); 
    
    console.log(chalk.cyan.bold(`
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃  ◢◤◢◤◢◤◢◤  S U G O  B U I L D  ◢◤◢◤◢◤◢◤  ┃
  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
  ┃        ---  AUTHENTICATION SYSTEM  ---     ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`));

    console.log(chalk.yellow.bold('\n  ╔════════════════ [ STEP 01 ] ════════════════╗'));
    console.log(chalk.white('  ║  Silakan masukkan nomor WhatsApp Anda       ║'));
    console.log(chalk.white('  ║  Gunakan awalan 62 (Contoh: 628xxx)         ║'));
    console.log(chalk.yellow.bold('  ╚═════════════════════════════════════════════╝'));
    
    let phoneNumber = await question(chalk.green.bold('  ╰─❯ ') + chalk.white('NOMOR : '));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (!phoneNumber.startsWith("62")) {
        console.log(chalk.bgRed.white.bold("\n  [ ERROR ] ") + chalk.red(" Nomor wajib diawali 62! "));
        return;
    }

    console.log(chalk.magenta.bold('\n  ╔════════════════ [ STEP 02 ] ════════════════╗'));
    console.log(chalk.white('  ║  Sistem terkunci! Masukkan akses key        ║'));
    console.log(chalk.white('  ║  Hubungi @OndetPcx untuk membeli key    ║'));
    console.log(chalk.magenta.bold('  ╚═════════════════════════════════════════════╝'));
    
    const pw = await question(chalk.green.bold('  ╰─❯ ') + chalk.white('PASSWORD : '));

    if (pw.trim() !== "oNdEtAdhAIak") {
        console.log(chalk.bgRed.white.bold("\n  [ DENIED ] ") + chalk.red(" Password Salah!"));
        return;
    }
    console.log(chalk.cyan.bold('\n  ◈────────────────────────────────────────────◈'));
    console.log(chalk.green.bold('  [✓] VERIFIED! ') + chalk.white('Requesting code...'));
    console.log(chalk.cyan.bold('  ◈────────────────────────────────────────────◈'));

    try {
        const code = await kirana.requestPairingCode(phoneNumber, "ONDEONDE");
        
        console.log('\n'); 

        console.log(chalk.cyan.bold('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        console.log(chalk.white.bold('  ┃        KODE PAIRING WHATSAPP ANDA          ┃'));
        console.log(chalk.cyan.bold('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'));
        console.log(chalk.white.bold('  ┃                                          ┃'));
        
        console.log(chalk.white.bold('  ┃               ') + chalk.yellow.bold(code) + chalk.white.bold('                ┃'));
        console.log(chalk.white.bold('  ┃                                          ┃'));
        console.log(chalk.cyan.bold('  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫'));
        console.log(chalk.gray.bold('  ┃   * Masukkan kode sebelum kadaluwarsa!   ┃'));
        console.log(chalk.cyan.bold('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n'));
        
    } catch (error) {
        console.log(chalk.red("\n  [!] GAGAL! Periksa koneksi atau nomor Anda.\n"));
    }
}


    store.bind(kirana.ev);
kirana.ev.on("messages.upsert", async (chatUpdate, msg) => {
 try {
const mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (!kirana.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
if (mek.key.id.startsWith('FatihArridho_')) return;
const m = smsg(kirana, mek, store)
require("./ondet")(kirana, m, chatUpdate, store)
 } catch (err) {
 console.log(err)
 }
});

    kirana.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    kirana.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = kirana.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });
    
    global.idch = "120363422606248001@newsletter"
    global.idch1 = "120363421046095378@newsletter"
    global.idch2 = "120363422868120200@newsletter"
    global.idch3 = "120363401201462646@newsletter"
    global.idch4 = "120363402510606068@newsletter"

    kirana.public = global.status;

    kirana.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(color(lastDisconnect.error, 'deeppink'));
            if (lastDisconnect.error == '') {
                process.exit();
            } else if (reason === DisconnectReason.badSession) {
                console.log(color(`Bad Session File, Please Delete Session and Scan Again`));
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(color('[SYSTEM]', 'white'), color('Connection closed, reconnecting...', 'deeppink'));
                process.exit();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(color('[SYSTEM]', 'white'), color('Connection lost, trying to reconnect', 'deeppink'));
                process.exit();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(color('Connection Replaced, Another New Session Opened, Please Close Current Session First'));
                kirana.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(color(`Device Logged Out, Please Scan Again And Run.`));
                kirana.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(color('Restart Required, Restarting...'));
                await kiranastart();
            } else if (reason === DisconnectReason.timedOut) {
                console.log(color('Connection TimedOut, Reconnecting...'));
                kiranastart();
            }
        } else if (connection === "Connect To Sender🤨") {
            console.log(color('Tunggu Bentar.............'));
        } else if (connection === "open") {
             kirana.newsletterFollow(global.idch)
             kirana.newsletterFollow(global.idch1)
             kirana.newsletterFollow(global.idch2)
             kirana.newsletterFollow(global.idch3)
             kirana.newsletterFollow(global.idch4)
            console.log(color('UDAH KESAMBUNG TINGGAL PAKE DEH BEB😘'));
        }
    });

    kirana.sendText = (jid, text, quoted = '', options) => kirana.sendMessage(jid, { text: text, ...options }, { quoted });
    
    kirana.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
return buffer
    } 
    
    kirana.ev.on('creds.update', saveCreds);
    return kirana;
}

kiranastart();

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});
// Ini buat code pairing kalian kalau mau pake silahkan edit-edit ada auto follow saluran juga di sesuaikan 
