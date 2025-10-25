import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article');

    if (articleId) {
      // Return specific article content
      const filePath = path.join(process.cwd(), 'app', 'docs', 'content', `${articleId}.md`);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return NextResponse.json({ content });
      } else {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
    } else {
      // Return documentation structure
      const structurePath = path.join(process.cwd(), 'app', 'docs', 'content', 'documentation.json');
      const structure = JSON.parse(fs.readFileSync(structurePath, 'utf-8'));
      return NextResponse.json(structure);
    }
  } catch (error) {
    console.error('Error loading documentation:', error);
    return NextResponse.json({ error: 'Failed to load documentation' }, { status: 500 });
  }
}
