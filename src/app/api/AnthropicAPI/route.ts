import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
        console.log(`Processing article ${index + 1}`);
        const combinedPrompt = `This is your system Prompt: ${prompt}. Remember to keep your answer concise with relevant numbers. Execute your prompt on this: ${article}`;
        const msg = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 200,
          messages: [
            { role: "user", content: combinedPrompt }
          ],
        });
        console.log(`Received response for article ${index + 1}:`, msg.content[0].text.substring(0, 50) + '...');
        return msg.content[0].text;
      }));

    console.log('Processed all articles. Results count:', results.length);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error processing articles:', error);
    return NextResponse.json({ message: 'Error processing articles' }, { status: 500 });
  }
}