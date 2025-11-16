const express = require('express');
const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { validateProperty, validateId, validateSearch } = require('../middleware/validation');
const { uploadPropertyImages, handleMulterError, deleteFile } = require('../middleware/upload');
const { geocodeAddress } = require('../utils/geocoding');

const router = express.Router();
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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

console.log('Registered property routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  }
});

router.get('/Disponibilidad/:id', [validateId, optionalAuth], async (req, res) => {
  console.log('GET /Disponibilidad/:id - Params:', req.params);
  try {
    const property = await Property.findOne({ _id: req.params.id, activo: true })
      .select('availability estado')
      .lean();

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    res.json({
      status: true,
      message: 'Disponibilidad obtenida correctamente',
      value: property
    });
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});


const handleDisponibilidadUpdate = async (req, res) => {
  console.log(`=== DISPONIBILidad ${req.method} REQUEST ===`);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  try {
    const { startDate, endDate, status, clientName, deposit, guests } = req.body;
    
    if (!startDate || !endDate || !status) {
      return res.status(400).json({
        status: false,
        message: 'Faltan campos requeridos: startDate, endDate, status'
      });
    }

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
        message: 'No tienes permisos para actualizar esta propiedad'
      });
    }

    const newRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status,
      clientName: clientName || '',
      deposit: parseFloat(deposit) || 0,
      guests: parseInt(guests) || 1,
      id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (isNaN(newRange.startDate.getTime()) || isNaN(newRange.endDate.getTime())) {
      return res.status(400).json({
        status: false,
        message: 'Fechas inválidas'
      });
    }

    if (newRange.startDate >= newRange.endDate) {
      return res.status(400).json({
        status: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }

    const hasOverlap = property.availability.some(range => {
      const rangeStart = new Date(range.startDate);
      const rangeEnd = new Date(range.endDate);
      return newRange.startDate <= rangeEnd && newRange.endDate >= rangeStart;
    });

    if (hasOverlap) {
      return res.status(400).json({
        status: false,
        message: 'El rango de fechas se superpone con otro existente'
      });
    }

    property.availability.push(newRange);

    if (['ocupado_temp', 'reservado_temp'].includes(status)) {
      property.estado = status;
    } else if (status === 'disponible' && property.estado !== 'disponible') {
      const hasBookedRanges = property.availability.some(r => 
        ['ocupado_temp', 'reservado_temp'].includes(r.status)
      );
      
      if (!hasBookedRanges) {
        property.estado = 'disponible';
      }
    }

    await property.save();

    res.json({
      status: true,
      message: 'Disponibilidad actualizada correctamente',
      value: property
    });

  } catch (error) {
    console.error('Error actualizando disponibilidad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

router.put('/Disponibilidad/:id', [protect, validateId], handleDisponibilidadUpdate);
router.patch('/Disponibilidad/:id', [protect, validateId], handleDisponibilidadUpdate);


router.delete('/Disponibilidad/:id/:rangeId', [protect, validateId], async (req, res) => {
  console.log('DELETE /Disponibilidad/:id/:rangeId - Params:', req.params);
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
        message: 'No tienes permisos para actualizar esta propiedad'
      });
    }

    const initialLength = property.availability.length;
    property.availability = property.availability.filter(
      range => range.id !== req.params.rangeId && range._id?.toString() !== req.params.rangeId
    );

    if (property.availability.length === initialLength) {
      return res.status(404).json({
        status: false,
        message: 'Rango de disponibilidad no encontrado'
      });
    }

    const hasBookedRanges = property.availability.some(range => 
      ['ocupado_temp', 'reservado_temp'].includes(range.status)
    );
    
    if (!hasBookedRanges) {
      property.estado = 'disponible';
    }

    await property.save();

    res.json({
      status: true,
      message: 'Rango de disponibilidad eliminado correctamente',
      value: property
    });
  } catch (error) {
    console.error('Error eliminando rango de disponibilidad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.delete('/properties/:id/availability/:rangeId', [protect, validateId], async (req, res, next) => {
  req.params.id = req.params.id;
  req.params.rangeId = req.params.rangeId;
  
  const route = router.stack.find(layer => 
    layer.route && 
    layer.route.path === '/:id/availability/:rangeId' && 
    layer.route.methods.delete
  );
  
  if (route) {
    return route.handle(req, res, next);
  }
  
  return res.status(404).json({
    status: false,
    message: 'Ruta no encontrada'
  });
});

router.delete('/:id/availability/:rangeId', [protect, validateId], async (req, res) => {
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
        message: 'No tienes permisos para actualizar esta propiedad'
      });
    }

    const initialLength = property.availability.length;
    property.availability = property.availability.filter(
      range => range.id !== req.params.rangeId && range._id.toString() !== req.params.rangeId
    );

    if (property.availability.length === initialLength) {
      return res.status(404).json({
        status: false,
        message: 'Rango de disponibilidad no encontrado'
      });
    }

    const hasBookedRanges = property.availability.some(range => 
      ['ocupado_temp', 'reservado_temp'].includes(range.status)
    );
    
    if (!hasBookedRanges) {
      property.estado = 'disponible';
    }

    await property.save();

    res.json({
      status: true,
      message: 'Rango de disponibilidad eliminado correctamente',
      value: property
    });

  } catch (error) {
    console.error('Error eliminando rango de disponibilidad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});


router.get('/properties/:id/availability', [validateId, optionalAuth], async (req, res) => {
  req.params.id = req.params.id;
  return router.handle(req, res);
});

router.get('/:id/availability', [validateId, optionalAuth], async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, activo: true })
      .select('availability estado')
      .lean();

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'Propiedad no encontrada'
      });
    }

    res.json({
      status: true,
      message: 'Disponibilidad obtenida correctamente',
      value: {
        availability: property.availability || [],
        status: property.estado || 'disponible'
      }
    });

  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.put('/Propiedad/Actualizar/:id', [protect, validateId, validateProperty], async (req, res) => {
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
        message: 'No tienes permisos para actualizar esta propiedad'
      });
    }

    const updates = { ...req.body };
    
    if (updates.availability && Array.isArray(updates.availability)) {
      property.availability = updates.availability.map(range => {
        const startDate = range.startDate ? new Date(range.startDate) : null;
        const endDate = range.endDate ? new Date(range.endDate) : null;

        if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) {
          console.error('Invalid date range:', range);
          return null;
        }

        return {
          startDate: startDate,
          endDate: endDate,
          status: range.status || 'available',
          clientName: range.clientName || '',
          deposit: parseFloat(range.deposit) || 0,
          guests: parseInt(range.guests) || 1,
          notes: range.notes || '',
          id: range.id || `range-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      }).filter(Boolean); 
      
      property.markModified('availability');
      
      console.log('Processed availability data:', JSON.stringify(property.availability, null, 2));
      
      delete updates.availability;
    }

    if ((!updates.latitud || !updates.longitud) && (updates.direccion || updates.barrio || updates.localidad || updates.provincia)) {
      const geocoded = await geocodeAddress({
        direccion: updates.direccion ?? property.direccion,
        barrio: updates.barrio ?? property.barrio,
        localidad: updates.localidad ?? property.localidad,
        provincia: updates.provincia ?? property.provincia
      });

      if (geocoded) {
        updates.latitud = geocoded.latitud;
        updates.longitud = geocoded.longitud;
      }
    }

    const arrayFields = ['servicios', 'reglasPropiedad', 'metodosPago'];
    arrayFields.forEach(field => {
      if (updates[field] && typeof updates[field] === 'string') {
        try {
          updates[field] = JSON.parse(updates[field]);
        } catch (e) {
          updates[field] = updates[field].split(',').map(item => item.trim());
        }
      }
    });

    Object.keys(updates).forEach(key => {
      if (key !== 'availability' && key !== '_id' && key !== '__v') {
        property[key] = updates[key];
      }
    });

    try {
      await property.save();
      console.log('Property saved successfully:', JSON.stringify(property.availability, null, 2));
      
      const updatedProperty = await Property.findById(req.params.id)
        .populate('idUsuarioCreador', 'nombre apellido correo');

      return res.json({
        status: true,
        message: 'Propiedad actualizada exitosamente',
        value: updatedProperty
      });
    } catch (saveError) {
      console.error('Error saving property:', saveError);
      return res.status(500).json({
        status: false,
        message: 'Error al guardar la propiedad',
        error: process.env.NODE_ENV === 'development' ? saveError.message : 'Error interno'
      });
    }

    res.json({
      status: true,
      message: 'Propiedad actualizada exitosamente',
      value: updatedProperty
    });

  } catch (error) {
    console.error('Error actualizando propiedad:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation Error Details:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        status: false,
        message: 'Error de validación',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    console.error('Complete Error Object:', JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.errors && { errors: error.errors })
    }, null, 2));

    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
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

console.log('Registered property routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

router.use((err, req, res, next) => {
  console.error('Error in property routes:', err);
  res.status(500).json({
    status: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

router.use((req, res) => {
  console.log(`404: Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

module.exports = router;