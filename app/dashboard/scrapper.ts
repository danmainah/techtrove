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
  status?: 'pending' | 'approved' | 'rejected';
  network_technology?: string;
  launch_announced?: string;
  launch_status?: string;
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  display_protection?: string;
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  memory_internal?: string;
  main_camera?: string;
  main_camera_features?: string;
  main_camera_video?: string;
  selfie_camera?: string;
  selfie_camera_video?: string;
  sound_loudspeaker?: string;
  sound_3_5mm_jack?: string;
  comms_wlan?: string;
  comms_bluetooth?: string;
  comms_positioning?: string;
  comms_nfc?: string;
  comms_radio?: string;
  comms_usb?: string;
  features_sensors?: string;
  battery_type?: string;
  battery_charging?: string;
  misc_colors?: string;
  misc_models?: string;
  misc_price?: string;
};

type ScrapeResult = {
  success: boolean;
  data: ScrapedData | null;
  message: string;
  errorDetails?: {
    code: string;
    details: string;
    hint: string;
  }
};

async function uploadImageToStorage(url: string, fileName: string): Promise<string | null> {
  try {
    // Fetch the image
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const fileData = Buffer.from(response.data, 'binary');
    
    // Upload to Supabase storage
    const { data, error } = await adminSupabase.storage
      .from('techtrove')
      .upload(`images/${fileName}`, fileData, {
        contentType: response.headers['content-type'],
        upsert: true
      });

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('techtrove')
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function scrapeGsmArena(url: string, userId: string): Promise<ScrapeResult> {
  console.debug('[Scraper] Starting scrape for URL:', url);
  try {
    // Fetch the page
    console.debug('[Scraper] Fetching page content');
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });

    console.debug('[Scraper] Page fetched, parsing content');
    const $ = load(data);

    // Extract basic info
    console.debug('[Scraper] Extracting title');
    const title = $('.specs-phone-name-title').text().trim();
    console.debug('[Scraper] Extracted title:', title);

    // Extract all images from gallery
    console.debug('[Scraper] Extracting images');
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
    console.debug('[Scraper] Found', imageUrls.length, 'images');

    // Upload images to Supabase storage
    console.debug('[Scraper] Uploading images to storage');
    const uploadedImageUrls: string[] = [];
    for (const imgUrl of imageUrls) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
      console.debug('[Scraper] Uploading:', imgUrl, 'as', fileName);
      const uploadedUrl = await uploadImageToStorage(imgUrl, fileName);
      if (uploadedUrl) uploadedImageUrls.push(uploadedUrl);
    }
    console.debug('[Scraper] Successfully uploaded', uploadedImageUrls.length, 'images');

    // Extract specifications
    console.debug('[Scraper] Extracting specifications');
    const specifications = {
      network_technology: '',
      launch_announced: '',
      launch_status: '',
      body_dimensions: '',
      body_weight: '',
      body_build: '',
      body_sim: '',
      display_type: '',
      display_size: '',
      display_resolution: '',
      display_protection: '',
      platform_os: '',
      platform_chipset: '',
      platform_cpu: '',
      platform_gpu: '',
      memory_internal: '',
      main_camera: '',
      main_camera_features: '',
      main_camera_video: '',
      selfie_camera: '',
      selfie_camera_video: '',
      sound_loudspeaker: '',
      sound_3_5mm_jack: '',
      comms_wlan: '',
      comms_bluetooth: '',
      comms_positioning: '',
      comms_nfc: '',
      comms_radio: '',
      comms_usb: '',
      features_sensors: '',
      battery_type: '',
      battery_charging: '',
      misc_colors: '',
      misc_models: '',
      misc_price: ''
    };
    
    // GSMArena specific field mappings
    const fieldMappings: Record<string, keyof typeof specifications> = {
      'network': 'network_technology',
      'announced': 'launch_announced',
      'status': 'launch_status',
      'dimensions': 'body_dimensions',
      'weight': 'body_weight',
      'build': 'body_build',
      'sim': 'body_sim',
      'display type': 'display_type',
      'size': 'display_size',
      'resolution': 'display_resolution',
      'protection': 'display_protection',
      'os': 'platform_os',
      'chipset': 'platform_chipset',
      'cpu': 'platform_cpu',
      'gpu': 'platform_gpu',
      'internal': 'memory_internal',
      'main camera': 'main_camera',
      'features': 'main_camera_features',
      'video': 'main_camera_video',
      'selfie camera': 'selfie_camera',
      'selfie video': 'selfie_camera_video',
      'loudspeaker': 'sound_loudspeaker',
      '3.5mm jack': 'sound_3_5mm_jack',
      'wlan': 'comms_wlan',
      'bluetooth': 'comms_bluetooth',
      'positioning': 'comms_positioning',
      'nfc': 'comms_nfc',
      'radio': 'comms_radio',
      'usb': 'comms_usb',
      'sensors': 'features_sensors',
      'battery type': 'battery_type',
      'charging': 'battery_charging',
      'colors': 'misc_colors',
      'models': 'misc_models',
      'price': 'misc_price',
      // Additional mappings for camera fields
      'single camera': 'main_camera',
      'dual camera': 'main_camera',
      'triple camera': 'main_camera',
      'quad camera': 'main_camera',
      'selfie': 'selfie_camera',
      'single selfie': 'selfie_camera',
      'dual selfie': 'selfie_camera'
    };
    
    $('table').each((i: number, table: Element) => {
      const category = $(table).find('th').text().trim().toLowerCase();
      $(table).find('tr').each((j: number, row: Element) => {
        const specName = $(row).find('.ttl').text().trim().toLowerCase();
        const specValue = $(row).find('.nfo').text().trim();
        
        if (specName && specValue) {
          // Try to find matching field
          const fieldKey = fieldMappings[specName] || fieldMappings[`${category}: ${specName}`];
          
          if (fieldKey) {
            specifications[fieldKey] = specValue;
          } else {
            console.debug('[Scraper] No mapping for:', specName);
          }
        }
      });
    });
    console.debug('[Scraper] Extracted specifications:', specifications);

    // Validate data before insertion
    console.debug('[Scraper] Validating scraped data');
    if (!title || title.trim().length === 0) {
      console.error('[Scraper] Validation failed: Empty title');
      return {
        success: false,
        data: null,
        message: 'Invalid title from scraped page'
      };
    }
    
    if (uploadedImageUrls.length === 0) {
      console.error('[Scraper] Validation failed: No images found');
      return {
        success: false,
        data: null,
        message: 'No valid images found on the page'
      };
    }

    // Save to database
    console.debug('[Scraper] Saving to database');
    const { data: insertedData, error: insertError } = await adminSupabase
      .from('scraped_data')
      .insert({
        source_url: url,
        title,
        short_review: undefined,
        buy_link_1: undefined,
        buy_link_2: undefined,
        image_urls: uploadedImageUrls,
        category: 'Phones',
        status: 'pending',
        added_by: userId,
        ...specifications,
      })
      .select()
      .single(); // Ensure we get a single record

    if (insertError) {
      console.error('[Scraper] Database error:', insertError);
      return {
        success: false,
        data: null,
        message: 'Database error',
        errorDetails: {
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      };
    }
    
    if (!insertedData) {
      console.error('[Scraper] No data returned from insertion');
      return {
        success: false,
        data: null,
        message: 'No data returned from database insertion'
      };
    }
    
    console.debug('[Scraper] Successfully saved data:', insertedData);
    return {
      success: true,
      data: {
        ...insertedData,
        source_url: insertedData.source_url,
        title: insertedData.title,
        image_urls: insertedData.image_urls,
        category: insertedData.category,
        status: insertedData.status,
        ...specifications
      },
      message: 'Successfully scraped and saved data'
    };
  } catch (error) {
    console.error('[Scraper] Unexpected error:', error);
    
    // Handle Server Action not found errors specifically
    if (error instanceof Error && error.message.includes('Failed to find Server Action')) {
      console.error('[Scraper] Server Action error');
      return {
        success: false,
        data: null,
        message: 'Server action expired - please refresh the page and try again'
      };
    }
    
    throw error;
  }
}
