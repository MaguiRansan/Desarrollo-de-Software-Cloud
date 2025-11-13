const express = require('express');
const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { validateProperty, validateId, validateSearch } = require('../middleware/validation');
const { uploadPropertyImages, handleMulterError, deleteFile } = require('../middleware/upload');
const { geocodeAddress } = require('../utils/geocoding');

const router = express.Router();

router.get('/Obtener', optionalAuth, async (req, res) => {
  try {
    let properties = await Property.find({ activo: true })
      .populate('idUsuarioCreador', 'nombre apellido correo')
      .sort({ fechaCreacion: -1 })
      .lean();

    if (req.user) {
      properties = await Favorite.addFavoriteStatus(properties, req.user._id);
    }

    res.json({
      status: true,
      message: 'Propiedades obtenidas exitosamente',
      value: properties
    });

  } catch (error) {
    console.error('Error obteniendo propiedades:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Obtener/:id', [validateId, optionalAuth], async (req, res) => {
  try {
    let property = await Property.findOne({ _id: req.params.id, activo: true })
      .populate('idUsuarioCreador', 'nombre apellido correo')
      .lean();

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (req.user) {
      const properties = await Favorite.addFavoriteStatus([property], req.user._id);
      property = properties[0];
    }

    res.json({
      status: true,
      message: 'Propiedad obtenida exitosamente',
      value: property
    });

  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Buscar', [validateSearch, optionalAuth], async (req, res) => {
  try {
    const filters = {
      transaccionTipo: req.query.transaccionTipo,
      tipoPropiedad: req.query.tipoPropiedad,
      barrio: req.query.barrio,
      ubicacion: req.query.ubicacion,
      precioMin: req.query.precioMin,
      precioMax: req.query.precioMax,
      habitacionesMin: req.query.habitacionesMin,
      banosMin: req.query.banosMin,
      superficieMin: req.query.superficieMin,
      superficieMax: req.query.superficieMax,
      estado: req.query.estado,
      esAlquilerTemporario: req.query.esAlquilerTemporario
    };

    let properties = await Property.searchProperties(filters).lean();

    if (req.user) {
      properties = await Favorite.addFavoriteStatus(properties, req.user._id);
    }

    res.json({
      status: true,
      message: `Se encontraron ${properties.length} propiedades`,
      value: properties
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.post('/Crear', [protect, validateProperty], async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      idUsuarioCreador: req.user._id
    };

    if ((!propertyData.latitud || !propertyData.longitud) && (propertyData.direccion || propertyData.barrio || propertyData.localidad || propertyData.provincia)) {
      const geocoded = await geocodeAddress(propertyData);
      if (geocoded) {
        propertyData.latitud = geocoded.latitud;
        propertyData.longitud = geocoded.longitud;
      }
    }

    if (typeof propertyData.servicios === 'string') {
      try {
        propertyData.servicios = JSON.parse(propertyData.servicios);
      } catch {
        propertyData.servicios = propertyData.servicios.split(',').map(s => s.trim());
      }
    }

    if (typeof propertyData.reglasPropiedad === 'string') {
      try {
        propertyData.reglasPropiedad = JSON.parse(propertyData.reglasPropiedad);
      } catch {
        propertyData.reglasPropiedad = propertyData.reglasPropiedad.split(',').map(r => r.trim());
      }
    }

    if (typeof propertyData.metodosPago === 'string') {
      try {
        propertyData.metodosPago = JSON.parse(propertyData.metodosPago);
      } catch {
        propertyData.metodosPago = propertyData.metodosPago.split(',').map(m => m.trim());
      }
    }
    propertyData.imagenes = []; 

    const property = new Property(propertyData);
    await property.save();

    await property.populate('idUsuarioCreador', 'nombre apellido correo');

    res.status(201).json({
      status: true,
      message: 'Propiedad creada exitosamente',
      value: property
    });

  } catch (error) {
    console.error('Error creando propiedad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.put('/Actualizar/:id', [protect, validateId, validateProperty], async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, activo: true });

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (property.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para editar esta propiedad'
      });
    }

    const updateData = { ...req.body };

    if ((!updateData.latitud || !updateData.longitud) && (updateData.direccion || updateData.barrio || updateData.localidad || updateData.provincia)) {
      const geocoded = await geocodeAddress({
        direccion: updateData.direccion ?? property.direccion,
        barrio: updateData.barrio ?? property.barrio,
        localidad: updateData.localidad ?? property.localidad,
        provincia: updateData.provincia ?? property.provincia
      });

      if (geocoded) {
        updateData.latitud = geocoded.latitud;
        updateData.longitud = geocoded.longitud;
      }
    }

    if (typeof updateData.servicios === 'string') {
      try {
        updateData.servicios = JSON.parse(updateData.servicios);
      } catch {
        updateData.servicios = updateData.servicios.split(',').map(s => s.trim());
      }
    }

    if (typeof updateData.reglasPropiedad === 'string') {
      try {
        updateData.reglasPropiedad = JSON.parse(updateData.reglasPropiedad);
      } catch {
        updateData.reglasPropiedad = updateData.reglasPropiedad.split(',').map(r => r.trim());
      }
    }

    if (typeof updateData.metodosPago === 'string') {
      try {
        updateData.metodosPago = JSON.parse(updateData.metodosPago);
      } catch {
        updateData.metodosPago = updateData.metodosPago.split(',').map(m => m.trim());
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('idUsuarioCreador', 'nombre apellido correo');

    res.json({
      status: true,
      message: 'Propiedad actualizada exitosamente',
      value: updatedProperty
    });

  } catch (error) {
    console.error('Error actualizando propiedad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.delete('/Eliminar/:id', [protect, validateId], async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, activo: true });

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (property.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para eliminar esta propiedad'
      });
    }

    property.activo = false;
    await property.save();

    res.json({
      status: true,
      message: 'Propiedad eliminada exitosamente',
      value: true
    });

  } catch (error) {
    console.error('Error eliminando propiedad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.post('/ToggleFavorito/:id', [protect, validateId], async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findOne({ _id: propertyId, activo: true });
    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    const result = await Favorite.toggleFavorite(req.user._id, propertyId);

    res.json({
      status: true,
      message: result.message,
      esFavorito: result.isFavorite
    });

  } catch (error) {
    console.error('Error toggle favorito:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Favoritos', protect, async (req, res) => {
  try {
    const favorites = await Favorite.getUserFavorites(req.user._id);
    
    const validFavorites = favorites
      .filter(fav => fav.idPropiedad)
      .map(fav => ({
        ...fav.idPropiedad.toObject(),
        favorito: true
      }));

    res.json({
      status: true,
      message: 'Favoritos obtenidos exitosamente',
      value: validFavorites
    });

  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/MisPropiedades', protect, async (req, res) => {
  try {
    const properties = await Property.find({ 
      idUsuarioCreador: req.user._id, 
      activo: true 
    })
    .populate('idUsuarioCreador', 'nombre apellido correo')
    .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: 'Propiedades del usuario obtenidas exitosamente',
      value: properties
    });

  } catch (error) {
    console.error('Error obteniendo propiedades del usuario:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.post('/SubirImagenes/:id', [
  protect,
  validateId,
  uploadPropertyImages, 
  handleMulterError
], async (req, res) => {
  try {
    console.log('=== SubirImagenes START ===');
    console.log('ID Propiedad:', req.params.id);
    console.log('User:', req.user._id);
    console.log('Archivos recibidos:', req.files ? req.files.length : 0);
    
    if (!req.files) {
      console.log('❌ req.files es undefined o null');
      return res.status(400).json({
        status: false,
        message: 'No se recibieron archivos'
      });
    }
    
    const property = await Property.findOne({ _id: req.params.id, activo: true });

    if (!property) {
      console.log('❌ Propiedad no encontrada:', req.params.id);
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (property.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      console.log('❌ Permiso denegado');
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para subir imágenes a esta propiedad'
      });
    }

    if (req.files.length === 0) {
      console.log('❌ Array de archivos vacío');
      return res.status(400).json({
        status: false,
        message: 'No se recibieron archivos'
      });
    }

    console.log('✅ Validaciones pasadas. Procesando', req.files.length, 'archivos');

    const uploadedImages = req.files.map((file, index) => {
      console.log(`📁 Archivo ${index}:`, {
        originalname: file.originalname,
        path: file.path,
        secure_url: file.secure_url,
        filename: file.filename,
        public_id: file.public_id
      });

      const imageObj = {
        rutaArchivo: file.path || file.secure_url || file.url || '', 
        public_id: file.filename || file.public_id || '',
        nombreArchivo: file.originalname,
        orden: property.imagenes.length + index
      };

      if (!imageObj.rutaArchivo) {
        console.warn(`⚠️ Imagen ${index} sin URL:`, file);
      }

      return imageObj;
    });

    property.imagenes.push(...uploadedImages);
    const saved = await property.save();
    console.log('✅ Propiedad actualizada. Total imágenes:', saved.imagenes.length);

    const imageUrls = uploadedImages.map(img => img.rutaArchivo);  

    console.log('Subir Imagenes');
    res.json({
      status: true,
      message: `Se subieron ${uploadedImages.length} imágenes exitosamente`,
      value: saved  
    });

  } catch (error) {
    console.error('Subir Imagenes');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.delete('/EliminarImagen/:propertyId/:imageId', protect, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;

    const property = await Property.findOne({ _id: propertyId, activo: true });

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (property.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para eliminar imágenes de esta propiedad'
      });
    }

    const imageIndex = property.imagenes.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        status: false,
        message: 'Imagen no encontrada'
      });
    }

    const image = property.imagenes[imageIndex];
    
    try {
      await deleteFile(image.public_id);
    } catch (error) {
      console.error('Error eliminando archivo de Cloudinary:', error);
    }

    property.imagenes.splice(imageIndex, 1);
    await property.save();

    res.json({
      status: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

module.exports = router;