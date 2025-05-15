"use server"

import supabase, { adminSupabase } from '@/lib/supabase';
import axios from 'axios';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

type ScrapedData = {
  source_url: string;
  title: string;
  short_review?: string;
  buy_link_1?: string;
  buy_link_2?: string;
  image_urls: string[];
  category: string;
  specifications: Record<string, string>;
};


async function uploadImageToStorage(url: string, fileName: string): Promise<string | null> {
  try {
    // Fetch the image
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const fileData = Buffer.from(response.data, 'binary');
    
    // Upload to Supabase storage
    const { data, error } = await adminSupabase.storage
      .from('troveassets')
      .upload(`images/${fileName}`, fileData, {
        contentType: response.headers['content-type'],
        upsert: true
      });

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('troveassets')
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function scrapeGsmArena(url: string, userId: string): Promise<ScrapedData> {
  try {
    // Fetch the page
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });
    const $ = load(data);

    // Extract basic info
    const title = $('.specs-phone-name-title').text().trim();

    // Extract all images from gallery
    const imageUrls: string[] = [];
    $('.specs-photo-main img').each((i, img) => {
      const src = $(img).attr('src');
      if (src) imageUrls.push(src);
    });

    // Also check the thumbnail gallery
    $('.article-thumbnails a').each((i, a) => {
      const href = $(a).attr('href');
      if (href) imageUrls.push(href);
    });

    // Upload images to Supabase storage
    const uploadedImageUrls: string[] = [];
    for (const imgUrl of imageUrls) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
      const uploadedUrl = await uploadImageToStorage(imgUrl, fileName);
      if (uploadedUrl) uploadedImageUrls.push(uploadedUrl);
    }

    // Extract specifications
    const specifications: Record<string, string> = {};
    $('table').each((i: number, table: Element) => {
      const category = $(table).find('th').text().trim();
      $(table).find('tr').each((j: number, row: Element) => {
        const specName = $(row).find('.ttl').text().trim();
        const specValue = $(row).find('.nfo').text().trim();
        if (specName && specValue) {
          specifications[`${category}: ${specName}`] = specValue;
        }
      });
    });

    // Prepare data for Supabase
    const scrapedData: ScrapedData = {
      source_url: url,
      title,
      image_urls: uploadedImageUrls,
      category: 'Phones',
      specifications,
    };

    // Save to database
    const { data: insertedData, error: insertError } = await adminSupabase
      .from('scraped_data')
      .insert({
        source_url: url,
        title,
        short_review: undefined,
        buy_link_1: undefined,
        buy_link_2: undefined,
        image_urls: uploadedImageUrls, // Removed wrapping in array for text[] column
        category: 'Phones',
        specifications,
        status: 'pending',
        added_by: userId
      })
      .select();

    if (insertError) throw insertError;
    
    return scrapedData;
  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  }
}
