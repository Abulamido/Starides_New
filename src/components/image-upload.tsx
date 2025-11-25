'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
    folder?: string;
    label?: string;
}

export function ImageUpload({ onImageUploaded, currentImage, folder = 'products', label = 'Product Image' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid file',
                description: 'Please select an image file.',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Please select an image smaller than 5MB.',
            });
            return;
        }

        setUploading(true);
        console.log('Starting upload...');
        try {
            // Create a unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name}`;
            const storageRef = ref(storage, `${folder}/${filename}`);
            console.log('Storage ref created:', storageRef.fullPath);

            // Upload file with timeout
            console.log('Uploading bytes...');
            const uploadTask = uploadBytes(storageRef, file);

            // Race against a timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Upload timed out. This is likely a CORS issue on localhost.')), 15000)
            );

            await Promise.race([uploadTask, timeoutPromise]);
            console.log('Upload complete.');

            // Get download URL
            console.log('Getting download URL...');
            const url = await getDownloadURL(storageRef);
            console.log('Got URL:', url);

            setPreviewUrl(url);
            onImageUploaded(url);

            toast({
                title: 'Image uploaded',
                description: 'Your image has been uploaded successfully.',
            });
        } catch (error: any) {
            console.error('Upload error details:', error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: error.message || 'Failed to upload image.',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onImageUploaded('');
    };

    return (
        <div className="space-y-4">
            <Label>{label}</Label>

            {previewUrl ? (
                <div className="relative w-full aspect-square max-w-xs rounded-lg overflow-hidden border">
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="max-w-xs"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
            )}

            {uploading && (
                <p className="text-sm text-muted-foreground">
                    Uploading image...
                </p>
            )}
        </div>
    );
}
