const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    maxlength: [255, 'El nombre completo no puede exceder 255 caracteres']
  },
  dni: {
    type: String,
    required: [true, 'El DNI es requerido'],
    unique: true,
    trim: true,
    maxlength: [20, 'El DNI no puede exceder 20 caracteres'],
    match: [/^[0-9]+$/, 'El DNI debe contener solo números']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor ingresa un email válido']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    maxlength: [20, 'El teléfono no puede exceder 20 caracteres']
  },
  domicilio: {
    type: String,
    required: [true, 'El domicilio es requerido'],
    trim: true,
    maxlength: [500, 'El domicilio no puede exceder 500 caracteres']
  },
  rol: {
    type: String,
    required: [true, 'El rol es requerido'],
    enum: ['Locador', 'Locatario', 'Propietario', 'Comprador']
  },
  tipoAlquiler: {
    type: String,
    enum: ['Alquiler Temporario', 'Alquiler']
  },
  fechaNacimiento: {
    type: Date
  },
  nacionalidad: {
    type: String,
    trim: true,
    maxlength: [50, 'La nacionalidad no puede exceder 50 caracteres']
  },
  estadoCivil: {
    type: String,
    enum: ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Civil'],
    trim: true
  },
  profesion: {
    type: String,
    trim: true,
    maxlength: [100, 'La profesión no puede exceder 100 caracteres']
  },
  empresa: {
    type: String,
    trim: true,
    maxlength: [255, 'La empresa no puede exceder 255 caracteres']
  },
  ingresosMensuales: {
    type: Number,
    min: [0, 'Los ingresos mensuales deben ser mayores a 0']
  },
  cuitCuil: {
    type: String,
    trim: true,
    maxlength: [20, 'El CUIT/CUIL no puede exceder 20 caracteres'],
    match: [/^[0-9\-]+$/, 'El CUIT/CUIL debe tener formato válido']
  },
  rutaReciboSueldo: {
    type: String,
    trim: true
  },
  tienePropiedad: {
    type: Boolean,
    default: false
  },
  idUsuarioCreador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion'
  }
});

clientSchema.index({ rol: 1, tipoAlquiler: 1 });
clientSchema.index({ activo: 1, rol: 1 });
clientSchema.index({
  nombreCompleto: 'text',
  email: 'text',
  dni: 'text'
});

clientSchema.virtual('idCliente').get(function() {
  return this._id.toHexString();
});

clientSchema.virtual('edad').get(function() {
  if (!this.fechaNacimiento) return null;
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

clientSchema.statics.searchClients = function(filters = {}) {
  const query = { activo: true };
  if (filters.nombre) query.nombreCompleto = new RegExp(filters.nombre, 'i');
  if (filters.dni) query.dni = new RegExp(filters.dni, 'i');
  if (filters.email) query.email = new RegExp(filters.email, 'i');
  if (filters.rol) query.rol = filters.rol;
  if (filters.tipoAlquiler) query.tipoAlquiler = filters.tipoAlquiler;
  if (filters.tienePropiedad !== undefined) query.tienePropiedad = filters.tienePropiedad;

  return this.find(query)
    .populate('idUsuarioCreador', 'nombre apellido')
    .sort({ fechaCreacion: -1 });
};

clientSchema.statics.getByRole = function(role, tipoAlquiler = null) {
  const query = { activo: true, rol: role };
  if (tipoAlquiler && (role === 'Locador' || role === 'Locatario')) {
    query.tipoAlquiler = tipoAlquiler;
  }
  return this.find(query)
    .populate('idUsuarioCreador', 'nombre apellido')
    .sort({ fechaCreacion: -1 });
};

clientSchema.pre('save', function(next) {
  if ((this.rol === 'Locador' || this.rol === 'Locatario') && !this.tipoAlquiler) {
    return next(new Error('Los Locadores y Locatarios deben tener un tipo de alquiler especificado'));
  }
  if ((this.rol === 'Propietario' || this.rol === 'Comprador') && this.tipoAlquiler) {
    this.tipoAlquiler = undefined;
  }
  next();
});

clientSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.idCliente = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Client', clientSchema);