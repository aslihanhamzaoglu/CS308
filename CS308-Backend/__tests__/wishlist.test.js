const request = require('supertest');
const app = require('../src/server');

describe('Wishlist API Functionalities (Seeded DB)', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({ email: 'alice@example.com', password: 'password123' });

    token = res.body.token;
    expect(token).toBeDefined();
  });

  it('should retrieve the user\'s wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlists/get')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0); // Alice has [1, 5]
  });

  it('should add a new product to the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlists/add')
      .send({ token, productId: 6 }); // Blueberry Muffin, not in Alice's initial wishlist

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/added to wishlist/i);
  });

  it('should not add a duplicate product', async () => {
    const res = await request(app)
      .post('/api/wishlists/add')
      .send({ token, productId: 1 }); // Already in Alice's wishlist

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/already in wishlist/i);
  });

  it('should return 400 if productId is missing in add', async () => {
    const res = await request(app)
      .post('/api/wishlists/add')
      .send({ token });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/productId.*required/i);
  });

  it('should remove a product from the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlists/remove')
      .send({ token, productId: 5 }); // Remove Chocolate Chip Cookie

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed from wishlist/i);
  });

  it('should return 400 if productId is missing in remove', async () => {
    const res = await request(app)
      .post('/api/wishlists/remove')
      .send({ token });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/productId.*required/i);
  });

  it('should clear the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlists/clear')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/wishlist cleared/i);
  });

  it('should return an empty wishlist after clearing', async () => {
    const res = await request(app)
      .post('/api/wishlists/get')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(0);
  });
});
