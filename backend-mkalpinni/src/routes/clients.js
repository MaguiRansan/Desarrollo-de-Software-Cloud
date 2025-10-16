const express = require('express');
const Client = require('../models/Client');
const Property = require('../models/Property');
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/auth');
const { validateClient, validateId, handleValidationErrors } = require('../middleware/validation');
const { uploadClientDocument, handleMulterError, getFileUrl } = require('../middleware/upload');
const { query } = require('express-validator');

const router = express.Router();

router.use(protect);

router.get('/Obtener', async (req, res) => {
  try {
    const clients = await Client.find({ activo: true })
      .populate('idUsuarioCreador', 'nombre apellido')
      .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: 'Clientes obtenidos exitosamente',
      value: clients
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Obtener/:id', validateId, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, activo: true })
      .populate('idUsuarioCreador', 'nombre apellido');

    if (!client) {
      return res.status(404).json({
        status: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      status: true,
      message: 'Cliente obtenido exitosamente',
      value: client
    });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/PorRol/:role', [
  query('tipoAlquiler').optional().isIn(['Alquiler Temporario', 'Alquiler']).withMessage('Tipo de alquiler inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { role } = req.params;
    const { tipoAlquiler } = req.query;

    const validRoles = ['Locador', 'Locatario', 'Propietario', 'Comprador'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: 'Rol inválido'
      });
    }

    const clients = await Client.getByRole(role, tipoAlquiler);

    res.json({
      status: true,
      message: `Clientes con rol '${role}' obtenidos exitosamente`,
      value: clients
    });
  } catch (error) {
    console.error('Error obteniendo clientes por rol:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Buscar', [
  query('nombre').optional().trim().isLength({ max: 255 }),
  query('dni').optional().trim().matches(/^[0-9]*$/),
  query('email').optional().isEmail(),
  query('rol').optional().isIn(['Locador', 'Locatario', 'Propietario', 'Comprador']),
  query('tipoAlquiler').optional().isIn(['Alquiler Temporario', 'Alquiler']),
  query('tienePropiedad').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const filters = req.query;
    const clients = await Client.searchClients(filters);

    res.json({
      status: true,
      message: `Se encontraron ${clients.length} clientes`,
      value: clients
    });
  } catch (error) {
    console.error('Error en búsqueda de clientes:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/Crear', validateClient, async (req, res) => {
  try {
    const existingDni = await Client.findOne({ dni: req.body.dni, activo: true });
    if (existingDni) {
      return res.status(400).json({
        status: false,
        message: 'Ya existe un cliente con este DNI'
      });
    }

    const existingEmail = await Client.findOne({ email: req.body.email.toLowerCase(), activo: true });
    if (existingEmail) {
      return res.status(400).json({
        status: false,
        message: 'Ya existe un cliente con este email'
      });
    }

    const clientData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      idUsuarioCreador: req.user._id
    };

    const client = new Client(clientData);
    await client.save();
    await client.populate('idUsuarioCreador', 'nombre apellido');

    res.status(201).json({
      status: true,
      message: 'Cliente creado exitosamente',
      value: client
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/Actualizar/:id', [validateId, validateClient], async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, activo: true });
    if (!client) {
      return res.status(404).json({
        status: false,
        message: 'Cliente no encontrado'
      });
    }

    if (client.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para editar este cliente'
      });
    }

    if (req.body.dni && req.body.dni !== client.dni) {
      const existingDni = await Client.findOne({ dni: req.body.dni, _id: { $ne: req.params.id }, activo: true });
      if (existingDni) {
        return res.status(400).json({ status: false, message: 'Ya existe otro cliente con este DNI' });
      }
    }

    if (req.body.email && req.body.email.toLowerCase() !== client.email) {
      const existingEmail = await Client.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.params.id }, activo: true });
      if (existingEmail) {
        return res.status(400).json({ status: false, message: 'Ya existe otro cliente con este email' });
      }
    }

    const updateData = { ...req.body, email: req.body.email.toLowerCase() };
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('idUsuarioCreador', 'nombre apellido');

    res.json({
      status: true,
      message: 'Cliente actualizado exitosamente',
      value: updatedClient
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/Eliminar/:id', validateId, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, activo: true });
    if (!client) {
      return res.status(404).json({
        status: false,
        message: 'Cliente no encontrado'
      });
    }

    if (client.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para eliminar este cliente'
      });
    }

    const hasActiveProperties = await Property.exists({
      $or: [
        { idClienteLocador: req.params.id },
        { idClienteLocatario: req.params.id },
        { idClientePropietario: req.params.id },
        { idClienteComprador: req.params.id }
      ],
      activo: true
    });

    const hasActiveReservations = await Reservation.exists({
      idCliente: req.params.id,
      estado: { $in: ['Pendiente', 'Confirmada'] }
    });

    if (hasActiveProperties || hasActiveReservations) {
      return res.status(400).json({
        status: false,
        message: 'No se puede eliminar el cliente porque está asociado a propiedades o reservas activas'
      });
    }

    client.activo = false;
    await client.save();

    res.json({
      status: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/SubirDocumento/:id', [validateId, ...uploadClientDocument, handleMulterError], async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, activo: true });
    if (!client) {
      return res.status(404).json({
        status: false,
        message: 'Cliente no encontrado'
      });
    }

    if (client.idUsuarioCreador.toString() !== req.user._id.toString() && req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para subir documentos a este cliente'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'No se recibió ningún archivo'
      });
    }

    const documentPath = `clientes/${req.params.id}/${req.file.filename}`;
    client.rutaReciboSueldo = documentPath;
    await client.save();

    res.json({
      status: true,
      message: 'Documento subido exitosamente',
      rutaDocumento: getFileUrl(req, documentPath)
    });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Estadisticas', async (req, res) => {
  try {
    const clients = await Client.find({ activo: true });
    
    const stats = clients.reduce((acc, client) => {
      acc.total++;
      if (client.rol === 'Locador') acc.locadores++;
      if (client.rol === 'Locatario') acc.locatarios++;
      if (client.rol === 'Propietario') acc.propietarios++;
      if (client.rol === 'Comprador') acc.compradores++;
      if (client.tipoAlquiler === 'Alquiler Temporario') acc.alquilerTemporario++;
      if (client.tipoAlquiler === 'Alquiler') acc.alquilerTradicional++;
      if (client.tienePropiedad) acc.conPropiedades++;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (client.fechaCreacion >= weekAgo) acc.ultimaSemana++;

      if(client.edad) {
        if (client.edad < 30) acc.porEdad.jovenes++;
        else if (client.edad >= 30 && client.edad < 60) acc.porEdad.adultos++;
        else if (client.edad >= 60) acc.porEdad.mayores++;
      }
      
      return acc;
    }, {
      total: 0, locadores: 0, locatarios: 0, propietarios: 0, compradores: 0,
      alquilerTemporario: 0, alquilerTradicional: 0, conPropiedades: 0, ultimaSemana: 0,
      porEdad: { jovenes: 0, adultos: 0, mayores: 0 }
    });

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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;