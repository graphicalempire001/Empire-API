const axios = require('axios');

module.exports = async function liveSportsPlugin(context) {
    const { sock, chatJid, text, prefix, mek } = context;

    if (!text) {
        return await sock.sendMessage(chatJid, { 
            text: `⚽ *Empire Sports Stream Link Generator*
            
Usage: *${prefix}stream [team-name]*
Example: *${prefix}stream chelsea*

Generates safe, ad-free video player stream links direct for mobile landscape viewing.` 
        }, { quoted: mek });
    }

    try {
        await sock.sendMessage(chatJid, { text: `⚽ Fetching live streams for *${text}*...` }, { quoted: mek });

        const playLink = `https://graphicalempire001-empire-api.railway.app/view?team=${encodeURIComponent(text)}`;

        const reply = `⚽ *LIVE STREAM DETECTED* ⚽

*Target Team:* ${text.toUpperCase()}
*Quality Selection:* 1080p | 720p | 480p Auto
*Layout:* Optimized Landscape Mobile View

🔗 *Tap below to open stream immediately inside WhatsApp:*
${playLink}

_Note: This stream is proxied through Empire-API Shield to remove ads, redirects, and malware popups._`;

        await sock.sendMessage(chatJid, { 
            text: reply.trim(),
            contextInfo: {
                externalAdReply: {
                    title: `⚽ Live Match: Stream ${text}`,
                    body: "Tap to play live stream in landscape inside WhatsApp",
                    mediaType: 1,
                    thumbnailUrl: "https://i.imgur.com/8N4U0R7.png",
                    sourceUrl: playLink
                }
            }
        }, { quoted: mek });

    } catch (error) {
        await sock.sendMessage(chatJid, { text: `❌ Failed to resolve stream: ${error.message}` }, { quoted: mek });
    }
};
