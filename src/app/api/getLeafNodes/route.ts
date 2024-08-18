import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('leaf_nodes');

    const leafNodes = await collection.find({}).toArray();

    const formattedLeafNodes = leafNodes.map(node => ({
      name: node.name,
      percentage: node.percentage.toFixed(2) // Round to 2 decimal places
    }));

    return NextResponse.json(formattedLeafNodes, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch leaf nodes:', error);
    return NextResponse.json({ error: 'Failed to fetch leaf nodes' }, { status: 500 });
  } finally {
    await client.close();
  }
}