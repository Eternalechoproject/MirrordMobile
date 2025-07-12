const { Anthropic } = require('@anthropic-ai/sdk');

// Base prompt
const MIRRORD_SYSTEM_PROMPT = `Have a natural conversation. Keep responses concise - usually just 1-3 sentences unless they ask for more detail. Be helpful but not preachy.`;

// Memory extraction prompt
const MEMORY_EXTRACTION_PROMPT = `Extract key information from this conversation to remember for future chats. Focus on:
- Important life events or situations
- Relationships mentioned
- Emotional patterns or triggers
- Goals or struggles
- Personal preferences
Return only the most important 3-5 facts as a JSON array of strings.`;

// Simple in-memory storage (replace with database in production)
const userStore = {};

// Helper function to get or create user data
function getUserData(email) {
  if (!userStore[email]) {
    userStore[email] = {
      firstSeen: new Date().toISOString(),
      dailyMessages: {},
      subscriptionTier: 'free', // 'free', 'basic', 'pro', 'premium'
      memories: [],
      conversationHistory: [],
      lastTopics: [],
      communicationStyle: null
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
  
  // Clean up old dates (keep only last 7 days)
  const dates = Object.keys(userData.dailyMessages);
  if (dates.length > 7) {
    dates.sort();
    dates.slice(0, -7).forEach(date => delete userData.dailyMessages[date]);
  }
}

// Build context from memories and history
function buildContextPrompt(userData, tier) {
  let contextPrompt = MIRRORD_SYSTEM_PROMPT;
  
  // Add memories for Pro and Premium users
  if ((tier === 'pro' || tier === 'premium') && userData.memories.length > 0) {
    contextPrompt += `\n\nContext from previous conversations:`;
    userData.memories.forEach(memory => {
      contextPrompt += `\n- ${memory}`;
    });
    contextPrompt += `\n\nUse this context naturally in your responses when relevant, but don't explicitly mention that you remember these things unless directly asked.`;
  }
  
  // Add recent conversation summary for Pro/Premium
  if ((tier === 'pro' || tier === 'premium') && userData.conversationHistory.length > 0) {
    const recentMessages = userData.conversationHistory.slice(-10);
    if (recentMessages.length > 0) {
      contextPrompt += `\n\nRecent conversation topics: ${userData.lastTopics.join(', ')}`;
    }
  }
  
  return contextPrompt;
}

// Extract memories from conversation
async function extractMemories(conversation, anthropic) {
  try {
    const conversationText = conversation.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.3,
      system: MEMORY_EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: conversationText
      }]
    });
    
    try {
      const memories = JSON.parse(response.content[0].text);
      return Array.isArray(memories) ? memories : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Memory extraction error:', error);
    return [];
  }
}

// Get subscription tier (in production, check payment status)
function getSubscriptionTier(userData, inTrial) {
  if (inTrial) return 'trial';
  return userData.subscriptionTier || 'free';
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
        basic: {
          price: '$4.99/month',
          features: ['7-day trial', 'Unlimited messages', 'No memory']
        },
        pro: {
          price: '$12.99/month',
          features: ['7-day trial', 'Unlimited messages', 'Continuous memory', 'Progress tracking']
        },
        premium: {
          price: '$19.99/month',
          features: ['Everything in Pro', 'Weekly summaries', 'Export data', 'Priority support']
        }
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const { history, username, userId, email } = req.body;

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ 
          reply: 'Something went wrong. Want to try that again?' 
        });
      }

      // Get or create user data using email as primary key
      const userKey = email || userId || username || 'anonymous';
      const userData = getUserData(userKey);
      
      // Check subscription status
      const inTrial = isInTrial(userData);
      const tier = getSubscriptionTier(userData, inTrial);
      const messageCount = getTodayMessageCount(userData);
      
      // Check limits for free users (not in trial, no subscription)
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

      // Build context based on subscription tier
      const contextPrompt = buildContextPrompt(userData, tier);
      
      // Process the message with Claude
      const userAndAssistantMessages = history.filter(msg => msg.role !== 'system');

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: contextPrompt,
        messages: userAndAssistantMessages
      });

      const reply = response.content[0].text;

      // Store conversation and extract memories for Pro/Premium users
      if (tier === 'pro' || tier === 'premium') {
        // Add to conversation history
        userData.conversationHistory.push(...userAndAssistantMessages);
        
        // Keep only last 50 messages to avoid memory bloat
        if (userData.conversationHistory.length > 50) {
          userData.conversationHistory = userData.conversationHistory.slice(-50);
        }
        
        // Extract new memories from this conversation
        const newMemories = await extractMemories(userAndAssistantMessages, anthropic);
        
        // Add new memories, avoiding duplicates
        newMemories.forEach(memory => {
          if (!userData.memories.includes(memory)) {
            userData.memories.push(memory);
          }
        });
        
        // Keep only the most recent 20 memories
        if (userData.memories.length > 20) {
          userData.memories = userData.memories.slice(-20);
        }
        
        // Extract topics from this conversation
        const topics = userAndAssistantMessages
          .filter(msg => msg.role === 'user')
          .map(msg => {
            // Simple topic extraction - in production, use AI
            if (msg.content.toLowerCase().includes('work')) return 'work';
            if (msg.content.toLowerCase().includes('family')) return 'family';
            if (msg.content.toLowerCase().includes('relationship')) return 'relationships';
            if (msg.content.toLowerCase().includes('anxious') || msg.content.toLowerCase().includes('anxiety')) return 'anxiety';
            return 'general';
          })
          .filter((v, i, a) => a.indexOf(v) === i); // unique only
        
        userData.lastTopics = topics;
      }

      // Calculate days left in trial
      let daysLeftInTrial = 0;
      if (inTrial) {
        const firstSeen = new Date(userData.firstSeen);
        const now = new Date();
        const daysUsed = Math.floor((now - firstSeen) / (1000 * 60 * 60 * 24));
        daysLeftInTrial = Math.max(0, 7 - daysUsed);
      }

      // Prepare response with subscription info
      const responseData = {
        reply: reply,
        success: true,
        subscription: {
          tier: tier,
          inTrial: inTrial,
          daysLeftInTrial: daysLeftInTrial,
          messagesUsedToday: getTodayMessageCount(userData),
          dailyLimit: (tier === 'free' && !inTrial) ? 5 : null,
          features: {
            hasMemory: tier === 'pro' || tier === 'premium',
            hasSummaries: tier === 'premium',
            memoryCount: userData.memories.length
          }
        }
      };

      // Add weekly summary for Premium users (mock for now)
      if (tier === 'premium' && new Date().getDay() === 0) { // Sunday
        responseData.weeklySummary = {
          totalMessages: 47,
          topTopics: userData.lastTopics,
          moodTrend: 'improving',
          keyInsight: 'You've been more open about work stress this week.'
        };
      }

      return res.status(200).json(responseData);

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