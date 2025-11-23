# Render Deployment Quick Start

🚀 **Deployar MKalpin en Render en 5 pasos**

## 1️⃣ Push a GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

> [!NOTE]
> **Actualización Importante**: El archivo `src/config/apiConfig.js` ahora usa la variable de entorno `REACT_APP_API_URL` para conectarse al backend. En producción, esto apuntará automáticamente a tu backend en Render.

## 2️⃣ Crear Blueprint en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Conecta tu repositorio de GitHub
4. Click **Apply**

## 3️⃣ Configurar Variables de Entorno

Render creará 2 servicios automáticamente. Para cada uno:

**Backend** → Environment → Agregar:
- `MONGODB_URI` (tu connection string de MongoDB Atlas)
- `JWT_SECRET` (genera uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Frontend** → Environment → Agregar:
- `REACT_APP_GOOGLE_CLIENT_ID`

Ver `.env.template` para la lista completa.

## 4️⃣ Actualizar URLs

Después del primer deploy, obtén las URLs de Render y actualiza:

**En Backend Environment:**
- `FRONTEND_URL=https://tu-frontend.onrender.com`
- `GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/API/Usuario/google/callback`

**En Frontend Environment:**
- `REACT_APP_API_URL=https://tu-backend.onrender.com`

## 5️⃣ Configurar MongoDB Atlas

1. MongoDB Atlas → Network Access
2. Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)

---

## ✅ Verificar

- Backend: `https://tu-backend.onrender.com/health`
- Frontend: `https://tu-frontend.onrender.com`

---

📖 **Guía completa**: Ver `DEPLOYMENT.md`

⚠️ **Plan Free**: Los servicios se duermen después de 15 min de inactividad. Primera carga será lenta.
