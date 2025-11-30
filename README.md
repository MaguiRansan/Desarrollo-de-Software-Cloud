## MKalpin: Sistema de Gestión de Propiedades Cloud
Repositorio del Proyecto Final de la cátedra ***Desarrollo de Software Cloud.***

---

### Integrantes del Proyecto

* *Capra, Valentina*
* *Gardiner, Ariadna*
* *Kalpin, Sofia*
* *Ransan, Magali*
---

### Propuesta del Proyecto

La idea para **MKalpin** surge de una necesidad real y práctica: el negocio inmobiliario del padre de una de las integrantes del equipo. Esta oportunidad nos brindó un caso de uso funcional, permitiéndonos aplicar los conocimientos teóricos de la asignatura **Desarrollo de Software Cloud** en un proyecto con potencial de producción.

Decidimos aprovechar el proyecto final para:

1.  **Resolver una necesidad de negocio real** (centralizar y optimizar la gestión inmobiliaria).
2.  **Demostrar la capacidad de construir una solución *cloud-native*** desde cero, garantizando escalabilidad y alta disponibilidad.
3.  Implementar el sistema directamente en un **entorno de producción** para uso comercial real.

---

### Descripción 

La aplicación **MKalpin** es una solución de gestión integral diseñada para centralizar y optimizar las operaciones de una inmobiliaria o gestora de propiedades.

El sistema maneja de forma eficiente:
* **Alquileres** (tanto a largo como a corto plazo/temporales)
* **Ventas**
* **Administración de Contactos**
  
Su objetivo principal es mejorar tanto la eficiencia interna de la gestión como la experiencia del cliente.

---

### Funcionalidades Clave

El sistema ofrece paneles personalizados con las siguientes funcionalidades:

| Tipo de Usuario | Tareas y Funcionalidades Principales |
| :--- | :--- |
| **Administrador** | • Dashboard: Resumen de actividad y métricas en tiempo real.<br>• Gestión de Propiedades (CRUD): Altas, bajas y modificaciones de inmuebles.<br>• Gestión Multimedia: Carga de imágenes optimizadas a la nube (Cloudinary).<br>• Alquileres Temporales: Calendario interactivo de ocupación y reservas.<br>• Configuración: Administración de datos públicos de la empresa. |
| **Usuario Final (Cliente)** | • Búsqueda Avanzada: Filtros por ubicación, operación y comodidades.<br>• Mapas Interactivos: Geolocalización de propiedades.<br>• Contacto: Formularios validados para consultas generales o reservas. |

---

### Stack Tecnológico y Arquitectura 

La creación de **MKalpin** se centra en la necesidad de **centralizar** y **optimizar** la gestión, migrando toda la operación a una **arquitectura cloud escalable** para cumplir los objetivos de la materia.

El proyecto sigue una arquitectura **MERN (MongoDB, Express, React, Node.js)** orientada a microservicios y desplegada en la nube.

### Frontend
* **React.js** (Framework UI)
* **Tailwind CSS** & **Bootstrap** (Estilos)
* **Leaflet / React-Leaflet** (Mapas interactivos)
* **React-Datepicker** & **Big Calendar** (Gestión de fechas)

### Backend
* **Node.js** & **Express** (API RESTful)
* **Mongoose** (ODM para MongoDB)
* **JWT** (Autenticación y Seguridad)
* **Nodemailer** (Sistema de notificaciones por email)

### Cloud Services (Infraestructura)
* **Render:** Despliegue de Frontend y Backend (CI/CD automático).
* **MongoDB Atlas:** Base de datos NoSQL distribuida.
* **Cloudinary:** CDN para almacenamiento y optimización de imágenes.
* **SendGrid:** Proveedor de infraestructura de correo electrónico.
