import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface CSVRecord {
  Leaf_Nodes: string;
  OpenAI_Summary: string;
  ArticleBody: string;
}

function processLeafNode(node: string): string {
  // Remove braces and single quotes
  let processedNode = node.replace(/[{}''[\]]/g, '').trim();

  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'Grants': 'Employee Stock Options/Grants',
    'Reinstatement': 'Dividend Suspension/Reinstatement',
    'Amendment': 'Credit Facility Arrangement/Amendment',
    'Retirements': 'Executive Resignations/Retirements',
    'Dissolution': 'Subsidiary Creation/Dissolution',
    'Received)': 'Lawsuits (Filed/Received)',
    'Applications': 'Patent Grants/Applications',
    'Rejections': 'FDA Approvals/Rejections',
    'Supplier Contracts': 'Major Customer/Supplier Contracts',
    'Closures': 'Facility Openings/Closures',
    'Layoffs': 'Restructuring/Layoffs',
    'Deaths' : 'Executive Death'
  };

  for (const [key, value] of Object.entries(specialCases)) {
    if (processedNode.includes(key)) {
      return value;
    }
  }

  return processedNode;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'OpenAI_LeafNodes_ManualDataframe.csv');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parse CSV
    const records = parse(fileContents, {
      columns: true,
      skip_empty_lines: true
    }) as CSVRecord[];

    // Process Leaf Nodes
    const processedRecords = records.map(record => ({
      ...record,
      Leaf_Nodes: record.Leaf_Nodes.split(',')
        .map(node => processLeafNode(node.trim()))
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .join(', ')
    }));

    // Extract unique Leaf Nodes
    const uniqueLeafNodes = Array.from(new Set(
      processedRecords.flatMap(record => record.Leaf_Nodes.split(', '))
    )).sort();

    return NextResponse.json({
      records: processedRecords,
      leafNodes: uniqueLeafNodes
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading or parsing CSV file:', error);
    return NextResponse.json({ error: 'Error reading or parsing CSV file' }, { status: 500 });
  }
}