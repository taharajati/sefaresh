'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Pencil, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import ProductForm from '@/app/components/ProductForm';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_path: string | null;
  created_at: string;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // دریافت محصولات
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('خطا در دریافت محصولات');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('خطا در دریافت اطلاعات از سرور');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // حذف محصول
  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('خطا در حذف محصول');
      }

      // بروزرسانی لیست محصولات
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('خطا در حذف محصول:', error);
      alert('خطا در حذف محصول');
    } finally {
      setDeletingId(null);
    }
  };

  // فرمت قیمت
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-violet-600">
                  پنل مدیریت
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-400 rotate-180 mx-2" />
                <span className="text-sm font-medium text-violet-600">مدیریت محصولات</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">مدیریت محصولات</h1>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddForm(!showAddForm);
              }}
              className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
            >
              {showAddForm ? (
                'انصراف'
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>افزودن محصول جدید</span>
                </>
              )}
            </button>
          </div>

          {/* فرم اضافه کردن محصول */}
          {showAddForm && !editingProduct && (
            <div className="border-b border-gray-200">
              <div className="bg-gray-50 p-4">
                <h2 className="text-lg font-medium text-gray-900">افزودن محصول جدید</h2>
              </div>
              <ProductForm onSave={() => {
                setShowAddForm(false);
                fetchProducts();
              }} />
            </div>
          )}

          {/* فرم ویرایش محصول */}
          {editingProduct && (
            <div className="border-b border-gray-200">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">ویرایش محصول: {editingProduct.name}</h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  انصراف
                </button>
              </div>
              <ProductForm 
                product={editingProduct} 
                isEdit={true}
                onSave={() => {
                  setEditingProduct(null);
                  fetchProducts();
                }} 
              />
            </div>
          )}

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* نمایش محصولات */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                <span className="mr-2">در حال بارگذاری...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                هیچ محصولی یافت نشد. محصول جدیدی اضافه کنید.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      محصول
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      دسته‌بندی
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      قیمت
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                            {product.image_path ? (
                              <Image
                                src={product.image_path}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-400 text-xs">
                                بدون تصویر
                              </div>
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description.length > 50 
                                  ? `${product.description.substring(0, 50)}...` 
                                  : product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category || 'بدون دسته‌بندی'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(product.price)} تومان
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="ویرایش محصول"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className={`text-red-600 hover:text-red-900 ${deletingId === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="حذف محصول"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 