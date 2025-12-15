import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading, update, toast } = useToast();

  const uploadMutation = trpc.post.uploadImage.useMutation();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Erro",
        description: `Máximo de ${maxImages} imagens por post`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate file types and sizes
    const validFiles = filesToUpload.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: `${file.name} não é uma imagem válida`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Erro",
          description: `${file.name} é muito grande (máx 5MB)`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const toastId = loading(
      validFiles.length === 1
        ? "Enviando imagem..."
        : `Enviando ${validFiles.length} imagens...`
    );

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]!;
        
        try {
          // Compress and convert to base64
          const base64 = await compressImage(file);
          const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

          // Upload to S3
          const result = await uploadMutation.mutateAsync({
            file: base64Data!,
            filename: file.name,
          });

          uploadedUrls.push(result.url);
          const progressValue = Math.round(((i + 1) / validFiles.length) * 100);
          setUploadProgress(progressValue);
          
          // Update toast progress
          update(toastId.id, {
            progress: progressValue,
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Erro",
            description: `Erro ao fazer upload de ${file.name}`,
            variant: "destructive",
          });
        }
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
      
      // Update loading toast to success
      update(toastId.id, {
        title: "Sucesso!",
        description:
          uploadedUrls.length === 1
            ? "Imagem enviada com sucesso"
            : `${uploadedUrls.length} imagens enviadas com sucesso`,
        variant: "success",
      });
    } catch (error) {
      // Update loading toast to error
      update(toastId.id, {
        title: "Erro",
        description: "Erro ao fazer upload das imagens",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large (max 1920px)
          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = error => reject(error);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">
                Arraste imagens ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo {maxImages} imagens, até 5MB cada
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enviando...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {images.length} de {maxImages} imagens
        </p>
      )}
    </div>
  );
}
