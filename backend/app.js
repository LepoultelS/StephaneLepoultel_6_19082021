const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const mongoSanitize = require("express-mongo-sanitize");

// Préparation du routage
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

// Tentative de connexion à la base de données
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/img", express.static(path.join(__dirname, "img")));

app.use(express.json()); // Transforme le corps de la requête en objet JS
app.use(helmet()); // Protège contre les fails XSS (bloc ce qui peut être du code)
app.use(mongoSanitize()); // Supprime toutes les clés commençant par $ ou contenant "."

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
