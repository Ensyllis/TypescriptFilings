import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface JSONRecord {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
}

export async function GET(req: NextRequest) {
  console.log('Starting JSON processing...');
  try {
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    console.log('Attempting to read file from:', filePath);

    const fileContents = await fs.readFile(filePath, 'utf8');
    console.log('File read successfully. First 100 characters:', fileContents.substring(0, 100));

    const records = JSON.parse(fileContents) as JSONRecord[];
    console.log(`Parsed ${records.length} records from JSON`);

    // Since Leaf_Nodes are already processed, we just need to split them for uniqueness check
    const uniqueLeafNodes = Array.from(new Set(
      records.flatMap(record => record.Leaf_Nodes.split(', '))
    )).sort();
    console.log(`Extracted ${uniqueLeafNodes.length} unique leaf nodes`);

    return NextResponse.json({
      records: records,
      leafNodes: uniqueLeafNodes
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error processing JSON file:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error processing JSON file: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred while processing the JSON file' }, { status: 500 });
    }
  }
}