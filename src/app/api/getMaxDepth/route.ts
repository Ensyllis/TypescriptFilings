// pages/api/getMaxDepth.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET(req: NextRequest) {
  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('leaf_nodes');

    const result = await collection.aggregate([
      { $unwind: "$depth" },
      { $group: { _id: null, maxDepth: { $max: "$depth" } } }
    ]).toArray();

    const maxDepth = result[0]?.maxDepth || 1;
    console.log('API: Calculated maxDepth:', maxDepth);

    return NextResponse.json({ maxDepth }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch max depth:', error);
    return NextResponse.json({ error: 'Failed to fetch max depth' }, { status: 500 });
  } finally {
    await client.close();
  }
}