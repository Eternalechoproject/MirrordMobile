const { Anthropic } = require('@anthropic-ai/sdk');

const MIRRORD_SYSTEM_PROMPT = `Have a natural conversation. Keep responses concise - usually just 1-3 sentences unless they ask for more detail. Be helpful but not preachy.`;

// Simple in-memory storage
const userStore = {};

// Helper function to get or create user data
function getUserData(email) {
  if (!userStore[email]) {
    userStore[email] = {
      firstSeen: new Date().toISOString(),
      dailyMessages: {},
      subscriptionTier: 'free',
      memories: [],
      conversationHistory: []
    };
  }
  return userStore[email];
}

// Check if user is in trial period (7 days)
function isInTrial(userData) {
  const firstSeen = new Date(userData.firstSeen);
  const now = new Date();
  const daysSinceFirst = (now - firstSeen) / (1000 * 60 * 60 * 24);
  return daysSinceFirst < 7;
}

// Get today's message count
function getTodayMessageCount(userData) {
  const today = new Date().toDateString();
  return userData.dailyMessages[today] || 0;
}

// Increment message count
function incrementMessageCount(userData) {
  const today = new Date().toDateString();
  userData.dailyMessages[today] = (userData.dailyMessages[today] || 0) + 1;
}

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

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'MIRRORD Backend Running',
      version: 'simplified'
    });
  }

  if (req.method === 'POST') {
    try {
      const { history, username, userId, email } = req.body;

      console.log('Request received:', { username, email, historyLength: history?.length });

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ 
          reply: 'Something went wrong. Want to try that again?' 
        });
      }

      // Get or create user data
      const userKey = email || userId || username || 'anonymous';
      const userData = getUserData(userKey);
      
      // Check subscription status
      const inTrial = isInTrial(userData);
      const tier = inTrial ? 'trial' : userData.subscriptionTier;
      const messageCount = getTodayMessageCount(userData);
      
      // Check limits for free users
      if (tier === 'free' && messageCount >= 5) {
        return res.status(200).json({
          reply: "You've reached your daily limit of 5 messages. Upgrade to continue unlimited conversations.",
          limitReached: true,
          showPaywall: true,
          trialEnded: true,
          messageCount: messageCount,
          subscriptionTier: tier
        });
      }

      // Increment message count
      incrementMessageCount(userData);

      // Process the message with Claude
      const userAndAssistantMessages = history.filter(msg => msg.role !== 'system');

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      console.log('Calling Claude API...');

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: MIRRORD_SYSTEM_PROMPT,
        messages: userAndAssistantMessages
      });

      const reply = response.content[0].text;

      // Calculate days left in trial
      let daysLeftInTrial = 0;
      if (inTrial) {
        const firstSeen = new Date(userData.firstSeen);
        const now = new Date();
        const daysUsed = Math.floor((now - firstSeen) / (1000 * 60 * 60 * 24));
        daysLeftInTrial = Math.max(0, 7 - daysUsed);
      }

      return res.status(200).json({ 
        reply: reply,
        success: true,
        subscription: {
          tier: tier,
          inTrial: inTrial,
          daysLeftInTrial: daysLeftInTrial,
          messagesUsedToday: getTodayMessageCount(userData),
          dailyLimit: (tier === 'free' && !inTrial) ? 5 : null
        }
      });

    } catch (error) {
      console.error('Error details:', error);
      return res.status(500).json({ 
        reply: "Something went wrong. Want to try that again?",
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
};