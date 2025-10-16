# Frontend - Mkalpin

Este es el frontend de la aplicación Mkalpin, desarrollado con React y diseñado para proporcionar una interfaz de usuario intuitiva para operaciones inmobiliarias.

## Tecnologías Utilizadas

- **React**: Biblioteca para construir interfaces de usuario.
- **React Router**: Para la navegación entre páginas.
- **Antd (Ant Design)**: Componentes de UI para React.
- **Bootstrap**: Framework CSS para diseño responsivo.
- **Tailwind CSS**: Utilitario CSS para estilos rápidos y personalizados.
- **Axios**: Cliente HTTP para realizar peticiones a la API.
- **React Bootstrap**: Componentes de Bootstrap para React.
- **Framer Motion**: Para animaciones fluidas.
- **Leaflet y React Leaflet**: Para mapas interactivos.
- **React Big Calendar**: Para calendarios y eventos.
- **React Icons**: Iconos para la interfaz.
- **React Markdown**: Para renderizar markdown.
- **React Modal**: Para modales.
- **React Slick**: Para carruseles.
- **Swiper**: Para sliders táctiles.
- **Universal Cookies**: Para manejo de cookies.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd frontend-mkalpinni
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

   La aplicación se abrirá en `http://localhost:3000`.

## Uso

Una vez que la aplicación esté corriendo, puedes navegar por las diferentes secciones:

- **Inicio**: Página principal con información general.
- **Propiedades**: Lista y gestión de propiedades inmobiliarias.
- **Calendario**: Vista de calendario para eventos.
- **Mapas**: Visualización de propiedades en mapas.
- **Perfil**: Gestión de usuario.

### Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo.
- `npm build`: Construye la aplicación para producción.
- `npm test`: Ejecuta las pruebas.
- `npm run eject`: Expulsa la configuración de Create React App (no reversible).

## Estructura del Proyecto

- `src/`: Código fuente de la aplicación.
  - `components/`: Componentes reutilizables.
  - `pages/`: Páginas de la aplicación.
  - `assets/`: Recursos estáticos como imágenes y estilos.
  - `utils/`: Utilidades y helpers.
- `public/`: Archivos públicos (índice, favicon, etc.).
- `build/`: Carpeta de construcción (generada).

## Características Principales

- **Interfaz Responsiva**: Adaptada para dispositivos móviles y escritorio.
- **Autenticación**: Integración con Google OAuth y sistema propio.
- **Mapas Interactivos**: Uso de Leaflet para mostrar ubicaciones.
- **Galería de Imágenes**: Carruseles y galerías para propiedades.
- **Calendario**: Gestión de citas y eventos.
- **Notificaciones**: Sistema de alertas y modales.
- **Estilos Modernos**: Uso de Tailwind CSS y componentes de diseño.

## Desarrollo

Para desarrollar nuevas características:

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Implementa los cambios.
3. Ejecuta las pruebas: `npm test`
4. Commit y push.

## Construcción para Producción

```bash
npm run build
```

Esto crea una carpeta `build` con los archivos optimizados para despliegue.

## Contribución

1. Haz fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

## Licencia

Este proyecto es privado y pertenece a Mkalpin Negocios Inmobiliarios.