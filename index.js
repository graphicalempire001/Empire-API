const express = require('express');
const axios = require('axios');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Production-ready Video Downloader (using streaming yt-dlp)
app.get('/api/dl', async (req, res) => {
    const { url, type } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const isMp3 = type === 'mp3';
    const filename = `download_${Date.now()}.${isMp3 ? 'mp3' : 'mp4'}`;
    const outputPath = path.join('/tmp', filename);

    // Dynamic arguments for yt-dlp to support fast serverless streaming limits
    const args = isMp3 
        ? ['-x', '--audio-format', 'mp3', '-o', outputPath, url]
        : ['-f', 'best[height<=720][ext=mp4]', '-o', outputPath, url];

    const ls = spawn('yt-dlp', args);

    ls.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: "yt-dlp download failed" });
        }
        res.download(outputPath, filename, (err) => {
            if (err) console.error("Streaming error:", err);
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error("Cleanup error:", unlinkErr);
            });
        });
    });
});

// 2. AI Image Generator (Pollinations AI)
app.get('/api/ai/draw', async (req, res) => {
    const prompt = encodeURIComponent(req.query.q || 'futuristic robot');
    const seed = Math.floor(Math.random() * 99999);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${seed}&nologo=true`;
    res.json({ success: true, provider: "Empire-AI", url: imageUrl });
});

// 3. Sports & Live Match Endpoint (football-data.org)
app.get('/api/sports/live', async (req, res) => {
    const token = process.env.FOOTBALL_KEY;
    if (!token) {
        return res.json({ 
            success: true, 
            info: "Register free key at football-data.org and set FOOTBALL_KEY env variable.",
            matches: [] 
        });
    }
    try {
        const response = await axios.get('https://api.football-data.org/v4/matches', {
            headers: { 'X-Auth-Token': token }
        });
        res.json({ success: true, matches: response.data.matches || [] });
    } catch (e) {
        res.status(500).json({ error: "Football API service error: " + e.message });
    }
});

// 4. Geocoded Weather Endpoint (Open-Meteo + OpenStreetMap Geocoding)
app.get('/api/weather', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "City query 'q' is required" });

    try {
        // Step 1: Geocode city name to latitude/longitude using OSM (Free, no key)
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
        const geoRes = await axios.get(geoUrl, {
            headers: { 'User-Agent': 'Empire-MD-Bot-API' }
        });

        if (!geoRes.data || geoRes.data.length === 0) {
            return res.status(404).json({ error: "Location not found" });
        }

        const { lat, lon, display_name } = geoRes.data[0];

        // Step 2: Fetch actual weather from Open-Meteo (Free, no key)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherRes = await axios.get(weatherUrl);

        res.json({ 
            success: true, 
            location: display_name,
            coordinates: { lat, lon },
            weather: weatherRes.data.current_weather 
        });
    } catch (e) {
        res.status(500).json({ error: "Weather/Geocoding service error: " + e.message });
    }
});

// 5. PDF Maker (pdfkit)
app.post('/api/pdf/create', (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(20).text(req.body.title || 'Empire Document', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(req.body.content || 'Generated via Empire-API custom service.');
    doc.end();
});

// 6. OCR Tool (OCR.space Integration)
app.post('/api/ocr', async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required in body" });

    const apiKey = process.env.OCR_KEY;
    if (!apiKey) {
        return res.json({ 
            success: true, 
            info: "Register free key at ocr.space and set OCR_KEY in env variables.",
            text: "[Placeholder] Hello World. Set your OCR_KEY to scan real images." 
        });
    }

    try {
        const response = await axios.get('https://api.ocr.space/parse/imageurl', {
            params: { apikey: apiKey, url: imageUrl, OCREngine: 2 }
        });
        res.json({ 
            success: true, 
            text: response.data.ParsedResults?.[0]?.ParsedText || "No text detected." 
        });
    } catch (e) {
        res.status(500).json({ error: "OCR space API error: " + e.message });
    }
});

// 7. Self-Learning Brain Endpoints
const localBrain = {}; // Memory store
app.post('/api/brain/teach', (req, res) => {
    const { trigger, response, sessionId } = req.body;
    if (!trigger || !response) return res.status(400).json({ error: "Trigger and response required" });
    const session = sessionId || 'default';
    if (!localBrain[session]) localBrain[session] = {};
    localBrain[session][trigger.toLowerCase()] = response;
    res.json({ success: true, message: "Brain updated" });
});

app.get('/api/brain/query', (req, res) => {
    const { q, sessionId } = req.query;
    if (!q) return res.status(400).json({ error: "Query 'q' required" });
    const session = sessionId || 'default';
    const normalized = q.toLowerCase().trim();
    const reply = localBrain[session]?.[normalized] || null;
    res.json({ success: true, reply });
});

app.listen(PORT, () => console.log(`Empire-API active on port ${PORT}`));
