const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (req.originalUrl.includes('/Propiedad/')) {
      const propertyId = req.params.id;
      uploadPath = path.join(__dirname, '../../uploads/propiedades', propertyId.toString());
    } else if (req.originalUrl.includes('/Cliente/')) {
      const clientId = req.params.id;
      uploadPath = path.join(__dirname, '../../uploads/clientes', clientId.toString());
    } else if (req.originalUrl.includes('/Tasacion/')) {
      let tasacionId = req.params?.id;

      if (!tasacionId) {
        if (!req.tasacionUploadTempId) {
          req.tasacionUploadTempId = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        }
        tasacionId = req.tasacionUploadTempId;
      }

      uploadPath = path.join(__dirname, '../../uploads/tasaciones', tasacionId.toString());
    } else {
      uploadPath = path.join(__dirname, '../../uploads/general');
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\//.test(file.mimetype) || /application\//.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP) y documentos (PDF, DOC, XLS)'));
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

const optimizeImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    for (const file of req.files) {
      if (/image\//.test(file.mimetype)) {
        const inputPath = file.path;
        const outputPath = inputPath.replace(path.extname(inputPath), '_optimized' + path.extname(inputPath));

        await sharp(inputPath)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .png({ compressionLevel: 8 })
          .webp({ quality: 85 })
          .toFile(outputPath);

        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);

        const stats = fs.statSync(inputPath);
        file.size = stats.size;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

const uploadPropertyImages = [upload.array('imagenes', 10), optimizeImage];
const uploadClientDocument = [upload.single('documento')];
const uploadTasacionImages = [upload.array('imagenes', 5), optimizeImage];

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const deleteDirectory = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(dirPath, { recursive: true, force: true }, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const getFileUrl = (req, filePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filePath}`;
};

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: false, message: 'El archivo es demasiado grande. Tamaño máximo: 10MB' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ status: false, message: 'Demasiados archivos. Máximo: 10 archivos' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ status: false, message: 'Campo de archivo inesperado' });
    }
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ status: false, message: error.message });
  }

  next(error);
};

module.exports = {
  upload,
  uploadPropertyImages,
  uploadClientDocument,
  uploadTasacionImages,
  optimizeImage,
  deleteFile,
  deleteDirectory,
  getFileUrl,
  handleMulterError
};