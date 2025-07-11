const { Anthropic } = require('@anthropic-ai/sdk');

const MIRRORD_SYSTEM_PROMPT = `Have a natural conversation. Keep responses concise - usually just 1-3 sentences unless they ask for more detail. Be helpful but not preachy.`;

// Simple in-memory storage (replace with database in production)
const userStore = {};

// Helper function to get or create user data
function getUserData(userId) {
  if (!userStore[userId]) {
    userStore[userId] = {
      firstSeen: new Date().toISOString(),
      dailyMessages: {},
      isPro: false
    };
  }
  return userStore[userId];
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
  
  // Clean up old dates (keep only last 7 days)
  const dates = Object.keys(userData.dailyMessages);
  if (dates.length > 7) {
    dates.sort();
    dates.slice(0, -7).forEach(date => delete userData.dailyMessages[date]);
  }
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
    // Health check endpoint
    return res.status(200).json({ 
      status: 'ok', 
      message: 'MIRRORD Backend Running',
      pricing: {
        trial: '7 days free (unlimited messages)',
        pro: '$4.99/month (unlimited messages)',
        free: '5 messages/day after trial'
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const { history, username, userId } = req.body;

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ 
          reply: 'Something went wrong. Want to try that again?' 
        });
      }

      // Get or create user data (using username as ID for now)
      const userIdKey = userId || username || 'anonymous';
      const userData = getUserData(userIdKey);
      
      // Check subscription status
      const inTrial = isInTrial(userData);
      const messageCount = getTodayMessageCount(userData);
      const isPro = userData.isPro;
      
      // Check limits for free users (not in trial, not pro)
      if (!inTrial && !isPro && messageCount >= 5) {
        return res.status(200).json({
          reply: "You've reached your daily limit of 5 messages. Upgrade to Pro for unlimited conversations.",
          limitReached: true,
          showPaywall: true,
          trialEnded: true,
          messageCount: messageCount
        });
      }

      // Increment message count
      incrementMessageCount(userData);

      // Process the message with Claude
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
          inTrial: inTrial,
          isPro: isPro,
          daysLeftInTrial: daysLeftInTrial,
          messagesUsedToday: getTodayMessageCount(userData),
          dailyLimit: isPro || inTrial ? null : 5
        }
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