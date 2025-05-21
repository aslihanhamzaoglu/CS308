const request = require('supertest');
const app = require('../src/server');

describe('Refund API Functionalities', () => {
  let token;
  let salesToken;

  beforeAll(async () => {
    // Create customer user and login
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'RefundUser',
        email: 'refunduser@example.com',
        password: 'test123'
      });

    const loginRes = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'refunduser@example.com',
        password: 'test123'
      });

    token = loginRes.body.token;

    // Login sales_manager
    const salesRes = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'sales@example.com',
        password: 'password123'
      });

    salesToken = salesRes.body.token;
  });

  it('should request a refund successfully for a delivered order', async () => {
    const res = await request(app)
      .post('/api/refunds/requestRefund')
      .send({
        token,
        orderId: 1,
        productId: 6,
        quantity: 1
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/refund request submitted/i);
  });

  it('should reject refund request for an undelivered order', async () => {
    const res = await request(app)
      .post('/api/refunds/requestRefund')
      .send({
        token,
        orderId: 7,
        productId: 1,
        quantity: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/only available for delivered orders/i);
  });

  it('should reject refund request with missing fields', async () => {
    const res = await request(app)
      .post('/api/refunds/requestRefund')
      .send({
        token,
        orderId: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/all fields are required/i);
  });

  it('should get all refunds for the logged-in user', async () => {
    const res = await request(app)
      .post('/api/refunds/refundsByUser')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.refunds)).toBe(true);
  });

  it('should reject fetching user refunds without token', async () => {
    const res = await request(app)
      .post('/api/refunds/refundsByUser')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/token required/i);
  });

  it('should get all refunds as sales manager', async () => {
    const res = await request(app)
      .get('/api/refunds/all')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.refunds)).toBe(true);
  });

  it('should reject getting all refunds without sales manager role', async () => {
    const res = await request(app)
      .get('/api/refunds/all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('should approve a refund decision', async () => {
    // Create a test refund (assumes it will have a known ID)
    const createRes = await request(app)
      .post('/api/refunds/requestRefund')
      .send({
        token,
        orderId: 1,
        productId: 4,
        quantity: 1
      });

    expect(createRes.statusCode).toBe(200);

    // Fetch refunds to find the new pending one
    const allRefunds = await request(app)
      .get('/api/refunds/all')
      .set('Authorization', `Bearer ${salesToken}`);

    const pendingRefund = allRefunds.body.refunds.find(r => r.status === 'pending');
    expect(pendingRefund).toBeDefined();

    const decisionRes = await request(app)
      .post('/api/refunds/refundDecision')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        refundId: pendingRefund.id,
        decision: 'approved'
      });

    expect(decisionRes.statusCode).toBe(200);
    expect(decisionRes.body.message).toMatch(/refund request approved/i);
  });

  it('should reject refund decision with missing fields', async () => {
    const res = await request(app)
      .post('/api/refunds/refundDecision')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});
