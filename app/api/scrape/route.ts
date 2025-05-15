import { NextResponse } from 'next/server';
import { scrapeGsmArena } from '@/app/dashboard/scrapper';

export async function POST(request: Request) {
  try {
    const { url, user } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }
    
    // Validate it's a GSM Arena URL
    if (!url.includes('gsmarena.com')) {
      return NextResponse.json(
        { error: 'Only GSM Arena URLs are supported' },
        { status: 400 }
      );
    }
    
    const result = await scrapeGsmArena(url, user);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scraping failed' },
      { status: 500 }
    );
  }
}
