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
const seedPath = path.join(__dirname, '..', '..', 'scripts', 'seedDatabase.js');

async function syncSeedWithUserProfile(correo, updates) {
  try {
    if (!fs.existsSync(seedPath)) return;
    let content = fs.readFileSync(seedPath, 'utf8');

    const patterns = [
      `correo: '${correo}'`,
      `correo: "${correo}"`,
      `correo: \`${correo}\``
    ];

    let correoIndex = -1;
    for (const p of patterns) {
      correoIndex = content.indexOf(p);
      if (correoIndex !== -1) break;
    }
    if (correoIndex === -1) return;

    const startUser = content.lastIndexOf('new User({', correoIndex);
    if (startUser === -1) return;
    const endUser = content.indexOf('})', correoIndex);
    if (endUser === -1) return;

    const blockEnd = endUser + 2;
    let block = content.slice(startUser, blockEnd);

    function esc(val) { return String(val).replace(/'/g, "\\'"); }
    function replaceField(blockStr, field, value) {
      const re = new RegExp(`(${field}:\\s*)['\"\`].*?['\"\`]`);
      return blockStr.replace(re, `$1'${esc(value)}'`);
    }

    if (updates.nombre) block = replaceField(block, 'nombre', updates.nombre);
    if (updates.apellido) block = replaceField(block, 'apellido', updates.apellido);
    if (updates.telefono) block = replaceField(block, 'telefono', updates.telefono);
    if (updates.correo) block = replaceField(block, 'correo', updates.correo.toLowerCase());

    content = content.slice(0, startUser) + block + content.slice(blockEnd);
    fs.writeFileSync(seedPath, content, 'utf8');
  } catch (_) {}
}

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
    console.error('Error en registro:', error);
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
    console.error('Error en login:', error);
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
  body('nombre')
    .optional()
    .trim()
    .custom((value) => {
      if (!/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(value)) {
        throw new Error('Debe contener solo letras, espacios, tildes, apóstrofes y guiones. Entre 2 y 50 caracteres.');
      }
      return true;
    }),
  body('apellido')
    .optional()
    .trim()
    .custom((value) => {
      if (!/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(value)) {
        throw new Error('Debe contener solo letras, espacios, tildes, apóstrofes y guiones. Entre 2 y 50 caracteres.');
      }
      return true;
    }),
  body('telefono')
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      }
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new Error('El teléfono debe tener entre 7 y 15 dígitos.');
      }
      if (!/^[+\s\-()0-9]+$/.test(value)) {
        throw new Error('Solo se permiten números, espacios, +, (, ), y -.');
      }
      return true;
    }),
  body('correo').optional().isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;
    const updateFields = {};
    if (nombre) updateFields.nombre = nombre;
    if (apellido) updateFields.apellido = apellido;
    if (telefono) updateFields.telefono = telefono;
    if (correo) updateFields.correo = correo.toLowerCase();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

 
    if (updateFields.correo && updateFields.correo !== req.user.correo) {
      const exists = await User.findOne({ correo: updateFields.correo });
      if (exists) {
        return res.status(400).json({ status: false, message: 'Ya existe un usuario con este correo electrónico' });
      }
    }

    const oldCorreo = req.user.correo;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    await syncSeedWithUserProfile(oldCorreo, updateFields);

    res.json({
      status: true,
      message: 'Perfil actualizado exitosamente',
      value: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
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
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/ActualizarFoto', [
  protect,
  body('foto').isString().withMessage('La foto es requerida en formato base64')
], async (req, res) => {
  try {
    const { foto } = req.body;
    const match = /^data:(image\/(png|jpeg|jpg));base64,(.+)$/.exec(foto || '');
    if (!match) {
      return res.status(400).json({ status: false, message: 'Formato de imagen inválido' });
    }
    const mime = match[1];
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const base64Data = match[3];

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'usuarios');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${req.user._id}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const relativePath = path.posix.join('usuarios', fileName);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fotoRuta: relativePath },
      { new: true }
    );

    return res.json({
      status: true,
      message: 'Foto actualizada exitosamente',
      value: user.toPublicJSON(),
      ruta: `/uploads/${relativePath}`
    });
  } catch (error) {
    console.error('Error actualizando foto de perfil:', error);
    return res.status(500).json({ status: false, message: 'Error interno del servidor' });
  }
});

// Obtener foto por correo
router.get('/ObtenerFoto/:correo', async (req, res) => {
try {
  const user = await User.findOne({ correo: req.params.correo.toLowerCase() });
  if (!user || !user.fotoRuta) {
    return res.status(404).json({ status: false, message: 'Foto no encontrada' });
  }
  const filePath = path.join(__dirname, '..', '..', 'uploads', user.fotoRuta);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ status: false, message: 'Foto no encontrada' });
  }

  // Prevent caching to ensure the latest image is always fetched
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  return res.sendFile(filePath);
} catch (error) {
  console.error('Error obteniendo foto de perfil:', error);
  return res.status(500).json({ status: false, message: 'Error interno del servidor' });
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
      console.error('Error enviando email:', emailError);

      user.tokenRecuperacion = undefined;
      user.tokenRecuperacionExpira = undefined;
      await user.save();

      res.status(500).json({
        status: false,
        message: 'Error interno del servidor al enviar el correo'
      });
    }

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
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
    console.error('Error restableciendo contraseña:', error);
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
    console.error('Error obteniendo usuarios:', error);
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
    console.error('Error desactivando usuario:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;