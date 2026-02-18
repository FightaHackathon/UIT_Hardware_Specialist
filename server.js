const express = require('express');
const cors = require('cors');
const { Mistral } = require('@mistralai/mistralai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Mistral client
let mistralClient = null;

const initializeMistral = () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        console.error('MISTRAL_API_KEY is not set in environment variables');
        return false;
    }
    try {
        mistralClient = new Mistral({ apiKey });
        console.log('✅ Mistral client initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Mistral client:', error.message);
        return false;
    }
};

// Initialize on startup
initializeMistral();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mistralConnected: mistralClient !== null,
        timestamp: new Date().toISOString()
    });
});

// Chat endpoint - proxy to Mistral API
app.post('/api/chat', async (req, res) => {
    try {
        if (!mistralClient) {
            const initialized = initializeMistral();
            if (!initialized) {
                return res.status(500).json({
                    error: 'Mistral client not initialized. Please check server configuration.'
                });
            }
        }

        const { message, systemInstruction } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('📨 Received chat request');

        const chatResponse = await mistralClient.chat.complete({
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: systemInstruction || 'You are a helpful assistant.' },
                { role: 'user', content: message }
            ],
        });

        if (chatResponse.choices && chatResponse.choices.length > 0 && chatResponse.choices[0].message.content) {
            const responseText = chatResponse.choices[0].message.content;
            console.log('✅ Chat response received');
            return res.json({ response: responseText });
        }

        return res.status(500).json({ error: 'Received empty response from Mistral' });

    } catch (error) {
        console.error('❌ Chat error:', error.message);
        return res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
});
