const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const router = express.Router();

// Get handlers configuration
router.get('/handlers', (req, res) => {
  try {
    const handlersPath = path.join(__dirname, '../config/handlers.yml');

    if (!fs.existsSync(handlersPath)) {
      return res.status(404).json({
        status: false,
        message: 'Archivo de configuración de handlers no encontrado'
      });
    }

    const handlersConfig = yaml.load(fs.readFileSync(handlersPath, 'utf8'));

    res.json({
      status: true,
      handlers: handlersConfig.handlers,
      metadata: {
        lastModified: fs.statSync(handlersPath).mtime,
        version: '1.0'
      }
    });
  } catch (error) {
    console.error('Error loading handlers config:', error);
    res.status(500).json({
      status: false,
      message: 'Error interno del servidor al cargar configuración de handlers'
    });
  }
});

module.exports = router;
