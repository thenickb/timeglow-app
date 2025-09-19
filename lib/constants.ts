import { PresetOption } from '@/types/database';

export const RESTORATION_PRESETS: PresetOption[] = [
  {
    id: 'automagic',
    name: 'Automagic',
    description: 'Intelligent automatic restoration',
    icon: '✨',
    prompt: 'Intelligently restore this photo: remove scratches, dust, and damage; reduce noise while preserving detail; correct color cast and fading; enhance clarity naturally; maintain authentic vintage character'
  },
  {
    id: 'colorize',
    name: 'Colorize',
    description: 'Add natural colors to B&W photos',
    icon: '🎨',
    prompt: 'Transform this black and white photo to color with historically accurate tones; use natural skin tones; avoid oversaturation; preserve original texture and grain; maintain period-appropriate color palette'
  },
  {
    id: 'denoise',
    name: 'Denoise',
    description: 'Remove grain and digital noise',
    icon: '🔇',
    prompt: 'Remove noise and grain from this photo while preserving important details; eliminate digital artifacts; maintain sharp edges; preserve texture in faces and important areas'
  },
  {
    id: 'fix-tears',
    name: 'Fix Tears',
    description: 'Repair torn and damaged areas',
    icon: '🩹',
    prompt: 'Repair torn edges, rips, and missing sections in this photo; reconstruct damaged areas naturally; blend repairs seamlessly; maintain photo\'s original character'
  },
  {
    id: 'remove-stains',
    name: 'Remove Stains',
    description: 'Clean water damage and discoloration',
    icon: '🧽',
    prompt: 'Remove water damage, coffee stains, foxing, and discoloration from this photo; restore original colors; eliminate yellowing; preserve important details'
  },
  {
    id: 'enhance-faces',
    name: 'Enhance Faces',
    description: 'Sharpen facial features naturally',
    icon: '👤',
    prompt: 'Sharpen and enhance facial features in this photo while keeping natural appearance; improve eye clarity; enhance facial details; avoid artificial smoothing'
  },
  {
    id: 'film-grain',
    name: 'Film Grain',
    description: 'Preserve authentic vintage texture',
    icon: '📽️',
    prompt: 'Restore this photo while preserving authentic film grain and vintage texture; maintain period character; enhance without modernizing'
  },
  {
    id: 'document',
    name: 'Document Mode',
    description: 'Optimize for text and documents',
    icon: '📄',
    prompt: 'Optimize this document, certificate, or newspaper for readability; enhance text clarity; remove background stains; improve contrast; straighten if needed'
  }
];

export const APP_CONFIG = {
  name: 'TimeGlow',
  tagline: 'Restore precious memories with AI',
  monthlyPrice: 29,
  launchPrice: 15,
  creditsPerMonth: 50,
  freeRerolls: 5,
  maxFileSizeMB: 20,
  launchPromoCode: 'LAUNCH50',
  launchDiscountPercent: 50,
  supportedFormats: ['image/jpeg', 'image/png', 'image/tiff'],
  maxProcessingTimeMs: 30000,
  storageRetentionDays: 30
};