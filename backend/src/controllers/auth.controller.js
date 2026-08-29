const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.STATIC_LOGIN_USERNAME ||
    password !== process.env.STATIC_LOGIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
};

module.exports = { login };
