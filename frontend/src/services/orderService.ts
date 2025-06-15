import api from '../lib/api';
import { User } from './userService';
import userService from './userService';
import { PaginatedResponse } from './productService';

export interface Address {
  address_id: number;
  user_id: number;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  Product: {
    product_id: number;
    name: string;
    sku: string;
    description?: string;
    ProductImages?: ProductImage[];
  };
}

export interface Order {
  order_id: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  shipping_address_id: number;
  billing_address_id: number;
  shipping_method: string | null;
  tracking_number: string | null;
  customer_notes: string | null;
  ShippingAddress: Address;
  BillingAddress: Address;
  OrderItems: OrderItem[];
  User?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateOrderData {
  shipping_address_id: number;
  billing_address_id: number;
  shipping_method?: string;
  customer_notes?: string;
}

const orderService = {
  // Get all orders for the current user
  getUserOrders: async (userId: number): Promise<Order[]> => {
    const response = await api.get(`/orders/user/${userId}`);
    
    // Handle both old and new response formats
    if (response.data && response.data.orders) {
      return response.data.orders;
    }
    return response.data;
  },

  // Get a specific order by ID
  getOrderById: async (orderId: number | string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create a new order from the user's cart
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Cancel an order (if allowed by status)
  cancelOrder: async (orderId: number | string): Promise<{ message: string }> => {
    const response = await api.put(`/orders/${orderId}/status`, { status: 'cancelled' });
    return response.data;
  },

  // Get order history by status
  getOrdersByStatus: async (userId: number, status: string): Promise<Order[]> => {
    const allOrders = await orderService.getUserOrders(userId);
    return allOrders.filter(order => order.status === status);
  },

  // Generate and download an invoice for an order
  downloadInvoice: async (order: Order): Promise<void> => {
    try {
      // Format date for the filename
      const date = new Date(order.order_date).toISOString().split('T')[0];
      const filename = `invoice-${order.order_id}-${date}.pdf`;
      
      // Create a simpler approach - generate an invoice HTML and open in a new window for printing
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${order.order_id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #8B6B3D; margin-bottom: 5px; }
            .header p { color: #666; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f2f2f2; text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
            .btn { background: #8B6B3D; color: white; border: none; padding: 10px 20px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Golden House</h1>
              <p>123 Jewelry Lane, San Francisco, CA 94110</p>
              <h2>INVOICE</h2>
            </div>
            
            <div class="info-section">
              <div>
                <p><strong>Invoice #:</strong> INV-${order.order_id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                <p><strong>Order Status:</strong> ${order.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
              </div>
              <div>
                <p><strong>Bill To:</strong></p>
                <p>${order.User?.first_name} ${order.User?.last_name}</p>
                <p>${order.BillingAddress.street_address}</p>
                <p>${order.BillingAddress.city}, ${order.BillingAddress.state} ${order.BillingAddress.postal_code}</p>
                <p>${order.BillingAddress.country}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.OrderItems.map(item => {
                  // Convert price_at_purchase to a number to ensure toFixed works
                  const itemPrice = Number(item.price_at_purchase);
                  const itemTotal = itemPrice * item.quantity;
                  
                  return `
                  <tr>
                    <td>${item.Product.name}</td>
                    <td class="text-right">$${itemPrice.toFixed(2)}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">$${itemTotal.toFixed(2)}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                  <td class="text-right">$${Number(order.total_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right"><strong>Shipping:</strong></td>
                  <td class="text-right">Included</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right"><strong>Total:</strong></td>
                  <td class="text-right"><strong>$${Number(order.total_amount).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>For questions about this invoice, please contact <a href="mailto:support@goldenthread.com">support@goldenthread.com</a></p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button class="btn" onclick="window.print();">Print Invoice</button>
            </div>
          </div>
          <script>
            // Auto-print when the page loads
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
        </html>
      `;
      
      // Open invoice in a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
      } else {
        throw new Error('Unable to open print window. Please check if popup blocker is enabled.');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  },
  
  // Reorder - Add all items from a previous order to the cart
  reorderItems: async (order: Order): Promise<void> => {
    // This will be implemented by using the cart context
    return Promise.resolve();
  }
};

export default orderService; 