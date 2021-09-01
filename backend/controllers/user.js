const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import du modèle user
const User = require("../models/user");
const userValidator = require("./user-regex");

// Création d'un user
exports.signup = (req, res, next) => {
  //console.log(req.body.password);
  if (userValidator.isGoodPassword(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) =>
            res.status(400).json({ message: "Utilisateur déjà existant !" })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    return res.status(404).json({
      message:
        "Le mot de passe doit contenir au moins un nombre, une minuscule, une majuscule et être composé de 6 caractères minimum !",
    });
  }
};

// Connexion d'un user
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(404)
              .json({ message: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
              expiresIn: "5h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
