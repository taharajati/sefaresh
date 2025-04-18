'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Loader2, X } from 'lucide-react';

type GalleryImage = {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string;
  created_at: string;
};

interface GalleryDisplayProps {
  category?: string;
  limit?: number;
}

export default function GalleryDisplay({ category, limit }: GalleryDisplayProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<GalleryImage | null>(null);
  const [filters, setFilters] = useState<{category: string}>({
    category: category || '',
  });

  // دریافت تصاویر در هنگام بارگذاری
  useEffect(() => {
    fetchImages();
  }, [category]);

  // دریافت تصاویر از API
  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('خطا در دریافت تصاویر');
      }
      let data = await response.json();
      
      // اعمال فیلتر دسته‌بندی اگر تعیین شده باشد
      if (filters.category) {
        data = data.filter((img: GalleryImage) => img.category === filters.category);
      }
      
      // محدود کردن تعداد تصاویر اگر limit تعیین شده باشد
      if (limit && limit > 0) {
        data = data.slice(0, limit);
      }
      
      setImages(data);
    } catch (error) {
      console.error('خطا:', error);
      setError('خطا در بارگذاری تصاویر. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  // تغییر فیلتر دسته‌بندی
  useEffect(() => {
    if (category !== undefined) {
      setFilters(prev => ({ ...prev, category: category || '' }));
    }
  }, [category]);

  return (
    <div className="w-full">
      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* نمایش تصویر بزرگ */}
      {viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold">{viewImage.title}</h3>
              <button 
                onClick={() => setViewImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={viewImage.image_path}
                  alt={viewImage.title}
                  width={1200}
                  height={800}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="mt-4">
                {viewImage.category && (
                  <div className="text-sm text-violet-600 inline-block bg-violet-50 px-3 py-1 rounded-full mb-2">
                    {viewImage.category}
                  </div>
                )}
                {viewImage.description && (
                  <p className="text-gray-700 mt-2">{viewImage.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* لیست تصاویر */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            هیچ تصویری در گالری وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="aspect-w-16 aspect-h-9 relative group cursor-pointer" 
                onClick={() => setViewImage(image)}
              >
                <Image
                  src={image.image_path}
                  alt={image.title}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{image.title}</h3>
                {image.category && (
                  <div className="text-xs text-violet-600 inline-block bg-violet-50 px-2 py-0.5 rounded-full mt-1">
                    {image.category}
                  </div>
                )}
                {image.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 