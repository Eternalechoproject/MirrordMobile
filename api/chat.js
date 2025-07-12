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
Return only the most important 3-5 facts as a JSON array of strings. Be specific and concise.`;

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
      messagesSinceLastExtraction: 0,
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

// Build context from memories and recent history
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
  
  // Add recent conversation context for Pro/Premium
  if ((tier === 'pro' || tier === 'premium') && userData.conversationHistory.length > 0) {
    // Get last 10 messages for immediate context
    const recentMessages = userData.conversationHistory.slice(-10);
    if (recentMessages.length > 0) {
      contextPrompt += `\n\nRecent conversation context:`;
      recentMessages.forEach(msg => {
        if (msg.role === 'user') {
          contextPrompt += `\n- User mentioned: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`;
        }
      });
    }
  }
  
  return contextPrompt;
}

// Extract memories from recent conversations (smarter version)
async function extractMemoriesIfNeeded(userData, anthropic, tier) {
  // Only extract for Pro/Premium users
  if (tier !== 'pro' && tier !== 'premium') return;
  
  // Only extract every 8 messages to save API calls
  if (userData.messagesSinceLastExtraction < 8) return;
  
  try {
    // Get recent unprocessed messages
    const recentMessages = userData.conversationHistory.slice(-16); // Last ~8 exchanges
    if (recentMessages.length === 0) return;
    
    const conversationText = recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    console.log('Extracting memories from recent conversation...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.3,
      system: MEMORY_EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: `Extract key memories from this conversation:\n\n${conversationText}`
      }]
    });
    
    try {
      const responseText = response.content[0].text;
      const newMemories = JSON.parse(responseText);
      
      if (Array.isArray(newMemories)) {
        // Add new unique memories
        newMemories.forEach(memory => {
          // Check if similar memory already exists
          const exists = userData.memories.some(existing => 
            existing.toLowerCase().includes(memory.toLowerCase().substring(0, 20))
          );
          
          if (!exists && memory.length > 10) { // Only add substantial memories
            userData.memories.push(memory);
          }
        });
        
        // Keep only the most recent 25 memories
        if (userData.memories.length > 25) {
          userData.memories = userData.memories.slice(-25);
        }
        
        console.log(`Extracted ${newMemories.length} new memories. Total: ${userData.memories.length}`);
      }
    } catch (parseError) {
      console.error('Failed to parse memories:', parseError);
    }
    
    // Reset counter
    userData.messagesSinceLastExtraction = 0;
    
  } catch (error) {
    console.error('Memory extraction error:', error);
    // Don't let memory extraction failure break the chat
  }
}

// Get subscription tier
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
      version: 'smart-memory',
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

      // Store conversation for Pro/Premium users
      if (tier === 'pro' || tier === 'premium') {
        // Add new messages to history
        const newMessages = userAndAssistantMessages.slice(userData.conversationHistory.length);
        userData.conversationHistory.push(...newMessages);
        
        // Add the assistant's response
        userData.conversationHistory.push({
          role: 'assistant',
          content: reply
        });
        
        // Keep only last 100 messages to prevent memory bloat
        if (userData.conversationHistory.length > 100) {
          userData.conversationHistory = userData.conversationHistory.slice(-100);
        }
        
        // Increment messages since last extraction
        userData.messagesSinceLastExtraction += newMessages.length;
        
        // Extract memories if needed (happens in background)
        extractMemoriesIfNeeded(userData, anthropic, tier);
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
            memoryCount: userData.memories.length,
            totalConversations: Math.floor(userData.conversationHistory.length / 2)
          }
        }
      };

      // Add weekly summary for Premium users (mock for now)
      if (tier === 'premium' && new Date().getDay() === 0) { // Sunday
        responseData.weeklySummary = {
          totalMessages: userData.conversationHistory.length,
          topMemories: userData.memories.slice(-3),
          moodTrend: 'improving',
          keyInsight: userData.memories.length > 0 ? 
            `Based on our conversations, ${userData.memories[userData.memories.length - 1]}` : 
            'Keep sharing - I\'m learning more about you each conversation.'
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