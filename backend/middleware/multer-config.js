const multer = require("multer");

// Liste des formats d'images
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Lieu d'enregistrement et nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "img");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// storage est la destinatiob du fichier limits à 500ko l'image, le nombre caractère et la dimension de l'image
module.exports = multer({
  storage: storage,
  limits: { fileSize: 512000, fieldNameSize: 200, fieldSize: 1280 * 1000 },
}).single("image");
