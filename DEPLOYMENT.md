# Guía de Deployment en Render

Esta guía te llevará paso a paso para deployar tu aplicación MKalpin en Render.

## Prerrequisitos

- ✅ Cuenta en [Render.com](https://render.com) (gratis)
- ✅ Repositorio en GitHub con tu código
- ✅ MongoDB Atlas configurado y funcionando
- ✅ Credenciales de Cloudinary y Google OAuth

---

## Paso 1: Preparar tu Repositorio

### 1.1 Asegurar que todos los archivos estén commiteados

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 1.2 Verificar archivos creados

Asegúrate de que estos archivos existan en tu repositorio:
- ✅ `render.yaml` (en la raíz del proyecto)
- ✅ `backend-mkalpinni/build.sh`
- ✅ `frontend-mkalpinni/.env.production`

---

## Paso 2: Configurar MongoDB Atlas para Render

### 2.1 Permitir acceso desde cualquier IP

1. Ve a MongoDB Atlas → **Network Access**
2. Click en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

> [!WARNING]
> Esto es necesario porque Render usa IPs dinámicas. MongoDB Atlas seguirá siendo seguro porque requiere autenticación.

### 2.2 Copiar tu Connection String

1. Ve a **Database** → **Connect** → **Connect your application**
2. Copia el connection string (ejemplo: `mongodb+srv://usuario:password@cluster.mongodb.net/mkalpin_inmobiliaria`)
3. Guárdalo para el siguiente paso

---

## Paso 3: Crear Servicios en Render

### Opción A: Deployment Automático con render.yaml (Recomendado)

1. **Ir a Render Dashboard**
   - Ve a [dashboard.render.com](https://dashboard.render.com)
   - Click en **New +** → **Blueprint**

2. **Conectar Repositorio**
   - Selecciona tu repositorio de GitHub
   - Render detectará automáticamente el archivo `render.yaml`
   - Click **Apply**

3. **Configurar Variables de Entorno**
   
   Render creará dos servicios automáticamente. Para cada uno, debes configurar las variables de entorno:

   **Para el Backend (`mkalpin-backend`):**
   - Ve al servicio → **Environment**
   - Agrega las siguientes variables:

   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/mkalpin_inmobiliaria
   JWT_SECRET=tu_secret_key_muy_seguro_aqui
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   GOOGLE_CLIENT_ID=tu_google_client_id
   GOOGLE_CLIENT_SECRET=tu_google_client_secret
   ```

   **Para el Frontend (`mkalpin-frontend`):**
   - Ve al servicio → **Environment**
   - Agrega:

   ```
   REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
   ```

4. **Guardar y Deploy**
   - Click **Save Changes**
   - Render automáticamente iniciará el deployment

### Opción B: Deployment Manual (Alternativa)

Si prefieres crear los servicios manualmente:

#### Backend Service

1. **New Web Service**
   - Click **New +** → **Web Service**
   - Conecta tu repositorio
   - Configura:
     - **Name**: `mkalpin-backend`
     - **Region**: Oregon (o el más cercano)
     - **Branch**: `main`
     - **Root Directory**: Dejar vacío
     - **Runtime**: Node
     - **Build Command**: `cd backend-mkalpinni && npm install`
     - **Start Command**: `cd backend-mkalpinni && npm start`
     - **Plan**: Free

2. **Environment Variables** (igual que arriba)

3. **Advanced Settings**
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes

#### Frontend Service

1. **New Web Service**
   - Click **New +** → **Web Service**
   - Conecta tu repositorio
   - Configura:
     - **Name**: `mkalpin-frontend`
     - **Region**: Oregon
     - **Branch**: `main`
     - **Root Directory**: Dejar vacío
     - **Runtime**: Node
     - **Build Command**: `cd frontend-mkalpinni && npm install && npm run build`
     - **Start Command**: `cd frontend-mkalpinni && npx serve -s build -l 10000`
     - **Plan**: Free

2. **Environment Variables**
   ```
   REACT_APP_API_URL=https://mkalpin-backend.onrender.com
   REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
   ```

---

## Paso 4: Actualizar URLs en Render

Una vez que ambos servicios estén deployados:

### 4.1 Obtener URLs

Render te dará URLs como:
- Backend: `https://mkalpin-backend.onrender.com`
- Frontend: `https://mkalpin-frontend.onrender.com`

### 4.2 Actualizar Variables de Entorno

**En el Backend:**
- Ve a Environment Variables
- Actualiza `FRONTEND_URL` con la URL real del frontend
- Actualiza `GOOGLE_CALLBACK_URL` con: `https://TU-BACKEND-URL.onrender.com/API/Usuario/google/callback`

**En el Frontend:**
- Actualiza `REACT_APP_API_URL` con la URL real del backend

### 4.3 Actualizar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. Agrega a **Authorized redirect URIs**:
   ```
   https://TU-BACKEND-URL.onrender.com/API/Usuario/google/callback
   ```
6. Agrega a **Authorized JavaScript origins**:
   ```
   https://TU-FRONTEND-URL.onrender.com
   ```

---

## Paso 5: Verificar el Deployment

### 5.1 Verificar Backend

Visita: `https://TU-BACKEND-URL.onrender.com/health`

Deberías ver:
```json
{
  "status": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-11-21T...",
  "version": "1.0.0"
}
```

### 5.2 Verificar Frontend

Visita: `https://TU-FRONTEND-URL.onrender.com`

Deberías ver tu aplicación funcionando.

### 5.3 Verificar Logs

Si algo no funciona:
1. Ve al servicio en Render
2. Click en **Logs**
3. Revisa los errores

---

## Paso 6: Configurar Custom Domain (Opcional)

Si tienes un dominio propio:

1. Ve al servicio → **Settings** → **Custom Domain**
2. Click **Add Custom Domain**
3. Ingresa tu dominio (ej: `api.mkalpin.com` para backend)
4. Sigue las instrucciones para configurar DNS

---

## Variables de Entorno Requeridas

### Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | Connection string de MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Secret para tokens JWT | `mi_secret_super_seguro_123` |
| `JWT_EXPIRE` | Tiempo de expiración del token | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Nombre de tu cloud en Cloudinary | `dxxxxxx` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `123456789012345` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `xxxxxxxxxxxxxxxxx` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | `GOCSPX-xxxxx` |
| `GOOGLE_CALLBACK_URL` | URL de callback para OAuth | `https://tu-backend.onrender.com/API/Usuario/google/callback` |
| `FRONTEND_URL` | URL del frontend | `https://tu-frontend.onrender.com` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto (Render lo configura automáticamente) | `10000` |

### Frontend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL del backend | `https://mkalpin-backend.onrender.com` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `xxxxx.apps.googleusercontent.com` |

---

## Troubleshooting

### ❌ Error: "Application failed to respond"

**Causa**: El backend no está escuchando en el puerto correcto.

**Solución**: Verifica que `server.js` use `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 5228;
```

### ❌ Error: "CORS policy blocked"

**Causa**: El backend no permite requests desde el frontend.

**Solución**: Verifica que `FRONTEND_URL` esté configurado correctamente en las variables de entorno del backend.

### ❌ Error: "Cannot connect to MongoDB"

**Causa**: MongoDB Atlas no permite la conexión desde Render.

**Solución**: 
1. Verifica que hayas agregado `0.0.0.0/0` en Network Access
2. Verifica que el `MONGODB_URI` sea correcto

### ❌ Frontend muestra página en blanco

**Causa**: El frontend no puede conectarse al backend.

**Solución**:
1. Verifica que `REACT_APP_API_URL` apunte al backend correcto
2. Abre la consola del navegador para ver errores
3. Verifica que el backend esté funcionando

### ⚠️ Plan Free se duerme después de 15 minutos

**Comportamiento Normal**: Los servicios gratuitos de Render se duermen después de 15 minutos de inactividad.

**Solución**: 
- Primera carga será lenta (30-60 segundos)
- Considera upgrade a plan pagado si necesitas disponibilidad 24/7
- Usa un servicio de "ping" para mantener el servicio activo

---

## Deployment Automático

Render está configurado para auto-deploy cuando hagas push a GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render automáticamente:
1. Detectará el cambio
2. Ejecutará el build
3. Deployará la nueva versión

---

## Monitoreo

### Ver Logs en Tiempo Real

```bash
# En Render Dashboard
Service → Logs → Live Logs
```

### Métricas

Render Free tier incluye:
- CPU usage
- Memory usage
- Request count
- Response times

---

## Costos

**Plan Free** (lo que estamos usando):
- ✅ 750 horas/mes por servicio
- ✅ Auto-deploy desde Git
- ✅ SSL/HTTPS gratis
- ⚠️ Se duerme después de 15 min de inactividad
- ⚠️ 512 MB RAM

**Plan Starter** ($7/mes por servicio):
- ✅ Siempre activo (no se duerme)
- ✅ 512 MB RAM
- ✅ Todo lo del plan Free

---

## Próximos Pasos

1. ✅ Deploy completado
2. 🔄 Probar todas las funcionalidades
3. 🔄 Configurar dominio personalizado (opcional)
4. 🔄 Configurar monitoring/alertas
5. 🔄 Optimizar performance

---

## Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Render Community](https://community.render.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

¿Necesitas ayuda? Revisa los logs en Render Dashboard o consulta la sección de Troubleshooting.
