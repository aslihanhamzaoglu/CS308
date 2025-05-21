export const addToLocalCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
  
    const index = existingCart.findIndex(item => item.productId === product.productId);
    
    if (index > -1) {
      existingCart[index].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
  
    localStorage.setItem('guest_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cart-updated'));
    console.log('Updated Guest Cart:', existingCart);
  };
  

export const getLocalCart = () => {
  return JSON.parse(localStorage.getItem('guest_cart') || '[]');
};

export const updateLocalCart = (cart) => {
  localStorage.setItem('guest_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
};

export const removeFromLocalCart = (productId) => {
  const cart = getLocalCart().filter(item => item.productId !== productId);
  updateLocalCart(cart);
};

export const updateQuantityInLocalCart = (productId, newQuantity) => {
  const cart = getLocalCart().map(item => {
    if (item.productId === productId) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
  updateLocalCart(cart);
};

export const clearLocalCart = () => {
  localStorage.removeItem('guest_cart');
  window.dispatchEvent(new Event('cart-updated'));
};