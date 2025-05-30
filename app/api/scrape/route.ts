import { NextResponse } from 'next/server';
import { scrapeGsmArena } from '@/app/dashboard/scrapper';

type ScrapedData = {
  network?: string;
  launch?: {
    announced?: string;
    status?: string;
  };
  body?: {
    dimensions?: string;
    weight?: string;
    build?: string;
    sim?: string;
  };
  display?: {
    type?: string;
    size?: string;
    resolution?: string;
    protection?: string;
  };
  platform?: {
    os?: string;
    chipset?: string;
    cpu?: string;
    gpu?: string;
  };
  memory?: {
    internal?: string;
  };
  camera?: {
    main?: string;
    features?: string;
    video?: string;
  };
  selfie?: {
    camera?: string;
    video?: string;
  };
  sound?: {
    loudspeaker?: string;
    jack?: string;
  };
  comms?: {
    wlan?: string;
    bluetooth?: string;
    positioning?: string;
    nfc?: string;
    radio?: string;
    usb?: string;
  };
  features?: {
    sensors?: string;
  };
  battery?: {
    type?: string;
    charging?: string;
  };
  misc?: {
    colors?: string;
    models?: string;
    price?: string;
  };
  [key: string]: any;
};

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
    
    if (!result.success || !result.data) {
      console.error('Scraping failed:', result.message);
      return NextResponse.json(
        { error: result.message || 'Scraping failed' },
        { status: 400 }
      );
    }
    
    // The data is already in the correct format from the scraper
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scraping failed' },
      { status: 500 }
    );
  }
}
