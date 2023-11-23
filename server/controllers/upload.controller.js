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
  try {
    const file = req.file;
    if (!file) throw new Error("Please upload a file.");

    res.send({ error: false, status: 200, file });
  } catch (error) {
    console.log("🚀 ~ file: upload.controller.js:22 ~ exports.uploadSingleFile= ~ error:", error)
    return res.status(200).json({
      error: true,
      status: 400,
      message: error.message,
    });
  }
};
