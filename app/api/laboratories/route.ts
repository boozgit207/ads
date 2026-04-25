import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: laboratories, error } = await supabase
      .from('laboratoires')
      .select('*')
      .order('nom', { ascending: true });

    if (error) {
      console.error('Error fetching laboratories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ laboratories: laboratories || [] });
  } catch (error: any) {
    console.error('Error in laboratories API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
