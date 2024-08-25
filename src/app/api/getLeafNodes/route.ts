// pages/api/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const depth = searchParams.get('depth');

  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('leaf_nodes');

    let query = {};
    if (depth) {
      query = { depth: parseInt(depth, 10) };
    }

    const leafNodes = await collection.find(query).sort({ percentage: -1 }).toArray();

    const formattedLeafNodes = leafNodes.map(node => ({
      name: node.name,
      percentage: node.percentage.toFixed(2),
      depth: node.depth
    }));

    return NextResponse.json(formattedLeafNodes, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch leaf nodes:', error);
    return NextResponse.json({ error: 'Failed to fetch leaf nodes' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function getMaxDepth() {
  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('leaf_nodes');

    const result = await collection.aggregate([
      { $unwind: "$depth" },  // Deconstruct the depth array
      { $group: { _id: null, maxDepth: { $max: "$depth" } } }  // Find the max across all depth values
    ]).toArray();

    const maxDepth = result[0]?.maxDepth || 1;
    console.log('API: Calculated maxDepth:', maxDepth);  // Add this log

    return NextResponse.json({ maxDepth }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch max depth:', error);
    return NextResponse.json({ error: 'Failed to fetch max depth' }, { status: 500 });
  } finally {
    await client.close();
  }
}