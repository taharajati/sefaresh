'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Save, Plus, ImageIcon, Loader2 } from 'lucide-react';

type GalleryImage = {
  id?: number;
  title: string;
  description: string;
  category: string;
  image_path: string | null;
};

interface GalleryImageFormProps {
  onSave: (image: FormData) => Promise<void>;
  onCancel?: () => void;
  initialImage?: GalleryImage;
}

const INITIAL_IMAGE: GalleryImage = {
  title: '',
  description: '',
  category: '',
  image_path: null,
};

export default function GalleryImageForm({ onSave, onCancel, initialImage }: GalleryImageFormProps) {
  const [formData, setFormData] = useState<GalleryImage>(initialImage || INITIAL_IMAGE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage?.image_path || null);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // دریافت دسته‌بندی‌ها در هنگام بارگذاری
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('خطا در دریافت دسته‌بندی‌ها:', error);
      }
    };

    fetchCategories();
  }, []);

  // بروزرسانی فرم با مقادیر اولیه
  useEffect(() => {
    if (initialImage) {
      setFormData(initialImage);
      setPreviewUrl(initialImage.image_path);
    }
  }, [initialImage]);

  // مدیریت تغییرات فرم
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // مدیریت آپلود عکس
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // نمایش پیش‌نمایش عکس
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // حذف عکس
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, image_path: null });
  };

  // ایجاد دسته‌بندی جدید
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (response.ok) {
        const category = await response.json();
        setCategories([...categories, category]);
        setFormData({ ...formData, category: category.name });
        setNewCategory('');
        setShowCategoryInput(false);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'خطا در ایجاد دسته‌بندی');
      }
    } catch (error) {
      setErrorMessage('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // ارسال فرم
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // بررسی اعتبارسنجی
    if (!formData.title.trim()) {
      setErrorMessage('عنوان تصویر الزامی است');
      return;
    }

    if (!imageFile && !formData.image_path) {
      setErrorMessage('لطفاً یک تصویر انتخاب کنید');
      return;
    }

    setIsLoading(true);

    try {
      // ایجاد FormData برای ارسال
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      data.append('category', formData.category || '');
      
      // اضافه کردن فایل تصویر اگر انتخاب شده باشد
      if (imageFile) {
        data.append('image', imageFile);
      }

      await onSave(data);
      
      // بازنشانی فرم
      setFormData(INITIAL_IMAGE);
      setImageFile(null);
      setPreviewUrl(null);
      setSuccessMessage('تصویر با موفقیت ذخیره شد');
    } catch (error) {
      setErrorMessage('خطا در ذخیره‌سازی تصویر');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* نمایش پیام خطا */}
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* نمایش پیام موفقیت */}
      {successMessage && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* آپلود عکس */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          تصویر <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-4">
          {/* پیش‌نمایش تصویر */}
          {previewUrl ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <Image 
                src={previewUrl} 
                alt="پیش‌نمایش تصویر" 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
                unoptimized={previewUrl.startsWith('data:')}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
          
          {/* دکمه آپلود */}
          <div>
            <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>انتخاب تصویر</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              فرمت‌های مجاز: JPG، PNG، GIF (حداکثر 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* عنوان تصویر */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          عنوان تصویر <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* دسته‌بندی */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          دسته‌بندی
        </label>
        
        {showCategoryInput ? (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              placeholder="نام دسته‌بندی جدید"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowCategoryInput(false)}
              className="btn btn-secondary"
            >
              انصراف
            </button>
          </div>
        ) : (
          <div className="mt-1 flex gap-2">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCategoryInput(true)}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* توضیحات */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          توضیحات
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* دکمه‌های عملیات */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            انصراف
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>ذخیره تصویر</span>
        </button>
      </div>
    </form>
  );
} 