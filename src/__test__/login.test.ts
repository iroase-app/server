import argon2 from 'argon2';
import supertest from 'supertest';
import loader from '../loader';
import * as db from '../db';

beforeEach(async () => {
  await db.reset();
  await db.init();
  await db.default.query(`
  INSERT INTO users (username, hashed_password, created, is_moderator) 
  VALUES ($1, $2, $3, $4);`,
  ['Test', await argon2.hash('very secure password'), new Date(), false]);
});

afterAll(async () => {
  await db.default.end();
});

describe('/login', () => {
  it('should return 400 if fields are missing', async () => {
    let res = await supertest(loader).post('/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');

    res = await supertest(loader).post('/login').send({ username: 'test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');

    res = await supertest(loader).post('/login').send({ username: '', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fieldMissing');
  });

  it('should return 400 if username and password combo is wrong', async () => {
    let res = await supertest(loader).post('/login').send({ username: 'test', password: 'wrong password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');

    res = await supertest(loader).post('/login').send({ username: 'wrongusername', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');

    res = await supertest(loader).post('/login').send({ username: 'wrongUsername', password: 'wrong password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('wrongCredentials');
  });

  it('should return 200 and a session token if username and password combo is correct ', async () => {
    const res = await supertest(loader).post('/login').send({ username: 'Test', password: 'very secure password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('session');
  });

  it('should check for illegal characters', async () => {
    let res = await supertest(loader).post('/login').send({ username: 'illegal!', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('illegalCharacters');

    res = await supertest(loader).post('/login').send({ username: 'illegal;', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('illegalCharacters');
  });

  it('should check for length', async () => {
    let res = await supertest(loader).post('/login').send({ username: 'a'.repeat(51), password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('usernameTooLong');

    res = await supertest(loader).post('/login').send({ username: 'aaaa', password: 'very secure password'.repeat(300) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('passwordTooLong');

    res = await supertest(loader).post('/login').send({ username: 'a', password: 'very secure password' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('usernameTooShort');

    res = await supertest(loader).post('/login').send({ username: 'aaaa', password: 'a' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('passwordTooShort');
  });
});
