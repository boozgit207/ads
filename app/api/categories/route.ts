import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error: any) {
    console.error('Error in categories API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
