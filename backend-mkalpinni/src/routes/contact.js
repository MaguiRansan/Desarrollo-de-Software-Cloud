const express = require('express');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');
const { validateContact, validateId, handleValidationErrors } = require('../middleware/validation');
const { body, query } = require('express-validator');

const router = express.Router();

router.post('/Enviar', validateContact, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    const contact = new Contact(contactData);
    await contact.save();
    res.status(201).json({
      status: true,
      message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
      value: { idContacto: contact._id }
    });
  } catch (error) {
    console.error('Error enviando contacto:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Obtener', [
  protect,
  query('estado').optional().isIn(['Nuevo', 'En_Proceso', 'Respondido', 'Cerrado']),
  query('tipo').optional().isIn(['General', 'Propiedad', 'Tasacion', 'Alquiler', 'Venta', 'Soporte']),
  handleValidationErrors
], async (req, res) => {
  try {
    const { estado, tipo } = req.query;
    let queryOptions = {};
    if (estado) queryOptions.estado = estado;
    if (tipo) queryOptions.tipoConsulta = tipo;

    const contacts = await Contact.find(queryOptions)
      .populate('idPropiedadConsulta', 'titulo direccion precio')
      .populate('idUsuarioAsignado', 'nombre apellido')
      .sort({ fechaContacto: -1 });

    res.json({
      status: true,
      message: 'Contactos obtenidos exitosamente',
      value: contacts
    });
  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Obtener/:id', [protect, validateId], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('idPropiedadConsulta', 'titulo direccion precio imagenes')
      .populate('idUsuarioAsignado', 'nombre apellido correo');

    if (!contact) {
      return res.status(404).json({ status: false, message: 'Contacto no encontrado' });
    }
    res.json({ status: true, message: 'Contacto obtenido exitosamente', value: contact });
  } catch (error) {
    console.error('Error obteniendo contacto:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/Responder/:id', [
  protect,
  validateId,
  body('respuesta').trim().isLength({ min: 10, max: 2000 }).withMessage('La respuesta debe tener entre 10 y 2000 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ status: false, message: 'Contacto no encontrado' });
    }
    if (contact.estado === 'Cerrado') {
      return res.status(400).json({ status: false, message: 'No se puede responder un contacto cerrado' });
    }
    await contact.responder(req.body.respuesta, req.user._id);
    await contact.populate('idUsuarioAsignado', 'nombre apellido');
    res.json({ status: true, message: 'Respuesta enviada exitosamente', value: contact });
  } catch (error) {
    console.error('Error respondiendo contacto:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/CambiarEstado/:id', [
  protect,
  validateId,
  body('estado').isIn(['Nuevo', 'En_Proceso', 'Respondido', 'Cerrado']).withMessage('Estado inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ status: false, message: 'Contacto no encontrado' });
    }
    await contact.cambiarEstado(req.body.estado, req.user._id);
    await contact.populate('idUsuarioAsignado', 'nombre apellido');
    res.json({ status: true, message: 'Estado actualizado exitosamente', value: contact });
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Buscar', [
  protect,
  query('termino').optional().trim().isLength({ min: 2, max: 100 }),
  query('fechaDesde').optional().isISO8601(),
  query('fechaHasta').optional().isISO8601(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { termino, fechaDesde, fechaHasta } = req.query;
    let queryOptions = {};

    if (termino) {
      queryOptions.$text = { $search: termino };
    }
    if (fechaDesde || fechaHasta) {
      queryOptions.fechaContacto = {};
      if (fechaDesde) queryOptions.fechaContacto.$gte = new Date(fechaDesde);
      if (fechaHasta) queryOptions.fechaContacto.$lte = new Date(fechaHasta);
    }

    const contacts = await Contact.find(queryOptions)
      .populate('idPropiedadConsulta', 'titulo direccion')
      .populate('idUsuarioAsignado', 'nombre apellido')
      .sort({ fechaContacto: -1 });

    res.json({ status: true, message: `Se encontraron ${contacts.length} contactos`, value: contacts });
  } catch (error) {
    console.error('Error buscando contactos:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Estadisticas', protect, async (req, res) => {
  try {
    const stats = await Contact.getEstadisticas();
    res.json({ status: true, message: 'Estadísticas obtenidas exitosamente', value: stats });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Pendientes', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ estado: { $in: ['Nuevo', 'En_Proceso'] } })
      .populate('idPropiedadConsulta', 'titulo direccion')
      .populate('idUsuarioAsignado', 'nombre apellido')
      .sort({ fechaContacto: 1 });
    res.json({ status: true, message: 'Contactos pendientes obtenidos exitosamente', value: contacts });
  } catch (error) {
    console.error('Error obteniendo contactos pendientes:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/MarcarLeido/:id', [protect, validateId], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ status: false, message: 'Contacto no encontrado' });
    }
    if (contact.estado === 'Nuevo') {
      await contact.cambiarEstado('En_Proceso', req.user._id);
    }
    res.json({ status: true, message: 'Contacto marcado como leído', value: contact });
  } catch (error) {
    console.error('Error marcando como leído:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/Eliminar/:id', [protect, validateId], async (req, res) => {
  try {
    if (req.user.idrol !== 3) {
      return res.status(403).json({ status: false, message: 'No tienes permisos para eliminar contactos' });
    }
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ status: false, message: 'Contacto no encontrado' });
    }
    res.json({ status: true, message: 'Contacto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando contacto:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
