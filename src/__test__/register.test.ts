import supertest from 'supertest';
import app from '../app';
import * as db from '../db';

beforeEach(async () => {
  await db.reset();
  await db.init();
});

describe('/register', () => {
  it('should accept a username and a password and send back a session token', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        username: 'Fo0bar',
        password: 'secure password',
      });

    expect(res.body).toHaveProperty('session');
    expect(res.body.username).toEqual('Fo0bar');
    expect(res.statusCode).toEqual(201);
  });

  it('should reject if there are missing fields', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        username: 'Fo0bar',
        password: '',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('fieldMissing');
  });

  it('should reject usernames that are too long or too short', async () => {
    const tooLong = await supertest(app)
      .post('/register')
      .send({
        username: 'ThisIsAVeryLongUsernameItIsDefinitelyLongerThan24Characters',
        password: 'secure password',
      });

    const tooShort = await supertest(app)
      .post('/register')
      .send({
        username: 'Fo',
        password: 'secure password',
      });

    expect(tooLong.statusCode).toEqual(400);
    expect(tooLong.body.error).toEqual('usernameTooLong');

    expect(tooShort.statusCode).toEqual(400);
    expect(tooShort.body.error).toEqual('usernameTooShort');
  });
});

it('should reject if the password is too long or short', async () => {
  const tooLong = await supertest(app)
    .post('/register')
    .send({
      username: 'Fo0bar',
      password: 'ThisIsAVeryLongPasswordItIsDefinitelyLongerThan128CharactersAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });

  const tooShort = await supertest(app)
    .post('/register')
    .send({
      username: 'Fo0bar',
      password: 'short',
    });

  expect(tooLong.statusCode).toEqual(400);
  expect(tooLong.body.error).toEqual('passwordTooLong');

  expect(tooShort.statusCode).toEqual(400);
  expect(tooShort.body.error).toEqual('passwordTooShort');
});

it('should reject username collisions', async () => {
  await supertest(app)
    .post('/register')
    .send({
      username: 'UsernameAlreadyExists',
      password: 'secure password',
    });

  const res = await supertest(app)
    .post('/register')
    .send({
      username: 'UsernameAlreadyExists',
      password: 'secure password',
    });

  expect(res.statusCode).toEqual(409);
  expect(res.body.error).toEqual('usernameCollision');
});

// TODO: should we really reject non A-Z characters?
it('should reject usernames that aren\'t Aa-Zz 0-9', async () => {
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
  ];

  responses.forEach((response) => {
    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual('illegalCharacters');
  });
});
