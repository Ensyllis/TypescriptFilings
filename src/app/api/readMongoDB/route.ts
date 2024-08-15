import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface JSONRecord {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
}

let cachedData: { records: JSONRecord[], leafNodes: string[] } | null = null;

// MongoDB connection string
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

async function getData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection<JSONRecord>('TypescriptFiling');

    const records = await collection.find({}).toArray();

    const uniqueLeafNodes = Array.from(new Set(
      records.flatMap(record => record.Leaf_Nodes.split(', '))
    )).sort();

    cachedData = { records, leafNodes: uniqueLeafNodes };
    return cachedData;
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    throw error;
  } finally {
    await client.close();
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