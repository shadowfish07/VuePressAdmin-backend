'use strict';
module.exports = {
  mockAdminUserSession(app) {
    app.mockSession({
      userId: 1,
      role: 'admin',
    });
  },
};
