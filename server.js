const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 5000;

// Configurações do ThingSpeak
const CHANNEL_ID = 2943258;
const READ_API_KEY = 'G3BDQS6I5PRGFEWR';

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para buscar dados do ThingSpeak
app.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json`, {
            params: {
                api_key: READ_API_KEY,
                results: 100
            }
        });
        
        const feeds = response.data.feeds;
        const processedData = {
            umidade: [],
            temperatura: [],
            timestamps: []
        };
        
        feeds.forEach(feed => {
            if (feed.field1 && feed.field2) {
                processedData.umidade.push(parseFloat(feed.field1));
                processedData.temperatura.push(parseFloat(feed.field2));
                processedData.timestamps.push(new Date(feed.created_at).toLocaleString('pt-BR'));
            }
        });
        
        res.json(processedData);
    } catch (error) {
        console.error('Erro ao buscar dados do ThingSpeak:', error.message);
        res.status(500).json({ error: 'Falha ao buscar dados' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});