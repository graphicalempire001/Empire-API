const axios = require('axios');

module.exports = async function selfLearningBrainPlugin(context) {
    const { sock, chatJid, text, prefix, mek, sender, isGroup, settings } = context;

    if (!text) {
        return await sock.sendMessage(chatJid, { 
            text: `🧠 *Empire Self-Learning Brain & Auto-Response*
            
Usage: *${prefix}brain [status|clear|teach [prompt] -> [response]]*
Example: *${prefix}brain teach hello -> Hi there, I am Empire-MD's auto brain!*

This plugin handles auto-reply, auto-learning, and customer communication directly inside WhatsApp without leaving the app.` 
        }, { quoted: mek });
    }

    try {
        const args = text.split('->');
        if (args.length === 2) {
            const trigger = args[0].trim().toLowerCase();
            const responseText = args[1].trim();

            // Store the learned conversation in Empire-API database
            await axios.post('https://graphicalempire001-empire-api.railway.app/api/brain/teach', {
                trigger,
                response: responseText,
                sessionId: sock.sessionId || 'default'
            });

            return await sock.sendMessage(chatJid, { 
                text: `🧠 *Memory Programmed Successfully!*

*Trigger:* "${trigger}"
*Response:* "${responseText}"` 
            }, { quoted: mek });
        }

        // Default query response if not teaching
        const response = await axios.get(`https://graphicalempire001-empire-api.railway.app/api/brain/query`, {
            params: {
                q: text,
                sessionId: sock.sessionId || 'default'
            }
        });

        if (response.data && response.data.reply) {
            await sock.sendMessage(chatJid, { text: `🤖: ${response.data.reply}` }, { quoted: mek });
        } else {
            await sock.sendMessage(chatJid, { text: "🧠 Memory not found. Teach me using `teach [trigger] -> [response]`" }, { quoted: mek });
        }

    } catch (error) {
        await sock.sendMessage(chatJid, { text: `❌ Brain operation failed: ${error.message}` }, { quoted: mek });
    }
};
