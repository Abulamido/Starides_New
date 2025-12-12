'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    path: string; // e.g., 'users/profile-photos'
    label?: string;
}

export function ImageUpload({ currentImageUrl, onImageUploaded, path, label = "Profile Photo" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const storage = getStorage();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please upload an image file (JPG, PNG)',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Image must be less than 5MB',
            });
            return;
        }

        setIsUploading(true);
        try {
            // Create a unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}.${extension}`;
            const storageRef = ref(storage, `${path}/${filename}`);

            // Upload file
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            setPreviewUrl(downloadUrl);
            onImageUploaded(downloadUrl);

            toast({
                title: 'Image uploaded',
                description: 'Your profile photo has been updated.',
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Could not upload image. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={previewUrl || ''} alt={label} />
                <AvatarFallback className="bg-muted">
                    {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
                <Label className="font-medium">{label}</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerFileInput}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 5MB.
                </p>
            </div>
        </div>
    );
}


