// server/tests/setup.js — env vars for test suite
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_32chars_minimum_x';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32chars_minx';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.RESEND_API_KEY = 'test_key';
process.env.FROM_EMAIL = 'test@test.com';
process.env.FROM_NAME = 'RAIMS Test';
