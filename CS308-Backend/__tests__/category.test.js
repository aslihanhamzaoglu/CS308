const request = require('supertest');
const app = require('../src/server');

describe('Category API Functionalities', () => {
  let productManagerToken;
  let customerToken;

  beforeAll(async () => {
    // Signup and signin as product manager
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Product Manager',
        email: 'product@example.com',
        password: 'password123',
        role: 'product_manager'
      });

    const managerRes = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'product@example.com',
        password: 'password123'
      });

    productManagerToken = managerRes.body.token;

    // Signup and signin as regular customer
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'User',
        email: 'user@example.com',
        password: 'user123',
        role: 'customer'
      });

    const customerRes = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'user@example.com',
        password: 'user123'
      });

    customerToken = customerRes.body.token;
  });

  it('should retrieve all category types', async () => {
    const res = await request(app)
      .get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('categories');
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  it('should add a new category with a product manager token', async () => {
    const res = await request(app)
      .post('/api/categories/add')
      .send({
        token: productManagerToken,
        name: 'TestCategory'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category).toHaveProperty('id');
    expect(res.body.category.name).toBe('TestCategory');
  });

  it('should reject category addition if user is not product manager', async () => {
    const res = await request(app)
      .post('/api/categories/add')
      .send({
        token: customerToken,
        name: 'FailCategory'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/forbidden|insufficient permissions/i);
  });

  it('should return 400 if category name is missing', async () => {
    const res = await request(app)
      .post('/api/categories/add')
      .send({
        token: productManagerToken
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/category name is required/i);
  });
});
