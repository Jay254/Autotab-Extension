require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/complete', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You're a ghost-text AI helping autocomplete user input. Be brief, natural, and don't repeat their input. Respond with only a short phrase, no punctuation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7,
      })
    });

    const data = await groqRes.json();
    const completion = data?.choices?.[0]?.message?.content || '';

    res.json({ completion });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Groq-powered server running at http://localhost:${port}`);
});
