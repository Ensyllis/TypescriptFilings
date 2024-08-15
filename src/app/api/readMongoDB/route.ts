import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/dbConnect';  // Adjust the import path as needed

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

  try {
    const client = await clientPromise;
    const db = client.db('Bayesian');  // Replace with your actual database name
    const collection = db.collection<JSONRecord>('TypescriptFiling');  // Replace with your actual collection name

    const records = await collection.find({}).toArray();

    const uniqueLeafNodes = Array.from(new Set(
      records.flatMap(record => record.Leaf_Nodes.split(', '))
    )).sort();

    cachedData = { records, leafNodes: uniqueLeafNodes };
    return cachedData;
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
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