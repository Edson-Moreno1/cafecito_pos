# ☕ Cafecito POS

Sistema de Punto de Venta para cafeterías. Gestiona productos, clientes, ventas y usuarios con roles diferenciados (admin / vendedor).

---

## 📁 Estructura del Monorepo

```
cafecito_pos/
├── cafecito-backend/    → API REST (Node.js + Express + MongoDB)
└── cafecito-frontend/   → SPA (Angular 20 + Bootstrap 5)
```

---

# 🖥️ BACKEND

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥ 18.14 | Runtime |
| Express | ^5.2.1 | Framework HTTP |
| MongoDB + Mongoose | ^9.1.2 | Base de datos |
| JWT (jsonwebtoken) | ^9.0.3 | Autenticación |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| express-validator | ^7.3.1 | Validación de inputs |
| dotenv | ^17.2.3 | Variables de entorno |
| cors | ^2.8.5 | Cross-Origin |
| Jest + Supertest | ^30 / ^7 | Testing |
| nodemon | ^3.1.11 | Dev server con hot-reload |

---

## ⚙️ Configuración Inicial

### 1. Clonar e instalar dependencias

```bash
cd cafecito-backend
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz de `cafecito-backend/` basándote en `.env.example`:

```env
PORT=3000
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/cafecito_pos?retryWrites=true&w=majority
```

> ⚠️ **IMPORTANTE:** Nunca subas el `.env` real al repositorio. Ya está en `.gitignore`.

---

## 🚀 Comandos disponibles

```bash
# Iniciar en producción
npm start

# Iniciar en desarrollo con hot-reload (nodemon)
npm run dev

# Poblar la base de datos con datos de prueba
npm run seed

# Correr tests
npm test
```

---

## 🗄️ Base de Datos — Modelos

### `User`
```
name        String  (requerido)
email       String  (único, requerido)
password    String  (hasheada con bcrypt)
role        String  enum: ['admin', 'vendedor']
```

### `Product`
```
name        String  (2-100 chars, requerido)
price       Number  (min: 0.01, requerido)
stock       Number  (min: 0, default: 0)
description String  (opcional)
isActive    Boolean (default: true)
timestamps  createdAt, updatedAt
```

### `Customer`
```
name           String  (2-100 chars, requerido)
email          String  (único por índice parcial, opcional)
phone          String  (único por índice parcial, opcional)
purchasesCount Number  (default: 0) — controla descuentos por lealtad
```
> ⚠️ Regla de negocio: Se requiere al menos `email` **o** `phone`.

### `Sale`
```
saleId          String  (formato: "SALE-{timestamp}-{random}", único)
customerId      ObjectId ref Customer (nullable)
paymentMethod   String  enum: ['cash', 'card', 'transfer']
items[]         Array:
  - productId          ObjectId ref Product
  - productNameSnapshot String
  - unitPriceSnapshot   Number
  - quantity            Number (min: 1)
  - lineTotal           Number
subtotal        Number
discountPercent Number  (0-100)
discountAmount  Number
total           Number
timestamps      createdAt, updatedAt
```

---

## 🔐 Autenticación y Roles

El sistema usa **JWT Bearer Tokens**.

| Rol | Acceso |
|---|---|
| `admin` | Todo: CRUD productos, clientes, usuarios + ver ventas |
| `vendedor` | Crear ventas, ver productos, ver/crear clientes |

### Flujo de login

```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { success, token, user: { _id, name, email, role } }
```

### Registro (solo admin autenticado puede registrar nuevos usuarios)

```
POST /api/auth/register
Headers: Authorization: Bearer <token>
Body: { "name": "...", "email": "...", "password": "...", "role": "vendedor" }
```

### Credenciales de prueba (después de seed)

```
Admin:    email: admin@cafecito.com  |  password: Admin123!
Vendedor: email: juan@cafecito.com   |  password: 123456
```

---

## 📡 Endpoints de la API

### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/auth/register` | ✅ Admin | Crear usuario |

### Products
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | ❌ | Listar productos (paginado) |
| GET | `/api/products/:id` | ❌ | Obtener producto por ID |
| POST | `/api/products` | ✅ Admin | Crear producto |
| PUT | `/api/products/:id` | ✅ Admin | Editar producto |
| DELETE | `/api/products/:id` | ✅ Admin | Eliminar producto |

### Customers
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/customers` | ✅ Admin/Vendedor | Listar clientes |
| GET | `/api/customers/:id` | ✅ Admin/Vendedor | Obtener cliente |
| POST | `/api/customers` | ✅ Admin/Vendedor | Crear cliente |
| PUT | `/api/customers/:id` | ✅ Admin/Vendedor | Editar cliente |
| DELETE | `/api/customers/:id` | ✅ Admin/Vendedor | Eliminar cliente |

### Sales
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/sales` | ✅ Admin/Vendedor | Crear venta |
| GET | `/api/sales` | ✅ Admin/Vendedor | Listar ventas |
| GET | `/api/sales/:id` | ✅ Admin/Vendedor | Detalle de venta |

### Users
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users` | ✅ Admin | Listar usuarios |
| POST | `/api/users` | ✅ Admin | Crear usuario |
| PUT | `/api/users/:id` | ✅ Admin | Editar usuario |
| DELETE | `/api/users/:id` | ✅ Admin | Eliminar usuario |

---

## ✅ Validaciones por módulo

### Producto (`productValidator.js`)
- `name`: requerido, mínimo 2 caracteres
- `price`: requerido, número, mínimo 0.01
- `stock`: número entero, mínimo 0

### Cliente (`customerValidator.js`)
- `name`: requerido, mínimo 2 caracteres
- `email`: formato válido (si se proporciona)
- `phone`: formato string (si se proporciona)
- Al menos `email` o `phone` debe estar presente (validado a nivel de modelo)

### Venta (`saleValidator.js`)
- `items`: array, mínimo 1 elemento
- `items[].product`: ObjectId válido
- `items[].quantity`: entero, mínimo 1
- `paymentMethod`: enum `['cash', 'card', 'transfer']`
- Validación de **stock suficiente** antes de confirmar la venta

---

## 🧪 Tests

El backend usa **Jest** + **Supertest** con soporte para ES Modules.

```bash
npm test
```

> El comando usa `NODE_OPTIONS=--experimental-vm-modules jest` para compatibilidad con `"type": "module"` en `package.json`.

---

## 🌱 Seed — Datos de prueba

```bash
npm run seed
```

Este script:
1. Limpia las colecciones `Product`, `Customer` y `Sale`
2. Inserta ~34 productos de cafetería en 7 categorías
3. Crea 15 clientes de prueba con historial de compras aleatorio
4. Genera ventas de ejemplo

---

## 🏗️ Estructura de carpetas (backend)

```
cafecito-backend/
├── server.js                  → Entry point, setup Express
├── .env                       → Variables de entorno (NO subir)
├── .env.example               → Plantilla de variables
└── src/
    ├── config/
    │   └── database.js        → Conexión a MongoDB
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── productController.js
    │   ├── customerController.js
    │   └── saleController.js
    ├── middlewares/
    │   └── authMiddleware.js  → verifyToken, isAdmin, isVendedorOrAdmin
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Customer.js
    │   └── Sale.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── productRoutes.js
    │   ├── customerRoutes.js
    │   └── saleRoutes.js
    ├── services/
    │   ├── discountService.js → Lógica de descuentos por lealtad
    │   └── saleService.js     → Procesamiento de items de venta
    ├── validators/
    │   ├── productValidator.js
    │   ├── customerValidator.js
    │   └── saleValidator.js
    └── seed.js                → Script de datos de prueba
```

---

---

# 🌐 FRONTEND

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | ^20.3.0 | Framework SPA |
| TypeScript | ~5.9.2 | Lenguaje |
| Bootstrap | ^5.3.8 | UI / estilos |
| Bootstrap Icons | ^1.13.1 | Iconos |
| RxJS | ~7.8.0 | Manejo de estado async |
| Karma + Jasmine | - | Unit testing |
| Angular CLI | ^20.3.6 | Tooling |

---

## ⚙️ Configuración Inicial

### 1. Instalar dependencias

```bash
cd cafecito-frontend
npm install
```

### 2. URL del backend

La URL de la API está hardcodeada en los servicios. Por defecto apunta a:

```
http://localhost:3000/api
```

Si cambias el puerto del backend, actualiza la propiedad `apiUrl` en cada servicio dentro de `src/app/services/`.

---

## 🚀 Comandos disponibles

```bash
# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción (genera dist/)
npm run build

# Build en modo watch (desarrollo continuo)
npm run watch

# Tests unitarios con Karma
npm test
```

---

## 🗺️ Rutas de la aplicación

| Ruta | Componente | Guards | Acceso |
|---|---|---|---|
| `/login` | `Login` | — | Público |
| `/sales` | `Sales` | `authGuard` | Cualquier usuario autenticado |
| `/dashboard` | `Dashboard` | `authGuard` + `adminGuard` | Solo `admin` |
| `/**` | — | — | Redirige a `/login` |

---

## 🔐 Autenticación en el Frontend

### Guards (`src/app/guards/auth-guard.ts`)

- **`authGuard`**: Verifica que exista un `token` en `localStorage`. Si no hay token, redirige a `/login`.
- **`adminGuard`**: Verifica que exista token y que el `user.role === 'admin'` en `localStorage`. Si el usuario no es admin, redirige a `/sales`.

### Interceptor HTTP (`src/app/interceptors/auth.interceptor.ts`)

Inyecta automáticamente el header `Authorization: Bearer <token>` en **todas las peticiones HTTP** si hay un token almacenado. No necesitas agregarlo manualmente en los servicios.

### Almacenamiento en `localStorage`

| Key | Contenido |
|---|---|
| `token` | JWT string |
| `user` | JSON con `{ _id, name, email, role }` |

---

## 📦 Servicios disponibles

Todos los servicios están en `src/app/services/` y usan `inject()` de Angular (estilo standalone).

| Servicio | Archivo | Responsabilidad |
|---|---|---|
| `AuthService` | `auth/auth.service.ts` | Login y registro |
| `ProductService` | `products/product.service.ts` | CRUD de productos + paginación |
| `CustomerService` | `customers/customer.service.ts` | CRUD de clientes |
| `SaleService` | `sales/sale.service.ts` | Crear y obtener ventas |
| `CartService` | `cart/cart.ts` | Gestión del carrito (estado local) |

---

## 📄 Interfaces / Modelos TypeScript

Ubicadas en `src/app/models/`:

### `product.interface.ts`
```typescript
interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  isActive?: boolean;
}
```

### `customer.interface.ts`
```typescript
interface Customer {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  purchasesCount?: number;
}
```

### `sale.interface.ts`

Contiene múltiples interfaces:
- `SaleRequest` — payload que envías al crear una venta
- `SaleItemRequest` — item dentro del request `{ product: string, quantity: number }`
- `Sale` — respuesta del backend con todos los datos
- `SaleItemDetail` — item con snapshots de precio y nombre
- `Ticket` — ticket imprimible generado tras la venta
- `CartItem` — item en el carrito local (solo frontend)
- `PaymentMethod` — `'cash' | 'card' | 'transfer'`

### `auth.interface.ts`
```typescript
interface LoginData { email: string; password: string; }
interface RegisterData { name: string; email: string; password: string; role: string; }
interface AuthResponse { success: boolean; token: string; user: {...} }
```

---

## 🧩 Páginas y Componentes

### `Login` (`/pages/login/`)
- Formulario de autenticación
- Guarda `token` y `user` en `localStorage`
- Redirige a `/sales` (vendedor) o `/dashboard` (admin) según el rol

### `Sales` (`/pages/sales/`)
- Catálogo de productos con **paginación** y **búsqueda en tiempo real**
- Gestión del carrito (agregar, quitar, modificar cantidades)
- Checkout con selección opcional de cliente (búsqueda con debounce)
- Cálculo automático de descuentos por lealtad según `purchasesCount`
- Generación de **ticket** al completar la venta
- Métodos de pago: efectivo, tarjeta, transferencia

### `Dashboard` (`/pages/dashboard/`) — Solo Admin
- Pestañas: **Inventario**, **Clientes**, **Ventas**
- CRUD completo de productos con modal
- CRUD completo de clientes con modal
- Vista de historial de ventas con detalle por venta
- Indicadores de stock: OK / Stock bajo / Agotado

### `Navbar` (`/components/navbar/`)
- Muestra el nombre y rol del usuario activo
- Link a `/sales` para todos
- Link a `/dashboard` solo visible para admins
- Botón de logout (limpia `localStorage` y redirige a `/login`)

---

## 🏗️ Estructura de carpetas (frontend)

```
cafecito-frontend/
├── src/
│   ├── main.ts                    → Bootstrap Angular
│   └── app/
│       ├── app.config.ts          → Providers globales (router, http, interceptors)
│       ├── app.routes.ts          → Definición de rutas
│       ├── app.html               → Shell con <router-outlet>
│       ├── components/
│       │   └── navbar/            → Navbar reutilizable
│       ├── guards/
│       │   └── auth-guard.ts      → authGuard + adminGuard
│       ├── interceptors/
│       │   └── auth.interceptor.ts → Inyecta JWT en headers
│       ├── models/
│       │   ├── auth.interface.ts
│       │   ├── product.interface.ts
│       │   ├── customer.interface.ts
│       │   └── sale.interface.ts
│       ├── pages/
│       │   ├── login/
│       │   ├── sales/
│       │   └── dashboard/
│       └── services/
│           ├── auth/
│           ├── cart/
│           ├── customers/
│           ├── products/
│           └── sales/
└── package.json
```

---

## 🧪 Tests Frontend

```bash
npm test
```

Usa **Karma** como test runner y **Jasmine** como framework. Los archivos de spec están junto a cada archivo (`*.spec.ts`).

---

## 🔗 Comunicación Backend ↔ Frontend

```
Frontend (Angular :4200)
        ↓ HTTP + JWT Bearer
Backend (Express :3000)
        ↓ Mongoose
MongoDB Atlas (Cloud)
```

> En desarrollo ambos corren en paralelo. El interceptor `authInterceptor` maneja el token automáticamente en cada request.

---

## 📌 Notas importantes

- El frontend usa **componentes standalone** (sin NgModules), patrón moderno de Angular 17+.
- Los servicios usan `inject()` en lugar de constructor injection.
- El backend usa **ES Modules** (`"type": "module"` en `package.json`), por eso los imports llevan extensión `.js`.
- Los tests del backend requieren `NODE_OPTIONS=--experimental-vm-modules` para funcionar con ESM.
- Las ventas guardan un **snapshot** del nombre y precio del producto para preservar el historial aunque el producto sea modificado después.
