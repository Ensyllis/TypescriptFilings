import { NextRequest, NextResponse } from 'next/server';

interface JSONRecord {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
}

let cachedData: { records: JSONRecord[], leafNodes: string[] } | null = null;

async function getData() {
  if (cachedData) {
    return cachedData;
  }

  const url = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/data.json` 
    : 'http://localhost:3000/data.json';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const records = await response.json() as JSONRecord[];

    const uniqueLeafNodes = Array.from(new Set(
      records.flatMap(record => record.Leaf_Nodes.split(', '))
    )).sort();

    cachedData = { records, leafNodes: uniqueLeafNodes };
    return cachedData;
  } catch (error) {
    console.error('Error fetching or parsing data.json:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log('Processing request...');
  try {
    const data = await getData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error processing data:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error processing data: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred while processing the data' }, { status: 500 });
    }
  }
}