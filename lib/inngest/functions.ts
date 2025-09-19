import { inngest } from './client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { RESTORATION_PRESETS } from '../constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const processImage = inngest.createFunction(
  {
    id: 'process-image',
    name: 'Process Image Restoration',
  },
  { event: 'image.uploaded' },
  async ({ event, step }) => {
    const { imageId, preset, userId } = event.data;

    // Step 1: Update image status to processing
    await step.run('update-status-processing', async () => {
      await supabase
        .from('images')
        .update({
          status: 'processing',
          processing_started_at: new Date(),
        })
        .eq('id', imageId);
    });

    try {
      // Step 2: Get image details
      const imageData = await step.run('get-image-details', async () => {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('id', imageId)
          .single();

        if (error) throw error;
        return data;
      });

      // Step 3: Get the preset prompt
      const presetConfig = RESTORATION_PRESETS.find(p => p.id === preset);
      if (!presetConfig) {
        throw new Error(`Invalid preset: ${preset}`);
      }

      // Step 4: Process with Gemini AI
      const restoredImageUrl = await step.run('process-with-gemini', async () => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Fetch the original image
        const imageResponse = await fetch(imageData.original_url);
        const imageBlob = await imageResponse.blob();
        const imageBase64 = await blobToBase64(imageBlob);

        // Generate restoration
        const result = await model.generateContent([
          {
            text: presetConfig.prompt,
          },
          {
            inlineData: {
              mimeType: imageBlob.type,
              data: imageBase64,
            },
          },
        ]);

        const response = await result.response;

        // For now, we'll return the original URL
        // In production, you'd extract the restored image from Gemini's response
        // and upload it to storage
        return imageData.original_url;
      });

      // Step 5: Save restoration result
      await step.run('save-restoration', async () => {
        const { error } = await supabase
          .from('restorations')
          .insert({
            image_id: imageId,
            result_url: restoredImageUrl,
            reroll_number: 0,
            credits_used: 1,
            processing_time_ms: Date.now() - new Date(imageData.processing_started_at).getTime(),
          });

        if (error) throw error;
      });

      // Step 6: Update image status to completed
      await step.run('update-status-completed', async () => {
        await supabase
          .from('images')
          .update({
            status: 'completed',
            processing_completed_at: new Date(),
          })
          .eq('id', imageId);
      });

      // Step 7: Deduct credit from user
      await step.run('deduct-credit', async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('clerk_id', userId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              credits_remaining: profile.credits_remaining - 1,
              total_images_processed: profile.total_images_processed + 1,
            })
            .eq('clerk_id', userId);
        }
      });

      // Step 8: Log usage
      await step.run('log-usage', async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (profile) {
          await supabase
            .from('usage_logs')
            .insert({
              user_id: profile.id,
              action: 'restore',
              credits_consumed: 1,
              image_id: imageId,
              metadata: { preset },
            });
        }
      });

      return {
        success: true,
        imageId,
        restoredUrl: restoredImageUrl,
      };

    } catch (error) {
      // Handle failure
      await step.run('update-status-failed', async () => {
        await supabase
          .from('images')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', imageId);
      });

      throw error;
    }
  }
);

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}