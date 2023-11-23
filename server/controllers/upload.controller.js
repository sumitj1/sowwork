const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

exports.upload = multer({ storage: storage, limits: { fileSize: 20971520 } }); //20 MB max size
exports.uploadMultiple = exports.upload.array("files", 10);

exports.uploadSingleFile = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(200).json({
      error: true,
      status: 400,
      message: "Please upload a file.",
    });
  }
  res.send({ error: false, status: 200, file });
};
