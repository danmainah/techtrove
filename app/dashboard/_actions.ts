"use server"

import supabase from '@/lib/supabase';

//method to fetch all scraped data
export async function fetchScrapedData() {
    const { data, error } = await supabase.from('scraped_data').select('*');
    if (error) throw error;
    return data;
}

//method to approve scraped data
export async function approveScrapedData(id: string, gadgetData: any) {
    const { 
      added_by, 
      image_urls,
      source_url,
      short_review,
      buy_link_1,
      buy_link_2,
      status,
      ...validGadgetData 
    } = gadgetData;

    const { error: insertError } = await supabase
        .from('gadgets')
        .insert([{
          ...validGadgetData,
          specifications: JSON.stringify(validGadgetData.specifications),
          created_by: added_by,
          image_url: image_urls[0]
        }]);

    if (insertError) throw insertError;

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
    const { data, error } = await supabase.from('gadgets').select('*');
    if (error) throw error;
    return data;
}

//method to add new gadget
export async function addGadget(gadget: any) {
    const { data, error } = await supabase.from('gadgets').insert([gadget]);
    if (error) throw error;
    return data;
}

//method to approve gadget
export async function approveGadget(id: string) {
    const { data, error } = await supabase.from('gadgets').update({ status: 'approved' }).eq('id', id);
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