'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Dialog as DialogPrimitive } from 'radix-ui';
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

// --- Filter presets ---
const FILTERS = [
    { label: 'Normal', value: 'none' },
    { label: 'B&W',    value: 'grayscale(100%)' },
    { label: 'Sepia',  value: 'sepia(80%)' },
    { label: 'Fade',   value: 'brightness(1.1) contrast(0.85) saturate(0.8)' },
    { label: 'Vivid',  value: 'saturate(1.8) contrast(1.1)' },
    { label: 'Cool',   value: 'hue-rotate(30deg) saturate(1.2)' },
    { label: 'Warm',   value: 'sepia(30%) saturate(1.4) brightness(1.05)' },
    { label: 'Drama',  value: 'contrast(1.4) brightness(0.9) saturate(1.2)' },
];

const OUTPUT_SIZE = 400; // final image is 400×400 px

// --- Canvas export ---
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', reject);
        img.src = url;
    });
}

async function cropToBlob(imageSrc: string, pixelCrop: Area, filter: string): Promise<Blob> {
    const img = await createImage(imageSrc);

    const canvas = document.createElement('canvas');
    canvas.width  = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Apply filter before drawing
    if (filter !== 'none') ctx.filter = filter;

    // Draw only the cropped region, scaled to OUTPUT_SIZE
    ctx.drawImage(
        img,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, OUTPUT_SIZE, OUTPUT_SIZE,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas is empty'))),
            'image/jpeg',
            0.9,
        );
    });
}

// ---

interface Props {
    open: boolean;
    imageUrl: string;
    onApply: (blob: Blob) => void;
    onCancel: () => void;
}

export function AvatarEditorModal({ open, imageUrl, onApply, onCancel }: Props) {
    const [crop,              setCrop]              = useState<Point>({ x: 0, y: 0 });
    const [zoom,              setZoom]              = useState(1);
    const [filter,            setFilter]            = useState('none');
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isApplying,        setIsApplying]        = useState(false);

    // Reset everything when a new image is loaded into the editor
    useEffect(() => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setFilter('none');
        setCroppedAreaPixels(null);
    }, [imageUrl]);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleApply = async () => {
        if (!croppedAreaPixels) return;
        setIsApplying(true);
        try {
            const blob = await cropToBlob(imageUrl, croppedAreaPixels, filter);
            onApply(blob);
        } catch (e) {
            console.error(e);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
            <DialogPortal>
                {/* Sits above the page's fixed save footer (z-[100]) */}
                <DialogOverlay className="z-110 bg-black/70 backdrop-blur-sm" />

                <DialogPrimitive.Content
                    className={cn(
                        'fixed z-111 outline-none flex flex-col bg-zinc-950',
                        // Mobile: full-screen
                        'inset-0',
                        // Desktop: centered card
                        'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
                        'sm:w-120 sm:max-h-[90dvh] sm:rounded-2xl sm:overflow-hidden',
                    )}
                    onEscapeKeyDown={onCancel}
                    // Prevent accidental dismiss on desktop while dragging
                    onPointerDownOutside={(e) => { e.preventDefault(); onCancel(); }}
                >
                    <DialogTitle className="sr-only">Edit Photo</DialogTitle>
                    <DialogDescription className="sr-only">
                        Drag and pinch to crop. Adjust zoom and apply a filter.
                    </DialogDescription>

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0 bg-zinc-950">
                        <button
                            onClick={onCancel}
                            className="text-zinc-400 hover:text-white transition-colors p-1 -ml-1 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <span className="font-semibold text-white text-sm tracking-wide">Edit Photo</span>
                        <Button
                            size="sm"
                            onClick={handleApply}
                            disabled={isApplying || !croppedAreaPixels}
                            className="min-w-17"
                        >
                            {isApplying ? <Spinner className="h-4 w-4" /> : 'Apply'}
                        </Button>
                    </div>

                    {/* ── Cropper ── flex-1 on mobile (full-screen), explicit height on desktop */}
                    <div className="relative flex-1 sm:flex-none sm:h-80 bg-zinc-950">
                        {imageUrl && (
                            <Cropper
                                image={imageUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                zoomSpeed={0.35}
                                minZoom={1}
                                maxZoom={4}

                                style={{
                                    containerStyle: { background: '#09090b' },
                                    mediaStyle:     { filter },
                                    cropAreaStyle:  {
                                        border:     '2px solid rgba(255,255,255,0.85)',
                                        boxShadow:  '0 0 0 9999px rgba(0,0,0,0.55)',
                                    },
                                }}
                            />
                        )}
                    </div>

                    {/* ── Controls ── */}
                    <div className="shrink-0 bg-zinc-900 border-t border-zinc-800">

                        {/* Zoom slider */}
                        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                            <ZoomOut className="h-4 w-4 text-zinc-500 shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={4}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-1 rounded-full appearance-none bg-zinc-700 accent-white cursor-pointer"
                            />
                            <ZoomIn className="h-4 w-4 text-zinc-500 shrink-0" />
                        </div>

                        {/* Filter strip */}
                        <div className="px-5 pb-5">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Filter</p>
                            <div
                                className="flex gap-3 overflow-x-auto pb-1"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.label}
                                        onClick={() => setFilter(f.value)}
                                        className="flex flex-col items-center gap-1.5 shrink-0"
                                    >
                                        <div className={cn(
                                            'w-14 h-14 rounded-xl overflow-hidden ring-2 transition-all duration-150',
                                            filter === f.value
                                                ? 'ring-white scale-105'
                                                : 'ring-transparent hover:ring-zinc-600',
                                        )}>
                                            {imageUrl && (
                                                <img
                                                    src={imageUrl}
                                                    alt={f.label}
                                                    draggable={false}
                                                    className="w-full h-full object-cover"
                                                    style={{ filter: f.value }}
                                                />
                                            )}
                                        </div>
                                        <span className={cn(
                                            'text-[10px] transition-colors',
                                            filter === f.value ? 'text-white' : 'text-zinc-500',
                                        )}>
                                            {f.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cancel — visible only on mobile (desktop uses the header × button) */}
                        <div className="sm:hidden px-5 pb-6">
                            <Button variant="outline" className="w-full" onClick={onCancel}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
