import supertest from 'supertest';
import app from '../app';

describe('/register', () => {
  it('should accept a username and a password and send back a session token', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        username: 'Fo0bar',
        password: 'secure password',
      });

    expect(res.body).toHaveProperty('session');
    expect(res.body.username).toEqual('foobar');
    expect(res.statusCode).toEqual(201);
  });

  it('should reject username collisions', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        username: 'UsernameAlreadyExists',
        password: 'secure password',
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toEqual('This username already exists.');
  });

  it('should usernames that aren\'t Aa-Zz 0-9 _', async () => {
    const responses = [
      await supertest(app)
        .post('/register')
        .send({
          username: 'badusername()',
          password: 'secure password',
        }),
      await supertest(app)
        .post('/register')
        .send({
          username: 'bad-username',
          password: 'secure password',
        }),
      await supertest(app)
        .post('/register')
        .send({
          username: 'bad_username;',
          password: 'secure password',
        }),
    ];

    responses.forEach((response) => {
      expect(response.status).toEqual(400);
      expect(response.body.error).toEqual('This username contains illegal characters.');
    });
  });
});
