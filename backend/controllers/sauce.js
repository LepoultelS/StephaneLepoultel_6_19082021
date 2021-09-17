const fs = require("fs");
const saucesSchema = require("../models/sauce");

// Création d'une sauce
exports.createSauce = (req, res, next) => {
  // Récupération des informations de la requête
  const sauceObject = JSON.parse(req.body.sauce);
  delete req.body._id;
  // Formatage des données de la sauce
  const sauce = new saucesSchema({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/img/${req.file.filename}`, // Ajout de son image
  });
  // Tentative d'enregistrement
  sauce.save(function (err, sauce) {
    if (err) {
      res.status(400).json({ err });
    }
  });
  // Remise aux valeurs par défaut de certains champs (Demandé dans le brief)
  saucesSchema
    .find()
    .then((sauces) => {
      for (let i = 0; i < sauces.length; i++) {
        sauces[i].updateOne(
          { _id: req.params.id },
          {
            ...sauces[i],
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            userdisLiked: [],
          }
        );
      }
      res.status(201).json({ message: " Nouvelle sauce crée !" });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Récupération des informations d'une sauce
exports.getOneSauce = (req, res, next) => {
  saucesSchema
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Récupération des informations de toutes les sauces
exports.getAllSauce = (req, res, next) => {
  saucesSchema
    .find()
    .then((sauces) => {
      res.status(200).json([...sauces]);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  // Recherche de la sauce en base
  saucesSchema
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      // Suppression de l'image de la sauce dans le serveur
      const filename = sauce.imageUrl.split("/img/")[1];
      fs.unlink(`img/${filename}`, () => {
        // Suppression de la sauce
        saucesSchema
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
          });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error });
    });
};

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
  // Recherche des informations de la sauce
  saucesSchema
    .findOne({ _id: req.params.id })
    .then((firstSauce) => {
      // Récupération du nom de l'image sans le reste de l'URL
      const firstImage = firstSauce.imageUrl.split("/img/")[1];
      // Si une nouvelle image a été envoyée dans la requête
      const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/img/${
              req.file.filename
            }`,
          }
        : {
            // Sinon
            ...req.body,
          };
      // Si une nouvelle image a été envoyée dans la requête
      if (req.file) {
        // Suppression de l'ancienne image de la sauce dans le serveur
        fs.unlink("img/" + firstImage, () => {
          saucesSchema
            .updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
            .then(() => res.status(200).json({ message: "Sauce modifiée! " }))
            .catch((error) => res.status(400).json({ error }));
        });
      } else {
        // Sinon
        saucesSchema
          .updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Popularité d'une sauce
exports.likeSauce = (req, res, next) => {
  // On récupère les informations de la sauce
  saucesSchema
    .findOne({ _id: req.params.id }) // on récupère les informations de la sauce
    .then((sauce) => {
      // Si l'utilisateur
      switch (req.body.like) {
        // a liké
        case 1:
          // Si la sauce n'avait pas déjà été liké par cet utilisateur
          if (!sauce.usersLiked.includes(req.body.userId)) {
            // On ajoute l'id user au tableau des utilisateurs qui ont aimé cette sauce
            // et on incrémente le nombre de likes
            saucesSchema
              .updateOne(
                { _id: req.params.id },
                { $push: { usersLiked: req.body.userId }, $inc: { likes: 1 } }
              )
              .then(() =>
                res.status(200).json({ message: "Preferences added" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else {
            res
              .status(400)
              .json({ message: "cette utilisateur aime déjà cette sauce !" });
          }
          break;
        // est sans avis
        case 0:
          // Si la sauce avait déjà été liké par cet utilisateur
          if (sauce.usersLiked.includes(req.body.userId)) {
            // On retire l'id user du tableau des utilisateurs qui ont aimé cette sauce
            // et on décrémente le nombre de likes
            saucesSchema
              .updateOne(
                { _id: req.params.id },
                { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
              )
              .then(() => res.status(200).json({ message: "No preference" }))
              .catch((error) => res.status(400).json({ error }));
          }

          if (sauce.usersDisliked.includes(req.body.userId)) {
            sauce
              .updateOne(
                { _id: req.params.id },
                {
                  // on met à jour la sauce
                  $inc: { likes: -1 }, // incrémentation -1 like
                  $pull: { usersLiked: req.body.userId }, // on retire le userId dans le tableau des utilisateurs qui like la sauce
                  _id: req.params.id,
                }
              )
              .then(() => res.status(201).json({ message: "Like retiré !" }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
            // si l'utilisateur est trouvé dans le tableau des dislike
            saucesSchema
              .updateOne(
                { _id: req.params.id },
                {
                  // on met à jour la sauce
                  $inc: { dislikes: -1 }, // incrémentation -1 dislike
                  $pull: { usersDisliked: req.body.userId }, // on retire le userId dans le tableau des utilisateurs qui dislike la sauce
                  _id: req.params.id,
                }
              )
              .then(() => res.status(201).json({ message: "Dislike retiré !" }))
              .catch((error) => res.status(400).json({ error }));
          } else {
            res.status(400).json({
              message: "cette utilisateur n'aime déjà pas cette sauce !",
            });
          }
          break;

        case 1: // si l'utilisateur dislike la sauce
          saucesSchema
            .updateOne(
              { _id: req.params.id },
              {
                // on met à jour la sauce
                $inc: { likes: 1 }, // incrémentation +1 like
                $push: { usersLiked: req.body.userId }, // on ajoute le userId dans le tableau des utilisateurs qui like la sauce
                _id: req.params.id,
              }
            )
            .then(() => res.status(201).json({ message: "Like ajouté !" }))
            .catch((error) => res.status(400).json({ error }));
          break;

        default:
          // si aucun des cas précédent n'est trouvé
          return res.status(500).json({ error });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
