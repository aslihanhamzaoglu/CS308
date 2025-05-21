const crypto = require("crypto");
require("dotenv").config();

exports.hashSHA256 = (data) => {
  return crypto.createHmac("sha256", process.env.SHA_SECRET).update(data).digest("hex");
};
