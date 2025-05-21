const request = require('supertest');
const app = require('../src/server');

describe('Comment Basic Functionalities', () => {
  let token;
  let commentId;

  beforeAll(async () => {
    // Create and login a user
    await request(app)
      .post('/api/users/signup')
      .send({
        name: 'CommentTester',
        email: 'commenttester@example.com',
        password: 'test123'
      });

    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'commenttester@example.com',
        password: 'test123'
      });

    token = res.body.token;
  });

  it('should add a comment successfully', async () => {
    const res = await request(app)
      .post('/api/comments/add')
      .send({
        token,
        productId: 1,
        comment: 'Nice product!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('comment');
    expect(res.body.comment).toHaveProperty('comment_id');

    // Save commentId for later tests
    commentId = res.body.comment.comment_id;
  });

  it('should fetch comments for a product', async () => {
    const res = await request(app)
      .post('/api/comments/')
      .send({ productId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('comments');
    expect(Array.isArray(res.body.comments)).toBe(true);
  });

  it('should approve a comment', async () => {
    const res = await request(app)
      .post('/api/comments/approve')
      .send({ commentId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('comment');
  });

  it('should fetch all unapproved comments', async () => {
    const res = await request(app)
      .get('/api/comments/unapproved');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('comments');
    expect(Array.isArray(res.body.comments)).toBe(true);
  });

  it('should fetch comments by user', async () => {
    const res = await request(app)
      .post('/api/comments/by-user')
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('comments');
    expect(Array.isArray(res.body.comments)).toBe(true);
  });

  it('should delete a comment successfully', async () => {
    const res = await request(app)
      .post('/api/comments/delete')
      .send({ commentId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('comment');
  });
});
