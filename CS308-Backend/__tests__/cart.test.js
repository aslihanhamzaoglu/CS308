const request = require('supertest');
const app = require('../src/server');

describe('Cart Basic Functionalities', () => {
  let token;

  beforeAll(async () => {
    // Create and login a user to get token
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'CartUser',
        email: 'cartuser@example.com',
        password: 'test123'
      });

    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'cartuser@example.com',
        password: 'test123'
      });

    token = res.body.token;
  });

  it('should add products to the cart', async () => {
    const res = await request(app)
      .post('/api/carts/add')
      .send({
        token,
        products: [{ productId: 1, quantity: 2 }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('cart');
    expect(res.body.cart).toHaveProperty('cartProducts');
    expect(res.body.cart).toHaveProperty('cartId');
  });

  it('should get products in the cart', async () => {
    const res = await request(app)
      .post('/api/carts/')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should check cart availability', async () => {
    const res = await request(app)
      .post('/api/carts/check-cart')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('valid');
  });

  it('should remove a product from the cart', async () => {
    const res = await request(app)
      .post('/api/carts/remove')
      .send({
        token,
        productId: 1,
        quantity: 1
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Product removed from cart/i);
  });

  it('should clear the cart', async () => {
    const res = await request(app)
      .post('/api/carts/clear')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Cart cleared successfully/i);
  });
});
