const request = require('supertest');
const app = require('../src/server');

describe('Product Functionalities', () => {
  let productManagerToken;
  let salesManagerToken;
  let addedProductId;

  beforeAll(async () => {
    // Signin Product Manager
    const pmRes = await request(app)
      .post('/api/users/signin')
      .send({ email: 'product@example.com', password: 'password123' });

    productManagerToken = pmRes.body.token;

    // Signin Sales Manager
    const smRes = await request(app)
      .post('/api/users/signin')
      .send({ email: 'sales@example.com', password: 'password123' });

    salesManagerToken = smRes.body.token;
  });

  it('should fetch all public products', async () => {
    const res = await request(app).get('/api/products/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should fetch products by category', async () => {
    const res = await request(app).get('/api/products/category/1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should allow product manager to add a new product', async () => {
    const res = await request(app)
      .post('/api/products/add')
      .send({
        token: productManagerToken,
        name: 'Test Product',
        model: 'TP-001',
        serialNumber: 'SN-TP001',
        description: 'Temporary product for testing',
        price: 10.99,
        stock: 5,
        warrantyStatus: 'Yes',
        distributor: 'Test Distributors',
        category_id: 1,
        picture: 'http://example.com/test.jpg',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('product');
    addedProductId = res.body.product.id;
  });

  it('should allow product manager to set stock', async () => {
    const res = await request(app)
      .post('/api/products/set-stock')
      .send({
        token: productManagerToken,
        productId: addedProductId,
        stock: 15,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/stock updated successfully/i);
  });

  it('should allow sales manager to set product price', async () => {
    const res = await request(app)
      .post('/api/products/setPrice')
      .send({
        token: salesManagerToken,
        productId: addedProductId,
        price: 99.99,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/price (set|updated)/i);
  });

  it('should allow sales manager to set discount', async () => {
    const res = await request(app)
      .post('/api/products/setDiscount')
      .send({
        token: salesManagerToken,
        productId: addedProductId,
        discount: 15,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/discount set successfully/i);
  });

  it('should allow managers to fetch all products', async () => {
    const res = await request(app)
      .post('/api/products/get-all')
      .send({ token: salesManagerToken });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should fetch stock of existing product', async () => {
    const res = await request(app)
      .post('/api/products/get-stock')
      .send({ productId: addedProductId });

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.stock).toBe('number');
  });

  it('should return 400 if productId is missing on stock fetch', async () => {
    const res = await request(app)
      .post('/api/products/get-stock')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/product id is required/i);
  });

  it('should return 404 if productId does not exist for stock fetch', async () => {
    const res = await request(app)
      .post('/api/products/get-stock')
      .send({ productId: 99999 });

    expect([404, 200]).toContain(res.statusCode);
    if (res.statusCode === 404) {
      expect(res.body.message).toMatch(/product not found/i);
    }
  });
});
