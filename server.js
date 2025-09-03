import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérifie que la variable d'environnement est bien définie
if (!process.env.WOWS_APP_ID) {
    console.error("⚠️ WOWS_APP_ID not set in environment variables!");
    process.exit(1);
}

// Sert les fichiers statiques du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Proxy pour l’API WoWS
app.get('/api/:endpoint', async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const query = req.query; // ?account_id=XXX&server=eu
        const server = query.server || 'eu';
        const accountId = query.account_id;

        if (!accountId) return res.status(400).json({ error: 'account_id required' });

        // Construire l’URL sécurisée vers l’API WoWS
        const url = `https://api.worldofwarships.${server}/wows/${endpoint}/?application_id=${process.env.WOWS_APP_ID}&account_id=${accountId}`;

        // Appel à l’API
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).send(text);
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Démarre le serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

