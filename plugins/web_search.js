const axios = require('axios');

module.exports = async function webSearchPlugin(context) {
    const { sock, chatJid, text, prefix, mek } = context;

    if (!text) {
        return await sock.sendMessage(chatJid, { 
            text: `❌ Please provide a search query.
Example: *${prefix}search nodejs tutorials*` 
        }, { quoted: mek });
    }

    try {
        await sock.sendMessage(chatJid, { text: "🔍 Searching the web..." }, { quoted: mek });
        
        // Scraping DuckDuckGo HTML search results
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(text)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        // Simple parsing of HTML snippets using regex
        const html = response.data;
        const matches = [...html.matchAll(/<a class="result__snippet"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)</a>/g)].slice(0, 3);
        const titleMatches = [...html.matchAll(/<a class="result__url"[^>]*>([\s\S]*?)</a>/g)].slice(0, 3);

        if (matches.length === 0) {
            return await sock.sendMessage(chatJid, { text: "❌ No results found." }, { quoted: mek });
        }

        let reply = `*🌐 Web Search Results for:* "${text}"

`;
        for (let i = 0; i < matches.length; i++) {
            const title = titleMatches[i] ? titleMatches[i][1].replace(/<[^>]*>/g, '').trim() : 'Result';
            const snippet = matches[i][2].replace(/<[^>]*>/g, '').trim();
            const link = matches[i][1];
            reply += `*${i + 1}. ${title}*
📝 ${snippet}
🔗 ${link}

`;
        }

        await sock.sendMessage(chatJid, { text: reply.trim() }, { quoted: mek });
    } catch (error) {
        await sock.sendMessage(chatJid, { text: `❌ Search failed: ${error.message}` }, { quoted: mek });
    }
};
