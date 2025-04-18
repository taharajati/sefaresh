'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlusCircle, Pencil, Trash2, Eye, Loader2, X } from 'lucide-react';
import GalleryImageForm from '@/app/components/GalleryImageForm';

type GalleryImage = {
  id: number;
  title: string;
  description: string;
  category: string;
  image_path: string;
  created_at: string;
};

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [viewImage, setViewImage] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  // دریافت تصاویر در هنگام بارگذاری
  useEffect(() => {
    fetchImages();
  }, []);

  // استخراج دسته‌بندی‌های منحصر به فرد
  useEffect(() => {
    const categories = images
      .map(img => img.category)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index);
    setUniqueCategories(categories);
  }, [images]);

  // دریافت تصاویر از API
  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('خطا در دریافت تصاویر');
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('خطا:', error);
      setError('خطا در بارگذاری تصاویر. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  // ذخیره تصویر جدید
  const handleSaveImage = async (formData: FormData) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در ذخیره تصویر');
      }

      await fetchImages();
      setShowAddForm(false);
    } catch (error) {
      console.error('خطا:', error);
      throw error;
    }
  };

  // بروزرسانی تصویر
  const handleUpdateImage = async (id: number, formData: FormData) => {
    try {
      // اگر تصویر جدیدی آپلود نشده باشد، از روش PUT استفاده می‌کنیم
      if (!formData.has('image')) {
        const title = formData.get('title')?.toString() || '';
        const description = formData.get('description')?.toString() || '';
        const category = formData.get('category')?.toString() || '';

        const response = await fetch(`/api/gallery/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description, category }),
        });

        if (!response.ok) {
          throw new Error('خطا در بروزرسانی تصویر');
        }
      } else {
        // اگر تصویر جدید آپلود شده باشد، ابتدا تصویر قبلی را حذف می‌کنیم
        await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        // سپس یک تصویر جدید اضافه می‌کنیم
        await fetch('/api/gallery', {
          method: 'POST',
          body: formData,
        });
      }

      await fetchImages();
      setEditingImage(null);
    } catch (error) {
      console.error('خطا:', error);
      throw error;
    }
  };

  // حذف تصویر
  const handleDeleteImage = async (id: number) => {
    setIsDeleting(true);
    setDeletingId(id);
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('خطا در حذف تصویر');
      }

      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error('خطا:', error);
      setError('خطا در حذف تصویر. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // فیلتر کردن تصاویر
  const filteredImages = images.filter(img => {
    const matchesSearch = filter === '' || 
      img.title.toLowerCase().includes(filter.toLowerCase()) || 
      (img.description && img.description.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || img.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">مدیریت گالری تصاویر</h1>

      {/* فرم جستجو و فیلتر */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              جستجو
            </label>
            <input
              type="text"
              id="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="جستجو بر اساس عنوان یا توضیحات..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              فیلتر بر اساس دسته‌بندی
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {uniqueCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>افزودن تصویر جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* فرم افزودن تصویر جدید */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">افزودن تصویر جدید</h2>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <GalleryImageForm
            onSave={handleSaveImage}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* فرم ویرایش تصویر */}
      {editingImage && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">ویرایش تصویر</h2>
            <button 
              onClick={() => setEditingImage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <GalleryImageForm
            onSave={(formData) => handleUpdateImage(editingImage.id, formData)}
            onCancel={() => setEditingImage(null)}
            initialImage={editingImage}
          />
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
                <p className="text-gray-500 text-sm mt-2">
                  تاریخ آپلود: {new Date(viewImage.created_at).toLocaleDateString('fa-IR')}
                </p>
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
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            {filter || categoryFilter ? 'هیچ تصویری با این فیلتر یافت نشد.' : 'هیچ تصویری در گالری وجود ندارد.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 relative group cursor-pointer" onClick={() => setViewImage(image)}>
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
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingImage(image);
                    }}
                    className="p-2 text-violet-600 hover:bg-violet-50 rounded-md"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
                        handleDeleteImage(image.id);
                      }
                    }}
                    disabled={isDeleting && deletingId === image.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    {isDeleting && deletingId === image.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 