const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../src/models/User');
const Property = require('../src/models/Property');
const Client = require('../src/models/Client');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mkalpin_inmobiliaria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany({});
    await Property.deleteMany({});
    await Client.deleteMany({});
    

    const adminUser = new User({
      nombre: 'Administrador',
      apellido: 'Sistema',
      correo: 'admin@mkalpin.com',
      contrasenaHash: 'Admin123!',
      idrol: 3,
      telefono: '+5411234567890',
      autProf: true
    });

    await adminUser.save();

    const propietarioUser = new User({
      nombre: 'María',
      apellido: 'García',
      correo: 'maria.garcia@email.com',
      contrasenaHash: 'password123',
      idrol: 1,
      telefono: '+5411234567891'
    });

    const inquilinoUser = new User({
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan.perez@email.com',
      contrasenaHash: 'password123',
      idrol: 2,
      telefono: '+5411234567892'
    });

    await propietarioUser.save();
    await inquilinoUser.save();

    const clienteLocador = new Client({
      nombreCompleto: 'Roberto Carlos Fernández',
      dni: '25123456',
      email: 'roberto.fernandez@email.com',
      telefono: '+5411234567893',
      domicilio: 'Av. Corrientes 1234, CABA',
      rol: 'Locador',
      tipoAlquiler: 'Alquiler Temporario',
      fechaNacimiento: new Date('1980-05-15'),
      nacionalidad: 'Argentina',
      estadoCivil: 'Casado',
      profesion: 'Ingeniero',
      empresa: 'TechCorp SA',
      ingresosMensuales: 250000,
      cuitCuil: '20-25123456-7',
      tienePropiedad: true,
      idUsuarioCreador: adminUser._id
    });

    const clienteLocatario = new Client({
      nombreCompleto: 'Ana María López',
      dni: '30987654',
      email: 'ana.lopez@email.com',
      telefono: '+5411234567894',
      domicilio: 'Calle Falsa 123, CABA',
      rol: 'Locatario',
      tipoAlquiler: 'Alquiler Temporario',
      fechaNacimiento: new Date('1985-08-22'),
      nacionalidad: 'Argentina',
      estadoCivil: 'Soltero',
      profesion: 'Diseñadora Gráfica',
      empresa: 'Freelancer',
      ingresosMensuales: 180000,
      cuitCuil: '27-30987654-1',
      tienePropiedad: false,
      idUsuarioCreador: adminUser._id
    });

    await clienteLocador.save();
    await clienteLocatario.save();

    const propiedades = [
      {
        titulo: 'Hermoso Apartamento en Playa del Carmen',
        descripcion: 'Moderno apartamento de 2 ambientes completamente equipado en el corazón de Playa del Carmen. Ideal para turistas o estancias temporales.',
        direccion: 'Av. 10 Norte 245',
        barrio: 'Centro',
        localidad: 'Playa del Carmen',
        provincia: 'Quintana Roo',
        ubicacion: 'Playa del Carmen',
        tipoPropiedad: 'Apartamento',
        transaccionTipo: 'Alquiler',
        precio: 150000,
        habitaciones: 2,
        banos: 1,
        superficieM2: 65,
        estado: 'Disponible',
        latitud: 20.6273,
        longitud: -87.0746,
        locador: clienteLocador.nombreCompleto,
        idClienteLocador: clienteLocador._id,
        esAlquilerTemporario: true,
        precioPorNoche: 8500,
        precioPorSemana: 50000,
        precioPorMes: 180000,
        capacidadPersonas: 4,
        especificaciones: ['Cocina Equipada', 'Seguridad 24hs', 'Smart TV', 'Aire acondicionado', 'Sin Piscina'],
        servicios: ['WiFi', 'Limpieza general', 'Estacionamiento', 'Kit de Bienvenida', 'Ropa de Cama', 'Servicio de conserjeria'],
        reglasPropiedad: ['No fumar', 'No mascotas', 'Respetar horarios de descanso'],
        horarioCheckIn: '15:00',
        horarioCheckOut: '11:00',
        politicaCancelacion: 'Moderada',
        depositoSeguridad: 15000,
        metodosPago: ['Efectivo', 'Transferencia', 'MercadoPago'],
        idUsuarioCreador: adminUser._id,
        activo: true,
        imagenes: []
      },
      {
        titulo: 'Casa Familiar en San Isidro',
        descripcion: 'Amplia casa de 4 ambientes con jardín y parrilla. Perfecta para familias que buscan tranquilidad.',
        direccion: 'Calle Los Robles 850',
        barrio: 'Centro',
        localidad: 'San Isidro',
        provincia: 'Buenos Aires',
        ubicacion: 'San Isidro Centro',
        tipoPropiedad: 'Casa',
        transaccionTipo: 'Venta',
        precio: 85000000,
        habitaciones: 4,
        banos: 2,
        superficieM2: 180,
        estado: 'Disponible',
        latitud: -34.4708,
        longitud: -58.5088,
        propietario: 'Carlos Eduardo Martínez',
        esAlquilerTemporario: false,
        idUsuarioCreador: propietarioUser._id,
        activo: true,
        imagenes: []
      },
      {
        titulo: 'Local Comercial en Microcentro',
        descripcion: 'Local comercial en zona céntrica con gran circulación peatonal. Ideal para cualquier tipo de negocio.',
        direccion: 'Av. 9 de Julio 1500',
        barrio: 'Microcentro',
        localidad: 'CABA',
        provincia: 'Buenos Aires',
        ubicacion: 'Microcentro',
        tipoPropiedad: 'Local',
        transaccionTipo: 'Alquiler',
        precio: 180000,
        habitaciones: 0,
        banos: 1,
        superficieM2: 45,
        estado: 'Disponible',
        latitud: -34.6037,
        longitud: -58.3816,
        esAlquilerTemporario: false,
        idUsuarioCreador: propietarioUser._id,
        activo: true,
        imagenes: []
      }
    ];

    const savedProperties = await Property.insertMany(propiedades);

    


    mongoose.disconnect();

  } catch (error) {
    console.error('Error sembrando base de datos:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
