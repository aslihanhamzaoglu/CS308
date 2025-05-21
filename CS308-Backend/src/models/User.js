//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');

class User {
    constructor(userId, name, email, password, role) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}

module.exports = User;
