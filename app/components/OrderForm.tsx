'use client';

import { useFormik } from 'formik';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import { orderSchema } from '../lib/validation';
import { submitOrder } from '../lib/api';
import { useState } from 'react';
import { Upload, Image, Instagram, Palette, Store, Phone, Tag, MessageSquare, Plus, ArrowRight, MapPin, MessageCircle, Package, ShoppingCart, Globe, FileText, Users, CreditCard, Zap, ChevronDown, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface FormValues {
  // Basic Information
  storeName: string;
  businessType: string;
  province: string;
  city: string;
  address: string;
  phoneNumber: string;
  whatsapp: string;
  telegram: string;

  // Branding
  logo: File | null;
  favoriteColor: string;
  preferredFont: string;
  brandSlogan: string;
  categories: string;
  estimatedProducts: string;
  productDisplayType: string;
  specialFeatures: string;
  productImages: File[];

  // Pricing Plan
  pricingPlan: string;
  additionalModules: string[];
  additionalNotes: string;
}

const globalStyles = `
  @layer components {
    .input {
      @apply block w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-gray-700 bg-white transition-all duration-200;
    }
    
    .form-label {
      @apply flex items-center gap-2 text-sm font-medium text-gray-800 mb-2;
    }
    
    .form-error {
      @apply mt-1 text-sm font-medium text-rose-500;
    }
    
    .form-group {
      @apply space-y-1;
    }
    
    .btn {
      @apply flex items-center justify-center transition-all duration-300;
    }
    
    .btn-primary {
      @apply text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-xl transition-all duration-300;
    }
    
    .section-title {
      @apply text-2xl font-bold text-gray-800;
    }
    
    .section-marker {
      @apply h-11 w-1.5 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full;
    }
    
    select option {
      @apply py-2 px-4 text-gray-700 bg-white;
    }
    
    select:focus option:checked {
      @apply bg-indigo-50 text-indigo-700;
    }
    
    .plan-card {
      @apply border border-gray-200 p-5 rounded-xl transition-all duration-300 bg-white hover:shadow-md;
    }
    
    .plan-card.selected {
      @apply ring-2 ring-violet-500 border-transparent bg-violet-50;
    }
    
    .plan-title {
      @apply text-lg font-bold text-gray-800 mb-1;
    }
    
    .plan-price {
      @apply text-violet-600 font-semibold mb-3;
    }
    
    .plan-features {
      @apply text-sm text-gray-600 space-y-2;
    }
  }
`;

const OrderForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      storeName: '',
      businessType: '',
      province: '',
      city: '',
      address: '',
      phoneNumber: '',
      whatsapp: '',
      telegram: '',
      logo: null,
      favoriteColor: '#6d28d9',
      preferredFont: '',
      brandSlogan: '',
      categories: '',
      estimatedProducts: '',
      productDisplayType: '',
      specialFeatures: '',
      productImages: [],
      pricingPlan: '',
      additionalModules: [],
      additionalNotes: '',
    },
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const formData = new FormData();

      // Handle string values
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'logo' && key !== 'productImages' && key !== 'additionalModules') {
          formData.append(key, value as string);
        }
      });

      // Handle arrays
      formData.append('additionalModules', JSON.stringify(values.additionalModules));

      // Handle file uploads
      if (values.logo) {
        formData.append('logo', values.logo);
      }
      values.productImages.forEach((file) => {
        formData.append('productImages', file);
      });

      try {
        const response = await submitOrder(formData);
        if (response.success) {
          alert('سفارش شما با موفقیت ثبت شد');
          formik.resetForm();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert('خطا در ارسال سفارش');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      formik.setFieldValue('logo', acceptedFiles[0]);
    },
  });

  const { getRootProps: getProductImagesRootProps, getInputProps: getProductImagesInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop: (acceptedFiles) => {
      formik.setFieldValue('productImages', [...formik.values.productImages, ...acceptedFiles]);
    },
  });

  const pricingPlans = [
    {
      id: 'basic',
      name: 'پلن پایه',
      price: '7-10 میلیون تومان',
      features: [
        'طراحی فروشگاه ساده',
        'بدون سبد خرید',
        'طراحی ریسپانسیو',
        'فرم سفارش'
      ]
    },
    {
      id: 'standard',
      name: 'پلن استاندارد',
      price: '12-16 میلیون تومان',
      features: [
        'سیستم مدیریت محصولات',
        'دسته‌بندی',
        'فرم درخواست قیمت',
        'اتصال به واتساپ'
      ]
    },
    {
      id: 'advanced',
      name: 'پلن پیشرفته',
      price: '18-25 میلیون تومان',
      features: [
        'سبد خرید',
        'ثبت‌نام مشتریان',
        'پنل مدیریت پیشرفته',
        'اتصال درگاه پرداخت'
      ]
    },
    {
      id: 'custom',
      name: 'پلن اختصاصی',
      price: '30+ میلیون تومان',
      features: [
        'طراحی اختصاصی UI/UX',
        'چندزبانه',
        'اتصال به ERP',
        'سیستم انبارداری'
      ]
    }
  ];

  const additionalModules = [
    { id: 'payment', name: 'اتصال به درگاه پرداخت', price: '1.5-2.5 میلیون تومان' },
    { id: 'whatsapp', name: 'اتصال به واتساپ چت', price: '300-700 هزار تومان' },
    { id: 'multilingual', name: 'چندزبانه بودن', price: '2-3 میلیون تومان' },
    { id: 'productUpload', name: 'بارگذاری اولیه محصولات', price: '500 هزار تا 1 میلیون تومان' },
    { id: 'logoDesign', name: 'طراحی لوگو اختصاصی', price: '1-3 میلیون تومان' },
    { id: 'seo', name: 'سئو پایه', price: '1.5 میلیون تومان' },
    { id: 'blog', name: 'ایجاد بلاگ', price: '1-1.5 میلیون تومان' },
    { id: 'customAdmin', name: 'پنل مدیریت اختصاصی', price: '3-5 میلیون تومان' },
    { id: 'training', name: 'آموزش ویدئویی', price: '300 هزار تومان' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
        
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent mb-4">
            ثبت سفارش طراحی سایت فروشگاهی
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">لطفاً اطلاعات فروشگاه خود را وارد کنید</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-8 md:p-10 space-y-12 border border-gray-100">
          {/* Basic Information Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="section-marker"></div>
              <h2 className="section-title">اطلاعات پایه</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="form-group">
                <label htmlFor="storeName" className="form-label">
                  <Store className="w-5 h-5 text-violet-600" />
                  نام فروشگاه
                </label>
                <input
                  type="text"
                  id="storeName"
                  {...formik.getFieldProps('storeName')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="مثال: بازار چینی‌جات کیان"
                />
                {formik.touched.storeName && formik.errors.storeName && (
                  <p className="form-error">{formik.errors.storeName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="businessType" className="form-label">
                  <Tag className="w-5 h-5 text-violet-600" />
                  نوع فعالیت
                </label>
                <input
                  type="text"
                  id="businessType"
                  {...formik.getFieldProps('businessType')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="مثال: عمده‌فروشی پوشاک"
                />
                {formik.touched.businessType && formik.errors.businessType && (
                  <p className="form-error">{formik.errors.businessType}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="province" className="form-label">
                  <MapPin className="w-5 h-5 text-violet-600" />
                  استان
                </label>
                <input
                  type="text"
                  id="province"
                  {...formik.getFieldProps('province')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="نام استان"
                />
                {formik.touched.province && formik.errors.province && (
                  <p className="form-error">{formik.errors.province}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  <MapPin className="w-5 h-5 text-violet-600" />
                  شهر
                </label>
                <input
                  type="text"
                  id="city"
                  {...formik.getFieldProps('city')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="نام شهر"
                />
                {formik.touched.city && formik.errors.city && (
                  <p className="form-error">{formik.errors.city}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  <MapPin className="w-5 h-5 text-violet-600" />
                  آدرس دقیق (اختیاری)
                </label>
                <textarea
                  id="address"
                  {...formik.getFieldProps('address')}
                  rows={2}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="آدرس کامل فروشگاه یا انبار"
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="form-error">{formik.errors.address}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  <Phone className="w-5 h-5 text-violet-600" />
                  شماره تماس
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  {...formik.getFieldProps('phoneNumber')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="شماره تماس اصلی"
                  dir="ltr"
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <p className="form-error">{formik.errors.phoneNumber}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp" className="form-label">
                  <MessageCircle className="w-5 h-5 text-violet-600" />
                  واتساپ
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  {...formik.getFieldProps('whatsapp')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="شماره واتساپ"
                  dir="ltr"
                />
                {formik.touched.whatsapp && formik.errors.whatsapp && (
                  <p className="form-error">{formik.errors.whatsapp}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telegram" className="form-label">
                  <MessageCircle className="w-5 h-5 text-violet-600" />
                  تلگرام
                </label>
                <input
                  type="text"
                  id="telegram"
                  {...formik.getFieldProps('telegram')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="آیدی تلگرام"
                  dir="ltr"
                />
                {formik.touched.telegram && formik.errors.telegram && (
                  <p className="form-error">{formik.errors.telegram}</p>
                )}
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="section-marker"></div>
              <h2 className="section-title">اطلاعات برندینگ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="form-group">
                <label className="form-label">
                  <Image className="w-5 h-5 text-violet-600" />
                  لوگو
                </label>
                <div
                  {...getLogoRootProps()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-violet-500 hover:bg-violet-50 transition duration-300 cursor-pointer bg-gray-50 group"
                >
                  <input {...getLogoInputProps()} />
                  <Upload className="mx-auto h-14 w-14 text-gray-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                    <span className="font-medium text-violet-600">آپلود فایل</span>
                    <p className="mt-1">یا کشیدن و رها کردن</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG تا 10MB</p>
                  </div>
                </div>
                {formik.touched.logo && formik.errors.logo && (
                  <p className="form-error">{String(formik.errors.logo)}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Palette className="w-5 h-5 text-violet-600" />
                  رنگ‌بندی دلخواه
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110 border-2 border-white"
                    style={{ backgroundColor: formik.values.favoriteColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="absolute z-10 bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
                      <HexColorPicker
                        color={formik.values.favoriteColor}
                        onChange={(color) => formik.setFieldValue('favoriteColor', color)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferredFont" className="form-label">
                  <FileText className="w-5 h-5 text-violet-600" />
                  فونت ترجیحی
                </label>
                <input
                  type="text"
                  id="preferredFont"
                  {...formik.getFieldProps('preferredFont')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="مثال: ایران‌سنس، وزیر"
                />
                {formik.touched.preferredFont && formik.errors.preferredFont && (
                  <p className="form-error">{formik.errors.preferredFont}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="brandSlogan" className="form-label">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                  شعار برند (اختیاری)
                </label>
                <input
                  type="text"
                  id="brandSlogan"
                  {...formik.getFieldProps('brandSlogan')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="شعار برند خود را وارد کنید"
                />
                {formik.touched.brandSlogan && formik.errors.brandSlogan && (
                  <p className="form-error">{formik.errors.brandSlogan}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="categories" className="form-label">
                  <Tag className="w-5 h-5 text-violet-600" />
                  دسته‌بندی‌ها
                </label>
                <textarea
                  id="categories"
                  {...formik.getFieldProps('categories')}
                  rows={2}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="مثال: پوشاک مردانه، زنانه، بچگانه"
                />
                {formik.touched.categories && formik.errors.categories && (
                  <p className="form-error">{formik.errors.categories}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="estimatedProducts" className="form-label">
                  <Package className="w-5 h-5 text-violet-600" />
                  تعداد تقریبی کالاها
                </label>
                <input
                  type="text"
                  id="estimatedProducts"
                  {...formik.getFieldProps('estimatedProducts')}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="تعداد محصولات تخمینی"
                />
                {formik.touched.estimatedProducts && formik.errors.estimatedProducts && (
                  <p className="form-error">{formik.errors.estimatedProducts}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="productDisplayType" className="form-label">
                  <ShoppingCart className="w-5 h-5 text-violet-600" />
                  مدل نمایش محصولات
                </label>
                <div className="relative">
                  <select
                    id="productDisplayType"
                    {...formik.getFieldProps('productDisplayType')}
                    className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300 appearance-none pr-10"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="gallery">گالری</option>
                    <option value="table">جدول قیمت</option>
                    <option value="filtered">قابلیت فیلتر</option>
                    <option value="custom">سفارشی</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.productDisplayType && formik.errors.productDisplayType && (
                  <p className="form-error">{formik.errors.productDisplayType}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="specialFeatures" className="form-label">
                  <Zap className="w-5 h-5 text-violet-600" />
                  ویژگی‌های خاص
                </label>
                <textarea
                  id="specialFeatures"
                  {...formik.getFieldProps('specialFeatures')}
                  rows={2}
                  className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
                  placeholder="مثال: قیمت برای هر تیراژ، فرم درخواست قیمت"
                />
                {formik.touched.specialFeatures && formik.errors.specialFeatures && (
                  <p className="form-error">{formik.errors.specialFeatures}</p>
                )}
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">
                  <Image className="w-5 h-5 text-violet-600" />
                  تصاویر نمونه محصولات
                </label>
                <div
                  {...getProductImagesRootProps()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-violet-500 hover:bg-violet-50 transition duration-300 cursor-pointer bg-gray-50 group"
                >
                  <input {...getProductImagesInputProps()} />
                  <Upload className="mx-auto h-14 w-14 text-gray-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                    <span className="font-medium text-violet-600">آپلود فایل</span>
                    <p className="mt-1">یا کشیدن و رها کردن</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG تا 10MB</p>
                  </div>
                </div>
                {formik.touched.productImages && formik.errors.productImages && (
                  <p className="form-error">{String(formik.errors.productImages)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Plan Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="section-marker"></div>
              <h2 className="section-title">انتخاب پلن قیمت‌گذاری</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`plan-card ${formik.values.pricingPlan === plan.id ? 'selected' : ''} cursor-pointer`}
                  onClick={() => formik.setFieldValue('pricingPlan', plan.id)}
                >
                  <div className="plan-title">{plan.name}</div>
                  <div className="plan-price">{plan.price}</div>
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {formik.touched.pricingPlan && formik.errors.pricingPlan && (
              <p className="form-error text-center">{formik.errors.pricingPlan}</p>
            )}

            <div className="mt-8">
              <div className="form-group">
                <label className="form-label">
                  <Zap className="w-5 h-5 text-violet-600" />
                  ماژول‌های اضافی
                </label>
                <div className="space-y-2 bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 font-medium mb-4">امکانات اضافی که می‌توانید به پلن خود اضافه کنید:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {additionalModules.map((module) => (
                      <label key={module.id} className="flex items-center gap-3 p-3 hover:bg-violet-50 rounded-lg transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formik.values.additionalModules?.includes(module.id) || false}
                          onChange={(e) => {
                            const modules = formik.values.additionalModules || [];
                            if (e.target.checked) {
                              modules.push(module.id);
                            } else {
                              const index = modules.indexOf(module.id);
                              if (index > -1) {
                                modules.splice(index, 1);
                              }
                            }
                            formik.setFieldValue('additionalModules', modules);
                          }}
                          className="hidden"
                        />
                        <div className="w-5 h-5 flex-shrink-0 border border-gray-300 rounded flex items-center justify-center bg-white">
                          {formik.values.additionalModules?.includes(module.id) && 
                            <CheckCircle className="w-5 h-5 text-violet-600" />
                          }
                        </div>
                        <div>
                          <span className="text-sm text-gray-800 font-medium block">{module.name}</span>
                          <span className="text-violet-600 text-xs font-medium">{module.price}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {formik.touched.additionalModules && formik.errors.additionalModules && (
                  <p className="form-error">{String(formik.errors.additionalModules)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label htmlFor="additionalNotes" className="form-label">
              <MessageSquare className="w-5 h-5 text-violet-600" />
              توضیحات اضافی
            </label>
            <textarea
              id="additionalNotes"
              {...formik.getFieldProps('additionalNotes')}
              rows={4}
              className="input focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-300"
              placeholder="هر توضیح اضافی که مد نظر دارید را وارد کنید"
            />
            {formik.touched.additionalNotes && formik.errors.additionalNotes && (
              <p className="form-error">{formik.errors.additionalNotes}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-8 py-3 text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px]"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ثبت سفارش'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm; 