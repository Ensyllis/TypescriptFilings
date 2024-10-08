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
      try {
        console.log(`Processing article ${index + 1}`);
        const combinedPrompt = `This is your system Prompt: ${prompt ?? ''}. Remember to keep your answer concise with relevant numbers. Execute your prompt on this: ${article}`;
        const msg = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 200,
          messages: [
            { role: "user", content: combinedPrompt }
          ],
        });
    
        console.log('Message content:', msg.content);
    
        if (Array.isArray(msg.content) && msg.content.length > 0) {
          const content = msg.content[0];
          if ('text' in content) {
            console.log(`Received response for article ${index + 1}:`, content.text.substring(0, 50) + '...');
            return content.text;
          } else {
            console.error('Unexpected content structure:', content);
            return 'Error: Unexpected response structure';
          }
        } else {
          console.error('Unexpected message structure:', msg);
          return 'Error: Unexpected message structure';
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error processing article ${index + 1}:`, error);
          return `Error processing article ${index + 1}: ${error.message}`;
        } else {
          console.error(`Unknown error processing article ${index + 1}:`, error);
          return `Error processing article ${index + 1}: Unknown error`;
        }
      }
    }));
    
    console.log('Processed all articles. Results count:', results.length);
    return NextResponse.json({ results });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error processing articles:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ message: 'Error processing articles', error: error.message, stack: error.stack }, { status: 500 });
      } else {
        console.error('Unknown error processing articles:', error);
        return NextResponse.json({ message: 'Error processing articles', error: 'Unknown error' }, { status: 500 });
      }
    }
  }