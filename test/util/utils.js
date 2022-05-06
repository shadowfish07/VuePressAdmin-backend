'use strict';
const adminUserId = 1;
const generalUserId = 2;

module.exports = {
  adminUserId,
  generalUserId,
  mockAdminUserSession(app) {
    app.mockSession({
      userId: adminUserId,
      role: 'admin',
    });
  },
  mockGeneralUsersSession(app) {
    app.mockSession({
      userId: generalUserId,
      role: 'general',
    });
  },
};
