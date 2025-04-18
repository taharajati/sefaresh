import dbUtils from '../../database/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetRequest(req, res);
    case 'POST':
      return handlePostRequest(req, res);
    case 'PUT':
      return handlePutRequest(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

async function handleGetRequest(req, res) {
  const { id } = req.query;

  try {
    if (id) {
      // دریافت یک سفارش با شناسه
      const order = dbUtils.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.status(200).json(order);
    } else {
      // دریافت همه سفارش‌ها
      const orders = dbUtils.getAllOrders();
      return res.status(200).json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function handlePostRequest(req, res) {
  try {
    const { customerName, status, total, branding } = req.body;

    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    // ذخیره سفارش جدید
    const result = dbUtils.saveOrder({
      customer_name: customerName,
      status: status || 'pending',
      total: total || 0
    });
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to save order' });
    }
    
    // ذخیره اطلاعات برندینگ اگر ارائه شده باشند
    if (branding) {
      const brandingResult = dbUtils.saveBranding({
        order_id: result.id,
        favorite_color: branding.favoriteColor || '',
        preferred_font: branding.preferredFont || '',
        brand_slogan: branding.brandSlogan || '',
        logo_url: branding.logoUrl || ''
      });
      
      if (!brandingResult.success) {
        console.error('Failed to save branding information');
      }
    }
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: result.id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}

async function handlePutRequest(req, res) {
  try {
    const { id } = req.query;
    const { status } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // بروزرسانی وضعیت سفارش
    const result = dbUtils.updateOrderStatus(id, status);
    
    if (!result.success) {
      return res.status(404).json({ error: 'Order not found or update failed' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
} 