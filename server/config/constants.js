require("dotenv").config();

module.exports = {
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  USER_ROLE_ADMIN: process.env.USER_ROLE_ADMIN,
  USER_ROLE_CUSTOMER: process.env.USER_ROLE_CUSTOMER,
  USER_ROLE_ARTIST: process.env.USER_ROLE_ARTIST,
  STATUS_ACTIVE: process.env.STATUS_ACTIVE,
  STATUS_INACTIVE: process.env.STATUS_INACTIVE,
  STATUS_DELETED: process.env.STATUS_DELETED,
  STATUS_PENDING: process.env.STATUS_PENDING,
  STATUS_BLOCKED: process.env.STATUS_BLOCKED,
  STATUS_RESOLVED: process.env.STATUS_RESOLVED,
  REPORT_TYPE_USER: process.env.REPORT_TYPE_USER,
  REPORT_TYPE_POST: process.env.REPORT_TYPE_POST,
  REPORT_TYPE_COMMENT: process.env.REPORT_TYPE_COMMENT,
};
