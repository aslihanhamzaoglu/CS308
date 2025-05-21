const request = require('supertest');
const app = require('../src/server');

jest.mock('../src/services/ProductService');

describe('Order Basic Functionalities', () => {
  let token;
  let orderId;

  beforeAll(async () => {
    // 1. Sign up a user
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'OrderTester',
        email: 'ordertester@example.com',
        password: 'test123'
      });

    // 2. Sign in to get a token
    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'ordertester@example.com',
        password: 'test123'
      });

    token = res.body.token;

    // 3. Add a product to cart so we can checkout
    await request(app)
      .post('/api/carts/add')
      .send({
        token,
        products: [{ productId: 1, quantity: 1 }] // make sure productId 1 exists
      });
  });

  it('should checkout (create an order) successfully', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .send({ token });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('order');
    expect(res.body.order).toHaveProperty('order_id');

    // Save orderId for later tests
    orderId = res.body.order.order_id;
  });

  it('should fetch all orders for the user', async () => {
    const res = await request(app)
      .post('/api/orders/getOrdersByUser')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('orders');
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it('should fetch invoice by orderId', async () => {
    const res = await request(app)
      .post('/api/orders/getInvoice')
      .send({
        token,
        orderId: orderId
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('invoiceBase64');
    expect(typeof res.body.invoiceBase64).toBe('string');
  });

  it('should change order status', async () => {
    const res = await request(app)
      .post('/api/orders/changeOrderStatus')
      .send({
        orderId: orderId,
        newStatus: 'in-transit' // or 'delivered', 'cancelled'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.result).toHaveProperty('order_id');
    expect(res.body.result.new_status).toBe('in-transit');
  });
});

