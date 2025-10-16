const express = require('express');
const Tasacion = require('../models/Tasacion');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateTasacion, validateId, handleValidationErrors } = require('../middleware/validation');
const { uploadTasacionImages, handleMulterError, getFileUrl } = require('../middleware/upload');
const { body, query } = require('express-validator');

const router = express.Router();

router.post('/Solicitar', validateTasacion, async (req, res) => {
  try {
    const adminUser = await User.findOne({ idrol: 3, activo: true });

    if (!adminUser) {
      return res.status(400).json({
        status: false,
        message: 'No hay administradores disponibles para asignar la tasación'
      });
    }

    const tasacionData = {
      ...req.body,
      estado: 'Pendiente',
      fechaSolicitud: new Date(),
      idUsuarioAsignado: adminUser._id
    };

    const tasacion = new Tasacion(tasacionData);
    await tasacion.save();

    res.json({
      status: true,
      message: 'Solicitud de tasación enviada exitosamente. Te contactaremos pronto.',
      value: tasacion.idTasacion
    });

  } catch (error) {
    console.error('Error solicitando tasación:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Obtener', [
  protect,
  query('estado')
    .optional()
    .isIn(['Pendiente', 'En_Proceso', 'Completada', 'Cancelada'])
    .withMessage('Estado inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { estado } = req.query;
    
    let query = {};
    if (estado) query.estado = estado;

    const tasaciones = await Tasacion.find(query)
      .populate('idPropiedad', 'titulo direccion precio')
      .populate('idCliente', 'nombreCompleto email telefono')
      .populate('idUsuarioAsignado', 'nombre apellido')
      .populate('idUsuarioCreador', 'nombre apellido')
      .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: 'Tasaciones obtenidas exitosamente',
      value: tasaciones
    });

  } catch (error) {
    console.error('Error obteniendo tasaciones:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Obtener/:id', [protect, validateId], async (req, res) => {
  try {
    const tasacion = await Tasacion.findById(req.params.id)
      .populate({
        path: 'idPropiedad',
        populate: {
          path: 'imagenes'
        }
      })
      .populate('idCliente')
      .populate('idUsuarioAsignado', 'nombre apellido correo')
      .populate('idUsuarioCreador', 'nombre apellido');

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    res.json({
      status: true,
      message: 'Tasación obtenida exitosamente',
      value: tasacion
    });

  } catch (error) {
    console.error('Error obteniendo tasación:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.put('/Actualizar/:id', [
  protect,
  validateId,
  body('estado')
    .optional()
    .isIn(['Pendiente', 'En_Proceso', 'Completada', 'Cancelada'])
    .withMessage('Estado inválido'),
  body('valorEstimado')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor estimado debe ser mayor a 0'),
  body('valorMinimo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor mínimo debe ser mayor a 0'),
  body('valorMaximo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor máximo debe ser mayor a 0'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  body('detallesTasacion')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Los detalles no pueden exceder 2000 caracteres'),
  body('fechaVisita')
    .optional()
    .isISO8601()
    .toDate(),
  handleValidationErrors
], async (req, res) => {
  try {
    const tasacion = await Tasacion.findById(req.params.id);

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    if (tasacion.idUsuarioAsignado.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para actualizar esta tasación'
      });
    }

    const { valorMinimo, valorMaximo, valorEstimado } = req.body;
    
    if (valorMinimo && valorMaximo && valorMaximo <= valorMinimo) {
      return res.status(400).json({
        status: false,
        message: 'El valor máximo debe ser mayor que el valor mínimo'
      });
    }

    if (valorEstimado && valorMinimo && valorMaximo) {
      if (valorEstimado < valorMinimo || valorEstimado > valorMaximo) {
        return res.status(400).json({
          status: false,
          message: 'El valor estimado debe estar entre el valor mínimo y máximo'
        });
      }
    }

    const updatedTasacion = await Tasacion.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        idUsuarioCreador: req.user._id
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'idPropiedad', select: 'titulo direccion' },
      { path: 'idCliente', select: 'nombreCompleto email' },
      { path: 'idUsuarioAsignado', select: 'nombre apellido' }
    ]);

    res.json({
      status: true,
      message: 'Tasación actualizada exitosamente',
      value: updatedTasacion
    });

  } catch (error) {
    console.error('Error actualizando tasación:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.put('/ProgramarVisita/:id', [
  protect,
  validateId,
  body('fechaVisita')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const now = new Date();
      if (value <= now) {
        throw new Error('La fecha de visita debe ser en el futuro');
      }
      return true;
    }),
  handleValidationErrors
], async (req, res) => {
  try {
    const tasacion = await Tasacion.findById(req.params.id);

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    if (tasacion.idUsuarioAsignado.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para programar visitas para esta tasación'
      });
    }

    await tasacion.programarVisita(new Date(req.body.fechaVisita));

    res.json({
      status: true,
      message: 'Visita programada exitosamente',
      value: {
        fechaVisita: tasacion.fechaVisita,
        estado: tasacion.estado
      }
    });

  } catch (error) {
    console.error('Error programando visita:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

router.post('/SubirImagenes/:id', [
  protect,
  validateId,
  ...uploadTasacionImages,
  handleMulterError
], async (req, res) => {
  try {
    const tasacion = await Tasacion.findById(req.params.id);

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    if (tasacion.idUsuarioAsignado.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para subir imágenes a esta tasación'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No se recibieron archivos'
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const imagenData = {
        rutaArchivo: `tasaciones/${req.params.id}/${file.filename}`,
        nombreArchivo: file.originalname
      };

      await tasacion.agregarImagen(imagenData);
      uploadedImages.push(getFileUrl(req, imagenData.rutaArchivo));
    }

    res.json({
      status: true,
      message: `Se subieron ${uploadedImages.length} imágenes exitosamente`,
      imagenes: uploadedImages
    });

  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/MisTasaciones', protect, async (req, res) => {
  try {
    const tasaciones = await Tasacion.find({ idUsuarioAsignado: req.user._id })
      .populate('idPropiedad', 'titulo direccion')
      .populate('idCliente', 'nombreCompleto email')
      .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: 'Tasaciones asignadas obtenidas exitosamente',
      value: tasaciones
    });

  } catch (error) {
    console.error('Error obteniendo tasaciones del usuario:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Buscar', [
  protect,
  query('termino')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
  query('tipoPropiedad')
    .optional()
    .isIn(['Casa', 'Apartamento', 'Local', 'Terreno', 'Oficina', 'Depósito'])
    .withMessage('Tipo de propiedad inválido'),
  query('valorMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor mínimo debe ser mayor a 0'),
  query('valorMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El valor máximo debe ser mayor a 0'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { termino, tipoPropiedad, valorMin, valorMax } = req.query;
    
    let query = {};

    if (termino) {
      query.$text = { $search: termino };
    }

    if (tipoPropiedad) {
      query.tipoPropiedad = tipoPropiedad;
    }

    if (valorMin || valorMax) {
      query.valorEstimado = {};
      if (valorMin) query.valorEstimado.$gte = Number(valorMin);
      if (valorMax) query.valorEstimado.$lte = Number(valorMax);
    }

    const tasaciones = await Tasacion.find(query)
      .populate('idPropiedad', 'titulo direccion')
      .populate('idCliente', 'nombreCompleto email')
      .populate('idUsuarioAsignado', 'nombre apellido')
      .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: `Se encontraron ${tasaciones.length} tasaciones`,
      value: tasaciones
    });

  } catch (error) {
    console.error('Error buscando tasaciones:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.get('/Estadisticas', protect, async (req, res) => {
  try {
    const stats = await Tasacion.getEstadisticas();

    res.json({
      status: true,
      message: 'Estadísticas obtenidas exitosamente',
      value: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.put('/Cancelar/:id', [
  protect,
  validateId,
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const tasacion = await Tasacion.findById(req.params.id);

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    if (tasacion.idUsuarioAsignado.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para cancelar esta tasación'
      });
    }

    if (tasacion.estado === 'Completada') {
      return res.status(400).json({
        status: false,
        message: 'No se pueden cancelar tasaciones completadas'
      });
    }

    tasacion.estado = 'Cancelada';
    if (req.body.motivo) {
      const motivoTexto = `Cancelada: ${req.body.motivo}`;
      tasacion.observaciones = tasacion.observaciones ? 
        `${tasacion.observaciones}\n${motivoTexto}` : 
        motivoTexto;
    }

    await tasacion.save();

    res.json({
      status: true,
      message: 'Tasación cancelada exitosamente',
      value: tasacion
    });

  } catch (error) {
    console.error('Error cancelando tasación:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

router.delete('/Eliminar/:id', [protect, validateId], async (req, res) => {
  try {
    if (req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para eliminar tasaciones'
      });
    }

    const tasacion = await Tasacion.findByIdAndDelete(req.params.id);

    if (!tasacion) {
      return res.status(404).json({
        status: false,
        message: 'Tasación no encontrada'
      });
    }

    res.json({
      status: true,
      message: 'Tasación eliminada exitosamente',
      value: true
    });

  } catch (error) {
    console.error('Error eliminando tasación:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

module.exports = router;