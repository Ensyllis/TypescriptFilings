import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.Bayesian_OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { articles, prompt } = await request.json();
    console.log('Received request:', { articleCount: articles.length, prompt });

    if (!Array.isArray(articles) || typeof prompt !== 'string') {
      console.log('Invalid request body:', { articles, prompt });
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const results = await Promise.all(articles.map(async (article, index) => {
      try {
        console.log(`Processing article ${index + 1}`);
        const combinedPrompt = `This is your system Prompt: ${prompt ?? ''}. Remember to keep your answer concise with relevant numbers. Execute your prompt on this: ${article} \n\n Respond with only the value, without any JSON formatting or keys.`;
    
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: combinedPrompt }],
          max_tokens: 200,
        });

        const result = completion.choices[0].message.content;
        console.log(`Received response for article ${index + 1}:`, result?.substring(0, 50) + '...');
        return result;
      } catch (error) {
        console.error(`Error processing article ${index + 1}:`, error);
        return `Error processing article ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }));

    console.log('Processed all articles. Results count:', results.length);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error processing articles:', error);
    return NextResponse.json({ 
      message: 'Error processing articles', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}