const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is missing. Add it to the .env file.');
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

export const registerCustomer = (customer) => request('/customers/register', {
  method: 'POST',
  body: JSON.stringify(customer),
});

export const loginCustomer = (credentials) => request('/customers/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const getCurrentCustomer = () => request('/customers/me');

export const logoutCustomer = () => request('/customers/logout', { method: 'POST' });

export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => request(`/products/${encodeURIComponent(id)}`);

export const getWishlist = () => request('/wishlist');

export const toggleWishlist = (productId) => request(`/wishlist/${encodeURIComponent(productId)}/toggle`, { method: 'PATCH' });

export const removeWishlistProduct = (productId) => request(`/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });

export const getCart = () => request('/cart');
export const addCartProduct = (productId) => request(`/cart/${encodeURIComponent(productId)}`, { method: 'POST' });
export const updateCartProduct = (productId, quantity) => request(`/cart/${encodeURIComponent(productId)}`, {
  method: 'PATCH', body: JSON.stringify({ quantity }),
});
export const removeCartProduct = (productId) => request(`/cart/${encodeURIComponent(productId)}`, { method: 'DELETE' });
export const createPaymentOrder = (shippingAddress) => request('/orders/create-payment-order', { method: 'POST', body: JSON.stringify({ shippingAddress }) });
export const verifyPayment = (payment) => request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(payment) });
export const getOrders = () => request('/orders');
export const getOrder = (id) => request(`/orders/${encodeURIComponent(id)}`);
