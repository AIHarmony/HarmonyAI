// Mock OpenAI type interface for development and type checking
interface OpenAIInstance {
  chat: {
    completions: {
      create: (params: any) => Promise<{
        choices: Array<{
          message?: {
            content?: string;
          };
        }>;
      }>;
    };
  };
}

// Mock OpenAI client implementation
class MockOpenAI implements OpenAIInstance {
  apiKey?: string;
  
  constructor(options: { apiKey?: string, dangerouslyAllowBrowser?: boolean }) {
    this.apiKey = options.apiKey;
  }
  
  chat = {
    completions: {
      create: async (params: any) => {
        // Return mock response
        return {
          choices: [
            {
              message: {
                content: 'This is a mock AI response.'
              }
            }
          ]
        };
      }
    }
  };
}

// Use mock client
const openai = new MockOpenAI({
  apiKey: undefined,
  dangerouslyAllowBrowser: true,
});

// Environment variable helper function
const isAPIKeyAvailable = (): boolean => {
  // In a real application, this would check environment variables
  // In this mock version, we assume no API key is available
  return false;
};

// Message type definition
export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Send messages to OpenAI API and get response
 * @param messages History and current messages
 * @returns AI response text
 */
export async function getAIResponse(messages: Message[]): Promise<string> {
  try {
    // If API key is not set, use mock response
    if (!isAPIKeyAvailable()) {
      console.warn('OpenAI API key not set, using mock response');
      return mockAIResponse(messages);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('AI response error:', error);
    return 'An error occurred. Please try again later.';
  }
}

/**
 * Use AI to generate survey questions
 * @param topic Survey topic
 * @param numQuestions Number of questions
 * @returns Generated question array
 */
export async function generateSurveyQuestions(
  topic: string,
  numQuestions: number = 3
): Promise<any[]> {
  // Build prompt
  const prompt = `Generate ${numQuestions} high-quality survey questions about "${topic}". Include open-ended questions, multiple choice questions, and rating questions. For multiple choice questions, provide appropriate options. Return in JSON format with each question containing id, text, type(text/multiChoice/rating) and options (for multiple choice) fields.`;
  
  try {
    if (!isAPIKeyAvailable()) {
      console.warn('OpenAI API key not set, using mock questions');
      return mockSurveyQuestions(topic);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a survey expert capable of generating high-quality survey questions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.questions || [];
    } catch (parseError) {
      console.error('Failed to parse AI response JSON:', parseError);
      return mockSurveyQuestions(topic);
    }
  } catch (error) {
    console.error('Error generating survey questions:', error);
    return mockSurveyQuestions(topic);
  }
}

/**
 * Extract key insights from survey responses
 * @param surveyResponses Survey response data
 * @returns Analysis result
 */
export async function analyzeSurveyResponses(surveyResponses: any): Promise<string> {
  try {
    if (!isAPIKeyAvailable()) {
      console.warn('OpenAI API key not set, using mock analysis');
      return 'Based on survey data analysis, users are generally satisfied with the simplicity and usability of the product interface, but there is room for improvement in terms of feature richness. It is recommended to focus on the core pain points mentioned by users: complex transaction process, incomplete notification system, and mobile adaptation issues.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a data analysis expert skilled at extracting key insights from survey data.' 
        },
        { 
          role: 'user', 
          content: `Analyze the following survey data and extract key insights and recommendations:\n${JSON.stringify(surveyResponses)}` 
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Unable to generate analysis results.';
  } catch (error) {
    console.error('Error analyzing survey responses:', error);
    return 'An error occurred during analysis. Please try again later.';
  }
}

/**
 * Mock AI response (used when no API key is available)
 * @param messages Message history
 * @returns Mock reply
 */
function mockAIResponse(messages: Message[]): string {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Provide preset responses for different types of questions
  if (lastMessage.includes('experience') || lastMessage.includes('problem') || lastMessage.includes('issue')) {
    return 'Thank you for sharing your experience. The issues you mentioned are insightful. Could you describe in more detail the frequency and impact of these problems? This will help us better understand the severity of the issues.';
  } else if (lastMessage.includes('suggestion') || lastMessage.includes('improvement')) {
    return 'Your suggestions are very valuable! I would like to know more about which aspects you think should be prioritized for these improvements. Is it user experience, functionality, or other aspects?';
  } else if (lastMessage.includes('rating') || lastMessage.includes('satisfaction')) {
    return 'Thank you for your rating. We would like to know which specific factors influenced your assessment. Are there specific features or experiences that impressed you or disappointed you?';
  } else {
    return 'Thank you for your feedback! Your opinion is very important to us. Based on what you shared, which aspects do you think we should focus on to improve product quality?';
  }
}

/**
 * Generate mock survey questions
 * @param topic Survey topic
 * @returns Mock question array
 */
function mockSurveyQuestions(topic: string): any[] {
  // Provide different preset questions based on different topics
  if (topic.includes('wallet') || topic.includes('crypto')) {
    return [
      {
        id: 'q1',
        text: 'Which crypto wallets do you currently use? Please describe your frequency of use and main purposes.',
        type: 'text',
        options: []
      },
      {
        id: 'q2',
        text: 'Which features are most important to you in a crypto wallet?',
        type: 'multiChoice',
        options: ['Security', 'Ease of use', 'Transaction speed', 'Low fees', 'Multi-chain support', 'DApp integration']
      },
      {
        id: 'q3',
        text: 'How satisfied are you with your current crypto wallet?',
        type: 'rating',
        options: []
      }
    ];
  } else if (topic.includes('NFT') || topic.includes('digital art')) {
    return [
      {
        id: 'q1',
        text: 'What is your main purpose for buying or creating NFTs?',
        type: 'text',
        options: []
      },
      {
        id: 'q2',
        text: 'What factors are most important to you when choosing an NFT marketplace?',
        type: 'multiChoice',
        options: ['Fees', 'User interface', 'Number of artists', 'Community activity', 'Security', 'Trading liquidity']
      },
      {
        id: 'q3',
        text: 'How valuable do you think NFT technology is for creators?',
        type: 'rating',
        options: []
      }
    ];
  } else {
    // Generic questions
    return [
      {
        id: 'q1',
        text: `Please share your experience with ${topic} and the main issues you've encountered.`,
        type: 'text',
        options: []
      },
      {
        id: 'q2',
        text: `Which factors are most important to you in the ${topic} field?`,
        type: 'multiChoice',
        options: ['User experience', 'Feature richness', 'Performance', 'Security', 'Price', 'Community support']
      },
      {
        id: 'q3',
        text: `How satisfied are you with the current ${topic} solutions in the market?`,
        type: 'rating',
        options: []
      }
    ];
  }
}
