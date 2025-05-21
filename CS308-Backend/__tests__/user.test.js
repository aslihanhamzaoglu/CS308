const request = require('supertest');
const app = require('../src/server');

describe('User Functionalities', () => {
  let token;
  const randomEmail = `simple${Date.now()}@example.com`;

  it('should allow a new user to sign up', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Simple Tester',
        email: randomEmail,
        password: 'test123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(randomEmail);
  });

  it('should allow a user to sign in', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: randomEmail,
        password: 'test123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token; // Save token for the next tests
  });

  it('should fetch the user profile', async () => {
    const res = await request(app)
      .post('/api/users/profile')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(randomEmail);
  });

  it('should update the user name', async () => {
    const res = await request(app)
      .post('/api/users/changeName')
      .send({
        token,
        name: 'Updated Tester'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user.name).toBe('Updated Tester');
  });
});
