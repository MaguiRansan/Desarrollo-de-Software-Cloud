const mongoose = require('mongoose');

const seasonalPriceSchema = new mongoose.Schema({
  propiedad: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: [true, 'La fecha de inicio es requerida'] 
  },
  endDate: { 
    type: Date, 
    required: [true, 'La fecha de fin es requerida'] 
  },
  percentage: { 
    type: Number, 
    required: [true, 'El porcentaje es requerido'],
    min: [0, 'El porcentaje no puede ser menor a 0'],
    max: [1000, 'El porcentaje no puede ser mayor a 1000']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion'
  }
});

seasonalPriceSchema.index({ propiedad: 1, startDate: 1, endDate: 1 });

seasonalPriceSchema.methods.isDateInRange = function(date) {
  const checkDate = new Date(date);
  return checkDate >= this.startDate && checkDate <= this.endDate;
};

module.exports = mongoose.model('SeasonalPrice', seasonalPriceSchema);
