import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leafNode = searchParams.get('leafNode');
  const useExactMatch = searchParams.get('exactMatch') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);

  if (!leafNode) {
    return NextResponse.json({ error: 'Leaf node parameter is required' }, { status: 400 });
  }

  console.log('Received leaf node:', leafNode);
  console.log('Using exact match:', useExactMatch);
  console.log('Page:', page, 'Page Size:', pageSize);

  try {
    await client.connect();
    const database = client.db('Bayesian');
    const collection = database.collection('entries');

    let query;
    if (useExactMatch) {
      query = { Leaf_Nodes: leafNode };
    } else {
      query = { Leaf_Nodes: { $regex: leafNode, $options: 'i' } };
    }

    console.log('MongoDB query:', JSON.stringify(query));

    const totalCount = await collection.countDocuments(query);
    const entries = await collection
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    console.log('Total entries found:', totalCount);
    console.log('Entries on this page:', entries.length);
    if (entries.length > 0) {
      const summary = entries[0].OpenAI_Summary;
      console.log('First entry OpenAI_Summary:', summary ? summary : 'No summary available');
    }

    return NextResponse.json({
      entries,
      totalCount,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize)
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  } finally {
    await client.close();
  }
}