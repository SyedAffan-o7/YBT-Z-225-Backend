const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];
const VIDEO_FORMATS = ["mp4", "mov", "avi", "mkv", "webm"];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder;
    let allowed_formats;
    let resource_type;

    const isImage =
      file.fieldname === "images" || file.fieldname === "mobileImages";
    const isVideo =
      file.fieldname === "videos" || file.fieldname === "mobileVideos";

    if (isImage) {
      const subFolder = file.fieldname === "mobileImages" ? "/mobile" : "";
      folder = `youngboytoyz/images${subFolder}`;

      allowed_formats = IMAGE_FORMATS;
      resource_type = "image";
    } else if (isVideo) {
      const subFolder = file.fieldname === "mobileVideos" ? "/mobile" : "";
      folder = `youngboytoyz/videos${subFolder}`;

      allowed_formats = VIDEO_FORMATS;
      resource_type = "video";
    } else {
      folder = "youngboytoyz/other";
      allowed_formats = [];
      resource_type = "auto";
    }

    return {
      folder,
      allowed_formats,
      resource_type,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,

    files: 30,
  },
  fileFilter: (req, file, cb) => {
    let allowed;
    if (file.fieldname === "images" || file.fieldname === "mobileImages") {
      allowed = IMAGE_FORMATS;
    } else if (
      file.fieldname === "videos" ||
      file.fieldname === "mobileVideos"
    ) {
      allowed = VIDEO_FORMATS;
    } else {
      return cb(new Error(`Invalid file field name: ${file.fieldname}`), false);
    }

    const ext = file.originalname.split(".").pop().toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: .${ext}`), false);
    }
  },
});

module.exports = upload;
