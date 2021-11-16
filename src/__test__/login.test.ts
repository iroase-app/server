import argon2 from 'argon2';
import supertest from 'supertest';
import app from '../app';
import db, { reset, init } from '../db';

beforeEach(async () => {
  await reset();
  await init();
  await db.query(`
  INSERT INTO users (username, hashed_password, created, is_moderator) 
  VALUES ($1, $2, $3, $4);`,
  ['Test', await argon2.hash('very secure password'), new Date(), false]);
});

describe('/login', () => {
  it('should return 400 if fields are missing', async () => {
    let res = await supertest(app).post('/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');

    res = await supertest(app).post('/login').send({ username: 'test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');

    res = await supertest(app).post('/login').send({ username: '', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');
  });

  it('should return 400 if username and password combo is wrong', async () => {
    let res = await supertest(app).post('/login').send({ username: 'test', password: 'wrong password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');

    res = await supertest(app).post('/login').send({ username: 'wrong username', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');

    res = await supertest(app).post('/login').send({ username: 'wrong username', password: 'wrong password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');
  });

  it('should return 200 and a session token if username and password combo is correct ', async () => {
    const res = await supertest(app).post('/login').send({ username: 'Test', password: 'very secure password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('session');
  });
});
