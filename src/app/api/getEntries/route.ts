import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leafNode = searchParams.get('leafNode');

  if (!leafNode) {
    return NextResponse.json({ error: 'Leaf node parameter is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('entries');

    const entries = await collection.find({ Leaf_Nodes: { $regex: leafNode, $options: 'i' } }).toArray();

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  } finally {
    await client.close();
  }
}