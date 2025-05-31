"use server"

import supabase from '@/lib/supabase';
import { Gadget } from '@/types';

//method to fetch all scraped data
export async function fetchScrapedData() {
    const { data, error } = await supabase.from('scraped_data').select('*');
    if (error) throw error;
    // No longer need to parse or map specifications, just return flat fields
    return data;
}

//method to approve scraped data
export async function approveScrapedData(id: string, gadgetData: Record<string, unknown>) {
    // First get the user ID for this scraped data
    const { data: scrapedItem, error: fetchError } = await supabase
        .from('scraped_data')
        .select('added_by') // Use added_by which is the correct field name in schema.sql
        .eq('id', id)
        .single();
    
    if (fetchError) throw fetchError;
    
    // Extract only the fields that exist in the gadgets table according to schema.sql
    const {
        added_by,
        image_urls,
        
        // Fields to include (match gadgets table schema)
        title,
        short_review,
        buy_link_1,
        buy_link_2,
        category,
        network_technology,
        launch_announced,
        launch_status,
        body_dimensions,
        body_weight,
        body_build,
        body_sim,
        display_type,
        display_size,
        display_resolution,
        display_protection,
        platform_os,
        platform_chipset,
        platform_cpu,
        platform_gpu,
        memory_internal,
        main_camera,
        main_camera_features,
        main_camera_video,
        selfie_camera,
        selfie_camera_video,
        sound_loudspeaker,
        sound_3_5mm_jack,
        comms_wlan,
        comms_bluetooth,
        comms_positioning,
        comms_nfc,
        comms_radio,
        comms_usb,
        features_sensors,
        battery_type,
        battery_charging,
        misc_colors,
        misc_models,
        misc_price
    } = gadgetData;

    // Insert gadget with only the fields that exist in the gadgets table
    const { error: insertError } = await supabase
        .from('gadgets')
        .insert([{
            title,
            short_review,
            buy_link_1,
            buy_link_2,
            category,
            network_technology,
            launch_announced,
            launch_status,
            body_dimensions,
            body_weight,
            body_build,
            body_sim,
            display_type,
            display_size,
            display_resolution,
            display_protection,
            platform_os,
            platform_chipset,
            platform_cpu,
            platform_gpu,
            memory_internal,
            main_camera,
            main_camera_features,
            main_camera_video,
            selfie_camera,
            selfie_camera_video,
            sound_loudspeaker,
            sound_3_5mm_jack,
            comms_wlan,
            comms_bluetooth,
            comms_positioning,
            comms_nfc,
            comms_radio,
            comms_usb,
            features_sensors,
            battery_type,
            battery_charging,
            misc_colors,
            misc_models,
            misc_price,
            created_by: scrapedItem?.added_by || added_by,
            image_url: Array.isArray(image_urls) && image_urls.length > 0 ? image_urls[0] : null
        }]);

    if (insertError) throw insertError;

    // Update the scraped data status to approved
    const { data, error } = await supabase
        .from('scraped_data')
        .update({ status: 'approved' })
        .eq('id', id);

    if (error) throw error;
    return data;
}

//method to delete scraped data
export async function deleteScrapedData(id: string) {
    const { data, error } = await supabase.from('scraped_data').delete().eq('id', id);
    if (error) throw error;
    return data;
}

//method to fetch all gadgets
export async function fetchGadgets() {
    const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

//method to fetch a single gadget by ID
export async function fetchGadgetById(id: string) {
    const { data, error } = await supabase
        .from('gadgets')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error) {
        console.error('Error fetching gadget:', error);
        return null;
    }
    
    return data;
}

//method to add new gadget
export async function addGadget(gadget: Record<string, unknown>) {
    // Extract fields to ensure they match the schema
    const { image_urls, ...validGadgetData } = gadget;
    
    // Insert with correct field structure
    const { data, error } = await supabase.from('gadgets').insert([{
        ...validGadgetData,
        // Convert image_urls array to single image_url if needed
        image_url: Array.isArray(image_urls) && image_urls.length > 0 ? 
            image_urls[0] : (gadget.image_url || null)
    }]);
    
    if (error) throw error;
    return data;
}


//method to delete gadget
export async function deleteGadget(id: string) {
    const { data, error } = await supabase.from('gadgets').delete().eq('id', id);
    if (error) throw error;
    return data;
}

//method to fetch all users
export async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
}

//method to delete user
export async function deleteUser(id: string) {
    const { data, error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return data;
}

//method to edit user role
export async function editUserRole(id: string, role: string) {
    const { data, error } = await supabase.from('users').update({ role }).eq('id', id);
    if (error) throw error;
    return data;
}

//method to fetch gadgets related to main on
export async function fetchRelatedGadgets(category: string) {
    const { data, error } = await supabase.from('gadgets').select('*').eq('category', category).limit(4);
    if (error) throw error;
    return data;
}

//method to update gadget
export async function updateGadget(id: string, gadgetData: Record<string, unknown>) {
    // Extract only the fields that exist in the gadgets table
    const {
        // Fields to include (match gadgets table schema)
        title,
        short_review,
        buy_link_1,
        buy_link_2,
        category,
        network_technology,
        launch_announced,
        launch_status,
        body_dimensions,
        body_weight,
        body_build,
        body_sim,
        display_type,
        display_size,
        display_resolution,
        display_protection,
        platform_os,
        platform_chipset,
        platform_cpu,
        platform_gpu,
        memory_internal,
        main_camera,
        main_camera_features,
        main_camera_video,
        selfie_camera,
        selfie_camera_video,
        sound_loudspeaker,
        sound_3_5mm_jack,
        comms_wlan,
        comms_bluetooth,
        comms_positioning,
        comms_nfc,
        comms_radio,
        comms_usb,
        features_sensors,
        battery_type,
        battery_charging,
        misc_colors,
        misc_models,
        misc_price,
        image_urls
    } = gadgetData;

    // Update gadget with all fields
    const { data, error } = await supabase
        .from('gadgets')
        .update({
            title,
            short_review,
            buy_link_1,
            buy_link_2,
            category,
            network_technology,
            launch_announced,
            launch_status,
            body_dimensions,
            body_weight,
            body_build,
            body_sim,
            display_type,
            display_size,
            display_resolution,
            display_protection,
            platform_os,
            platform_chipset,
            platform_cpu,
            platform_gpu,
            memory_internal,
            main_camera,
            main_camera_features,
            main_camera_video,
            selfie_camera,
            selfie_camera_video,
            sound_loudspeaker,
            sound_3_5mm_jack,
            comms_wlan,
            comms_bluetooth,
            comms_positioning,
            comms_nfc,
            comms_radio,
            comms_usb,
            features_sensors,
            battery_type,
            battery_charging,
            misc_colors,
            misc_models,
            misc_price,
            image_url: Array.isArray(image_urls) && image_urls.length > 0 ? image_urls[0] : (gadgetData.image_url || null)
        })
        .eq('id', id);

    if (error) throw error;
    return data;
}

// Method to track gadget views
export async function trackGadgetView(gadget_id: string, view_type: 'product' | 'category' | 'home'): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!gadget_id) {
    console.error('Cannot track view: gadget_id is missing');
    return { success: false, error: 'gadget_id is required' };
  }

  try {
    console.log(`Tracking view for gadget: ${gadget_id}, type: ${view_type}`);
    
    // First check if there's an existing record for this gadget and view type
    const { data: existingViews, error: queryError } = await supabase
      .from('gadget_views')
      .select('id, count')
      .eq('gadget_id', gadget_id)
      .eq('view_type', view_type)
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking existing views:', queryError.message);
      return { success: false, error: queryError.message };
    }
    
    let result;
    
    if (existingViews) {
      // Update the existing record by incrementing the count
      console.log('Updating existing view record, incrementing count');
      const { data, error } = await supabase
        .from('gadget_views')
        .update({ 
          count: (existingViews.count || 1) + 1,
          viewed_at: new Date().toISOString() // Update the timestamp to the latest view
        })
        .eq('id', existingViews.id)
        .select();
      
      if (error) {
        console.error('Error updating view count:', error.message, error.details);
        return { success: false, error: error.message };
      }
      
      result = data;
    } else {
      // Insert a new record with count = 1
      console.log('Creating new view record with count = 1');
      const { data, error } = await supabase
        .from('gadget_views')
        .insert({
          gadget_id,
          view_type,
          viewed_at: new Date().toISOString(),
          count: 1
        })
        .select();
      
      if (error) {
        console.error('Error creating new view record:', error.message, error.details);
        return { success: false, error: error.message };
      }
      
      result = data;
    }
    
    console.log('View tracked successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception in trackGadgetView:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Local type definition for Gadget
type LocalGadget = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  misc_price?: string;
  image_urls?: string[];
  category?: string;
  brand?: string;
  [key: string]: unknown; // For other properties
};

type LocalGadgetWithViewCount = LocalGadget & {
  view_count: number;
};

// Get most viewed gadgets
export async function getMostViewedGadgets(limit = 5): Promise<LocalGadgetWithViewCount[]> {
  try {
    // Get all gadget views
    const { data: allViews, error: viewsError } = await supabase
      .from('gadget_views')
      .select('gadget_id, count')
      .eq('view_type', 'product')
      .order('count', { ascending: false })
      .limit(limit);
    
    if (viewsError) {
      console.error('Error fetching gadget views:', viewsError);
      return [];
    }
    
    if (!allViews || allViews.length === 0) {
      return [];
    }
    
    // Create a map of gadget IDs to their view counts
    const viewCountMap: Record<string, number> = {};
    const gadgetIds = allViews.map((view) => {
      if (view && view.gadget_id) {
        viewCountMap[view.gadget_id] = view.count || 0;
        return view.gadget_id;
      }
      return '';
    }).filter(Boolean);
    
    if (gadgetIds.length === 0) {
      return [];
    }
    
    // Fetch the gadgets by ID
    const { data: gadgetsData, error: gadgetsError } = await supabase
      .from('gadgets')
      .select('*')
      .in('id', gadgetIds);
      
    if (gadgetsError || !gadgetsData) {
      console.error('Error fetching gadgets by IDs:', gadgetsError);
      return [];
    }
    
    // Sort gadgets in the same order as the view counts
    return gadgetIds
      .map((id: string) => {
        const gadget = gadgetsData.find((g: Gadget) => g.id === id);
        if (gadget) {
          // Add the view count to the gadget object
          return {
            ...gadget,
            view_count: viewCountMap[id] // Add the view count
          } as LocalGadgetWithViewCount;
        }
        return null;
      })
      .filter(Boolean) as LocalGadgetWithViewCount[];
  } catch (error) {
    console.error('Unexpected error in getMostViewedGadgets:', error);
    return [];
  }
}
