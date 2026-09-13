'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HomepageContent } from '@/types/homepage-content';

export async function updateHomepageContent(data: HomepageContent) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Authorization Check
    const { data: sessionData, error: authError } = await supabase.auth.getUser();
    if (authError || !sessionData.user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { id, updated_at, ...updateData } = data;

    const { error } = await supabase
      .from('homepage_content')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error("Supabase update error:", error);
      return { success: false, error: error.message };
    }

    // Revalidate the frontend homepage and admin page
    revalidatePath('/');
    revalidatePath('/admin/homepage-content');

    return { success: true };
  } catch (error) {
    console.error("Action updateHomepageContent failed:", error);
    return { success: false, error: "Internal server error" };
  }
}
