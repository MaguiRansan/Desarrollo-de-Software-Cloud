const express = require('express');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.post('/Registrar', validateRegister, async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, idrol, telefono } = req.body;

    const existingUser = await User.findOne({ correo: correo.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'Ya existe un usuario con este correo electrónico'
      });
    }

    const user = new User({
      nombre,
      apellido,
      correo: correo.toLowerCase(),
      contrasenaHash: contrasena,
      idrol,
      telefono,
      autProf: idrol === 3
    });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      status: true,
      message: 'Usuario registrado exitosamente',
      token,
      value: user.toPublicJSON(),
      idrol: user.idrol
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/IniciarSesion', validateLogin, async (req, res) => {
  try {
    const { correo, contrasenaHash } = req.body;

    const user = await User.findByEmail(correo);
    if (!user) {
      return res.status(400).json({ status: false, message: 'Credenciales inválidas' });
    }

    if (user.isBlocked) {
      return res.status(400).json({
        status: false,
        message: 'Usuario bloqueado temporalmente por intentos fallidos. Intente más tarde.'
      });
    }

    const isMatch = await user.comparePassword(contrasenaHash);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(400).json({ status: false, message: 'Credenciales inválidas' });
    }

    await user.updateLastAccess();
    const token = generateToken(user._id);

    res.json({
      status: true,
      message: 'Inicio de sesión exitoso',
      token,
      value: user.toPublicJSON(),
      idrol: user.idrol
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/Perfil', protect, (req, res) => {
  res.json({
    status: true,
    message: 'Perfil obtenido exitosamente',
    value: req.user.toPublicJSON()
  });
});

router.put('/Actualizar', [
  protect,
  body('nombre').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellido').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('telefono').optional().trim().isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { nombre, apellido, telefono } = req.body;
    const updateFields = {};
    if (nombre) updateFields.nombre = nombre;
    if (apellido) updateFields.apellido = apellido;
    if (telefono) updateFields.telefono = telefono;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      status: true,
      message: 'Perfil actualizado exitosamente',
      value: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/CambiarContrasena', [
  protect,
  body('contrasenaActual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('contrasenaNueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(contrasenaActual);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    user.contrasenaHash = contrasenaNueva;
    await user.save();

    res.json({
      status: true,
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/RecuperarContrasena', [
  body('correo').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { correo } = req.body;
    const user = await User.findByEmail(correo);

    const responseMessage = 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.';

    if (!user) {
      return res.json({
        status: true,
        message: responseMessage
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.tokenRecuperacion = resetToken;
    user.tokenRecuperacionExpira = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recuperarcontrasena?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'mkalpinni@gmail.com',
      to: user.correo,
      subject: 'Recuperación de Contraseña - Mkalpin Inmobiliaria',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hola ${user.nombre},</p>
          <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          </p>
          <p>Este enlace expirará en 10 minutos por seguridad.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo de Mkalpin Negocios Inmobiliairios</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);

      res.json({
        status: true,
        message: responseMessage
      });
    } catch (emailError) {
      res.json({
        status: true,
        message: responseMessage + ' (Puede haber un retraso en la entrega del email)'
      });
    }

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/reestablecer-contrasena', async (req, res) => {
  try {
    const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
      return res.status(400).json({
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    if (nuevaContraseña.length < 6) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await User.findOne({
      tokenRecuperacion: token,
      tokenRecuperacionExpira: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.'
      });
    }

    user.contrasenaHash = nuevaContraseña;
    user.tokenRecuperacion = undefined;
    user.tokenRecuperacionExpira = undefined;

    await user.save();

    res.json({
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});
router.get('/Todos', protect, async (req, res) => {
  try {
    if (req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    const users = await User.find({ activo: true })
      .select('-contrasenaHash -intentosLogin -bloqueadoHasta')
      .sort({ fechaCreacion: -1 });

    res.json({
      status: true,
      message: 'Usuarios obtenidos exitosamente',
      value: users.map(user => user.toPublicJSON())
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/Desactivar/:id', protect, async (req, res) => {
  try {
    if (req.user.idrol !== 3) {
      return res.status(403).json({
        status: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        status: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    const user = await User.findByIdAndUpdate(id, { activo: false }, { new: true });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      status: true,
      message: 'Usuario desactivado exitosamente',
      value: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;