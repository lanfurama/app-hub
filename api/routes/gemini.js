import express from 'express';

const router = express.Router();

// POST /api/v1/gemini/generate - Generate content using Gemini API (proxy endpoint)
router.post('/generate', async (req, res) => {
  try {
    const { prompt, appId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(503).json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY environment variable'
      });
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to generate content from Gemini API',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({
      success: true,
      content: generatedText,
      appId: appId || null
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content', message: error.message });
  }
});

// POST /api/v1/gemini/insights - Generate AI insights for an app
router.post('/insights', async (req, res) => {
  try {
    const { appId, appName, description, techStack } = req.body;

    if (!appId || !appName || !description) {
      return res.status(400).json({ error: 'Missing required fields: appId, appName, and description' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(503).json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY environment variable'
      });
    }

    // Create prompt for generating insights
    const techStackText = techStack && techStack.length > 0 
      ? `Tech Stack: ${techStack.join(', ')}` 
      : '';
    
    const prompt = `Analyze this application and provide brief insights:

App Name: ${appName}
Description: ${description}
${techStackText}

Provide 2-3 concise insights about this application, focusing on its purpose, potential use cases, and technical highlights. Keep it brief and professional.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to generate insights from Gemini API',
        details: errorData
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({
      success: true,
      appId,
      insights: generatedText
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights', message: error.message });
  }
});

export default router;

