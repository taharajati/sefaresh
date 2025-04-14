import * as yup from 'yup';

export const orderSchema = yup.object().shape({
  storeName: yup.string().required('نام فروشگاه الزامی است'),
  phoneNumber: yup
    .string()
    .required('شماره تماس الزامی است')
    .matches(/^[0-9]{11}$/, 'شماره تماس باید 11 رقم باشد'),
  category: yup.string().required('دسته‌بندی محصولات الزامی است'),
  description: yup.string().required('توضیحات درباره فروشگاه الزامی است'),
  favoriteColor: yup.string().required('رنگ مورد علاقه الزامی است'),
  instagram: yup.string().url('آدرس اینستاگرام باید معتبر باشد'),
  logo: yup.mixed().required('لوگو الزامی است'),
  productImages: yup.array().of(yup.mixed()).min(1, 'حداقل یک عکس محصول الزامی است'),
  additionalNotes: yup.string(),
}); 