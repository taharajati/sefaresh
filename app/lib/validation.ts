import * as yup from 'yup';

export const orderSchema = yup.object().shape({
  // Basic Information
  storeName: yup.string().required('نام فروشگاه الزامی است'),
  businessType: yup.string().required('نوع فعالیت الزامی است'),
  province: yup.string().required('استان الزامی است'),
  city: yup.string().required('شهر الزامی است'),
  address: yup.string(),
  phoneNumber: yup
    .string()
    .required('شماره تماس الزامی است')
    .matches(/^[0-9]{11}$/, 'شماره تماس باید 11 رقم باشد'),
  whatsapp: yup.string(),
  telegram: yup.string(),
  
  // Branding
  logo: yup.mixed().nullable(),
  favoriteColor: yup.string().required('رنگ مورد علاقه الزامی است'),
  preferredFont: yup.string(),
  brandSlogan: yup.string(),
  categories: yup.string().required('دسته‌بندی‌ها الزامی است'),
  estimatedProducts: yup.string().required('تعداد تقریبی کالاها الزامی است'),
  productDisplayType: yup.string().required('مدل نمایش محصولات الزامی است'),
  specialFeatures: yup.string(),
  productImages: yup.array().of(yup.mixed()).nullable(),
  
  // Pricing Plan
  pricingPlan: yup.string().required('انتخاب پلن قیمت‌گذاری الزامی است'),
  additionalModules: yup.array().of(yup.string()),
  additionalNotes: yup.string(),
}); 