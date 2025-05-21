const request = require('supertest');
const app = require('../src/server');

describe('Rate Functionalities', () => {
  let token;
  let productId = 1; // Assume product with ID 1 exists

  beforeAll(async () => {
    // Sign up and login a user
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'RateTester',
        email: 'ratetester@example.com',
        password: 'test123'
      });

    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'ratetester@example.com',
        password: 'test123'
      });

    token = res.body.token;
  });

  it('should post a valid rating', async () => {
    const res = await request(app)
      .post('/api/rates/rate')
      .send({
        token,
        product_id: productId,
        rate: 4.5
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('rate');
  });

  it('should reject invalid rating value', async () => {
    const res = await request(app)
      .post('/api/rates/rate')
      .send({
        token,
        product_id: productId,
        rate: 7 // invalid
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid rating/i);
  });

  it('should fetch ratings for a product', async () => {
    const res = await request(app)
      .post('/api/rates/getall')
      .send({
        product_id: productId
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('product_id');
    expect(res.body).toHaveProperty('ratings');
    expect(Array.isArray(res.body.ratings)).toBe(true);
  });

  it('should fetch user rates', async () => {
    const res = await request(app)
      .post('/api/rates/getRatesByUser')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rates');
    expect(Array.isArray(res.body.rates)).toBe(true);
  });

  it('should delete a user’s rating', async () => {
    const res = await request(app)
      .post('/api/rates/delete')
      .send({
        token,
        product_id: productId
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('deletedCount');
  });
});
