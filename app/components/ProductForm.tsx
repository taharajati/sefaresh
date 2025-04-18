'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Save, Plus, ImageIcon, Loader2 } from 'lucide-react';

type Product = {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_path: string | null;
};

type Category = {
  id: number;
  name: string;
  description: string;
};

interface ProductFormProps {
  product?: Product;
  onSave?: () => void;
  isEdit?: boolean;
}

const INITIAL_PRODUCT: Product = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image_path: null,
};

export default function ProductForm({ product = INITIAL_PRODUCT, onSave, isEdit = false }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image_path);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // دریافت دسته‌بندی‌ها از API
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

  // مدیریت تغییرات فرم
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // تبدیل مقدار قیمت به عدد
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // بررسی اعتبارسنجی فیلدها
      if (!formData.name) {
        throw new Error('نام محصول الزامی است');
      }
      
      if (formData.price <= 0) {
        throw new Error('قیمت محصول باید بیشتر از صفر باشد');
      }

      // ایجاد formData برای ارسال
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description || '');
      productFormData.append('price', formData.price.toString());
      
      if (formData.category) {
        productFormData.append('category', formData.category);
      }
      
      if (imageFile) {
        productFormData.append('image', imageFile);
      }

      // تعیین متد و URL بر اساس ویرایش یا ایجاد محصول جدید
      const url = isEdit && product.id 
        ? `/api/products/${product.id}` 
        : '/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: productFormData,
      });

      if (response.ok) {
        const savedProduct = await response.json();
        setSuccessMessage(isEdit ? 'محصول با موفقیت بروزرسانی شد' : 'محصول جدید با موفقیت ایجاد شد');
        
        // اگر ویرایش نیست، فرم را پاک کن
        if (!isEdit) {
          setFormData(INITIAL_PRODUCT);
          setImageFile(null);
          setPreviewUrl(null);
        }
        
        // صدا زدن callback در صورت وجود
        if (onSave) {
          onSave();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'خطا در ذخیره محصول');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('خطای ناشناخته');
      }
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
          تصویر محصول
        </label>
        
        <div className="flex items-center gap-4">
          {/* پیش‌نمایش تصویر */}
          {previewUrl ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <Image 
                src={previewUrl.startsWith('data:') ? previewUrl : previewUrl} 
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

      {/* نام محصول */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          نام محصول <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
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
        <div className="flex gap-2">
          {showCategoryInput ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                placeholder="نام دسته‌بندی جدید"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isLoading}
                className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'افزودن'}
              </button>
              <button
                type="button"
                onClick={() => setShowCategoryInput(false)}
                className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                انصراف
              </button>
            </div>
          ) : (
            <>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
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
                className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                title="افزودن دسته‌بندی جدید"
              >
                <Plus className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* قیمت */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          قیمت (تومان) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* توضیحات */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          توضیحات محصول
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
        />
      </div>

      {/* دکمه‌های فرم */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              <span>در حال پردازش...</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              <span>{isEdit ? 'بروزرسانی محصول' : 'ذخیره محصول'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
} 