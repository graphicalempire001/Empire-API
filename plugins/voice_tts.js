const axios = require('axios');

module.exports = async function voiceTtsPlugin(context) {
    const { sock, chatJid, text, prefix, mek } = context;

    if (!text) {
        return await sock.sendMessage(chatJid, { 
            text: `🎙️ *Empire Voice Note / Text-to-Speech Generator*
            
Usage: *${prefix}say [text-to-speak]*
Example: *${prefix}say hello world from empire md bot*

Generates a realistic spoken voice note and sends it directly inside WhatsApp.` 
        }, { quoted: mek });
    }

    try {
        await sock.sendMessage(chatJid, { text: "🎙️ Generating voice note..." }, { quoted: mek });

        // Call the keyless text-to-speech engine on Empire-API
        const playLink = `https://graphicalempire001-empire-api.railway.app/api/voice?text=${encodeURIComponent(text)}`;

        // Send direct audio/voice note inside WhatsApp chat
        await sock.sendMessage(chatJid, { 
            audio: { url: playLink },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        await sock.sendMessage(chatJid, { text: `❌ Voice TTS failed: ${error.message}` }, { quoted: mek });
    }
};
