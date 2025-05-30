"use server"

import supabase from '@/lib/supabase';

//method to fetch all scraped data
export async function fetchScrapedData() {
    const { data, error } = await supabase.from('scraped_data').select('*');
    if (error) throw error;
    // No longer need to parse or map specifications, just return flat fields
    return data;
}

//method to approve scraped data
export async function approveScrapedData(id: string, gadgetData: any) {
    // First get the user ID for this scraped data
    const { data: scrapedItem, error: fetchError } = await supabase
        .from('scraped_data')
        .select('added_by') // Use added_by which is the correct field name in schema.sql
        .eq('id', id)
        .single();
    
    if (fetchError) throw fetchError;
    
    // Extract only the fields that exist in the gadgets table according to schema.sql
    const {
        // Fields to exclude (not in gadgets table)
        id: recordId, // Rename to avoid duplicate identifier
        created_at,
        added_by,
        created_by,
        source_url, // Not in gadgets table
        image_urls, // Convert to image_url
        status,
        specifications,
        
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
export async function addGadget(gadget: any) {
    // Extract fields to ensure they match the schema
    const {
        specifications, // Remove if present (legacy)
        image_urls, // Handle array to single image_url
        ...validGadgetData
    } = gadget;
    
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

//method to approve gadget
export async function approveGadget(id: string) {
    // Since we're updating the gadget directly, we don't need to update status
    // The status is only relevant for scraped_data table
    return { success: true };
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
