'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GalleryDisplay from '../components/GalleryDisplay';

type GalleryImage = {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string;
  created_at: string;
};

export default function GalleryPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // دریافت دسته‌بندی‌های منحصر به فرد
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          throw new Error('خطا در دریافت تصاویر');
        }
        
        const data = await response.json() as GalleryImage[];
        
        // استخراج دسته‌بندی‌های منحصر به فرد
        const uniqueCategories = [...new Set(data.map(img => img.category))]
          .filter(Boolean) as string[]; // حذف مقادیر خالی
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('خطا:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 space-x-reverse">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-violet-600">
                <span>خانه</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-400 rotate-180 mx-2" />
                <span className="text-sm font-medium text-violet-600">گالری تصاویر</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">گالری تصاویر</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            مجموعه‌ای از تصاویر زیبا که می‌توانید بر اساس دسته‌بندی مشاهده کنید
          </p>
        </div>

        {/* فیلتر دسته‌بندی */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === '' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              همه
            </button>
            
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* نمایش تصاویر */}
        <GalleryDisplay category={selectedCategory} />
      </div>
    </div>
  );
} 