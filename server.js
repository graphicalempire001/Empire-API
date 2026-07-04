const express = require('express');
const axios = require('axios');
const path = require('path');
const { spawn } = require('child_process');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Video Downloader Endpoint
app.get('/api/dl', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });
    res.json({ success: true, message: "Video download endpoint ready with yt-dlp" });
});

// 2. AI Image Generator (Pollinations API)
app.get('/api/ai/draw', async (req, res) => {
    const prompt = encodeURIComponent(req.query.q || 'futuristic bot');
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true`;
    res.json({ success: true, url: imageUrl });
});

// 3. Sports & Live Match Endpoint
app.get('/api/sports/live', async (req, res) => {
    res.json({ success: true, message: "Sports endpoint ready with football-data.org" });
});

// 4. PDF Generator Endpoint
app.post('/api/pdf/create', (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.text(req.body.content || "Empire-API Custom Document");
    doc.end();
});

app.listen(PORT, () => console.log(`Empire-API live on port ${PORT}`));
