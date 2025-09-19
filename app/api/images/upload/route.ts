import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits_remaining')
      .eq('clerk_id', userId)
      .single();

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            clerk_id: userId,
            credits_remaining: 50,
            credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ])
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      if (!newProfile) {
        return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
      }
    }

    // Check if user has credits
    if (profile && profile.credits_remaining <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 });
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const preset = formData.get('preset') as string || 'automagic';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('original-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('original-images')
      .getPublicUrl(fileName);

    // Create image record in database
    const { data: imageRecord, error: imageError } = await supabase
      .from('images')
      .insert([
        {
          user_id: profile?.id,
          original_url: publicUrl,
          original_size_bytes: file.size,
          status: 'pending',
          preset_used: preset,
        },
      ])
      .select()
      .single();

    if (imageError) {
      console.error('Database error:', imageError);
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageId: imageRecord.id,
      url: publicUrl,
      message: 'Image uploaded successfully',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}