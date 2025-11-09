const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder;
    let resource_type = 'auto'; 

    if (req.originalUrl.includes('/Propiedad/')) {
      folder = `mkalpin/propiedades/${req.params.id || 'temp'}`;
    } else if (req.originalUrl.includes('/Tasacion/')) {
      let tasacionId = req.params?.id;
      if (!tasacionId) {
        if (!req.tasacionUploadTempId) {
          req.tasacionUploadTempId = `temp-${Date.now()}`;
        }
        tasacionId = req.tasacionUploadTempId;
      }
      folder = `mkalpin/tasaciones/${tasacionId}`;
    } else {
      folder = 'mkalpin/general';
    }

    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedImageTypes.test(ext)) {
      resource_type = 'image';
    } else if (allowedDocumentTypes.test(ext)) {
      resource_type = 'raw'; 
    }

    return {
      folder: folder,
      resource_type: resource_type,
      quality: 'auto:good',
      width: 1920,
      height: 1080,
      crop: 'limit'
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, 
    files: 10
  }
});

const deleteFile = async (public_id) => {
  if (!public_id) return;
  
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
};

const deleteDirectory = async (folderPath) => {
  try {
    await cloudinary.api.delete_resources_by_prefix(folderPath);
    await cloudinary.api.delete_folder(folderPath);
  } catch (error) {
    console.error("Error deleting directory from Cloudinary:", error);
  }
};

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: false, message: 'El archivo es demasiado grande. Máximo: 10MB' });
    }
  }
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ status: false, message: error.message });
  }
  next(error);
};

module.exports = {
  upload,
  uploadPropertyImages: upload.array('imagenes', 10),
  uploadTasacionImages: upload.array('imagenes', 5),

  deleteFile,
  deleteDirectory,
  
  handleMulterError
};