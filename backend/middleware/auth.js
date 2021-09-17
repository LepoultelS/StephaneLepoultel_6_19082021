const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Vérification de la présence et validité du token
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      // token valide, passage au prochain middleware
      next();
    }
  } catch {
    res.status(401).json({ error:"Unauthorized" });
  }
};
