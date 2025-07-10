const { Anthropic } = require('@anthropic-ai/sdk');

const MIRRORD_SYSTEM_PROMPT = `Have a natural conversation. Keep responses concise - usually just 1-3 sentences unless they ask for more detail. Be helpful but not preachy.`;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { history } = req.body;

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ 
          reply: 'Something went wrong. Want to try that again?' 
        });
      }

      const userAndAssistantMessages = history.filter(msg => msg.role !== 'system');

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: MIRRORD_SYSTEM_PROMPT,
        messages: userAndAssistantMessages
      });

      const reply = response.content[0].text;

      return res.status(200).json({ 
        reply: reply,
        success: true 
      });

    } catch (error) {
      console.error('Claude API error:', error);
      return res.status(500).json({ 
        reply: "Something went wrong. Want to try that again?",
        error: error.message || 'Internal server error' 
      });
    }
  }

  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
};