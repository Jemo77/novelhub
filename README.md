# NovelHub

Plataforma fullstack para publicar y monetizar novelas, cómics y libros. Los autores suben sus obras, gestionan capítulos y reciben pagos en USDT; los lectores exploran el catálogo, leen contenido premium y descargan libros desde un bucket privado.

**Estado:** MVP funcional. Backend y frontend compilan; todavía no hay tests automatizados.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express-4-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

---

## Qué resuelve

NovelHub concentra en una sola aplicación el flujo completo de una plataforma de contenido:

- **Autores:** publican novelas, cómics y libros, suben portadas y capítulos, consultan métricas y configuran enlaces de donación, anuncios y su wallet Web3.
- **Lectores:** exploran el catálogo, leen novelas y cómics, dan likes, compran acceso a capítulos premium y descargan libros.
- **Monetización:** paywall con USDT, acceso temporal o permanente, donaciones externas, anuncios por iframe y descarga de archivos con URLs firmadas.

El proyecto nació como dos repositorios separados (backend y frontend). Este repositorio los unifica en una sola unidad reproducible.

## Funcionalidades

### Catálogo y lectura

- Home con obras destacadas y explorador con búsqueda y filtros por tipo y género.
- Ficha de novela, cómic y libro con sinopsis, portada, autor, vistas y likes.
- Lector de novelas con texto enriquecido y lector de cómics por imágenes.
- Likes y registro de vistas por usuario o identificador anónimo.
- Perfil público del autor con biografía, obras y enlaces.

### Panel de autor

- Dashboard con vistas, likes y cantidad de capítulos por obra.
- Alta de novelas, cómics y libros (PDF/EPUB).
- Subida de portadas optimizadas a WebP con Sharp.
- Capítulos de novela con contenido textual y capítulos de cómic con hasta 50 imágenes.
- Edición y eliminación de obras y capítulos.
- Configuración de wallet Web3, enlaces de donación (Cafecito, PayPal, Ko-fi, Patreon, Buy Me a Coffee, GitHub Sponsors, Mercado Pago) y espacios publicitarios.

### Monetización

- Capítulos premium con precio en USDT y duración opcional.
- Registro de compras con hash de transacción y control de acceso del lado del servidor.
- Libros privados en Cloudflare R2, servidos mediante URLs prefirmadas con vencimiento.
- Paywall Web3 con `ethers` para transferencias ERC-20.
- Donaciones y anuncios configurables por autor.

### Seguridad y cuentas

- Registro y login con JWT (7 días) y contraseñas hasheadas con bcrypt (12 rondas).
- Validación de email, nombre y política de contraseñas.
- Roles `lector` y `autor`; las rutas de autor requieren token y rol.
- Validación de direcciones Ethereum antes de guardar una wallet.
- Límites de subida y procesamiento de imágenes en el backend.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Editor | Tiptap |
| Web3 | ethers v6 |
| Backend | Node.js, Express 4, TypeScript |
| Base de datos | PostgreSQL + Prisma 5 |
| Almacenamiento | Cloudflare R2 (API compatible con S3) |
| Imágenes | Sharp + Multer |
| Autenticación | JWT + bcrypt |
| Pagos | USDT (ERC-20) + enlaces de donación |

## Arquitectura

```text
┌─────────────────────────────┐
│  Next.js 14 (App Router)    │
│  · páginas de lector        │
│  · panel de autor           │
│  · Server Actions           │
└──────────────┬──────────────┘
               │ HTTP / JSON + multipart
┌──────────────▼──────────────┐
│  API REST (Express + TS)    │
│  · auth + JWT               │
│  · contenido y compras      │
│  · subidas y optimización   │
└───────┬──────────────┬──────┘
        │              │
┌───────▼──────┐  ┌────▼─────────────────┐
│ PostgreSQL   │  │ Cloudflare R2        │
│ vía Prisma   │  │ portadas, cómics,    │
│              │  │ libros y URLs firmadas│
└──────────────┘  └──────────────────────┘
```

El frontend usa `fetch` para las vistas de lectura y Server Actions para las operaciones que necesitan enviar archivos o el token guardado en cookie. El backend concentra las reglas de negocio, el control de acceso y la comunicación con R2.

## Estructura

```text
novelhub/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # usuarios, obras, capítulos, compras y vistas
│   ├── src/
│   │   ├── config/             # Prisma y cliente R2
│   │   ├── controllers/        # auth, contenido y autor
│   │   ├── middlewares/        # JWT, rol de autor y límites de subida
│   │   ├── routes/             # /api/auth, /api/contenido, /api/autor
│   │   ├── services/           # reglas de negocio
│   │   └── index.ts            # arranque de Express
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                # rutas del App Router
    │   ├── components/         # UI, lectores, monetización
    │   ├── lib/                # API, auth de servidor y R2
    │   └── utils/              # helpers de cliente
    └── package.json
```

## Puesta en marcha

### Requisitos

- Node.js 20 o superior.
- PostgreSQL 14 o superior.
- Un bucket de Cloudflare R2 con acceso público para portadas e imágenes.
- Una dirección de contrato ERC-20 de USDT para el paywall.

### 1. Base de datos

Creá una base vacía en PostgreSQL local o usá un proveedor compatible (Neon, Supabase, Railway).

```bash
createdb novelhub
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Completá DATABASE_URL, JWT_SECRET y las credenciales de R2
npm install
npx prisma db push
npm run dev
```

La API queda disponible en `http://localhost:3001/api`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Completá NEXT_PUBLIC_API_URL y las variables de R2
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

Para probar el flujo de autor, registrate desde `/registro`, elegí el rol **autor** e ingresá al panel en `/dashboard`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto de la API. Por defecto `3001`. |
| `DATABASE_URL` | Sí | Cadena de conexión de PostgreSQL. |
| `JWT_SECRET` | Sí | Secreto para firmar y verificar tokens. |
| `R2_ENDPOINT` | Sí | Endpoint S3 de Cloudflare R2. |
| `R2_ACCESS_KEY_ID` | Sí | Access key de R2. |
| `R2_SECRET_ACCESS_KEY` | Sí | Secret key de R2. |
| `R2_BUCKET_NAME` | Sí | Bucket donde se guardan portadas, cómics y libros. |
| `R2_PUBLIC_URL` | Sí | URL pública usada para construir las portadas. |

### Frontend (`frontend/.env`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sí | URL pública de la API, por ejemplo `http://localhost:3001`. |
| `NEXT_PUBLIC_USDT_ADDRESS` | Sí | Contrato ERC-20 de USDT usado por el paywall. |
| `R2_ENDPOINT` | Sí | Endpoint de R2 para firmar descargas de libros. |
| `R2_ACCESS_KEY_ID` | Sí | Access key de R2. |
| `R2_SECRET_ACCESS_KEY` | Sí | Secret key de R2. |
| `R2_BUCKET_NAME` | Sí | Bucket de libros y recursos. |

> Las variables `R2_*` del frontend se usan únicamente en el servidor de Next.js para generar URLs firmadas. No llevan el prefijo `NEXT_PUBLIC_` para no exponerlas en el navegador.

## API principal

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/registro` | Crea una cuenta de lector o autor. |
| `POST` | `/api/auth/login` | Devuelve un JWT y los datos del usuario. |
| `GET` | `/api/contenido/home` | Obras destacadas para la portada. |
| `GET` | `/api/contenido/novelas` | Lista paginada de novelas con filtro por género. |
| `GET` | `/api/contenido/comics` | Lista de cómics. |
| `GET` | `/api/contenido/libros` | Lista de libros. |
| `GET` | `/api/contenido/autores/:nombre` | Perfil público del autor. |
| `GET` | `/api/contenido/capitulos-novela/:id` | Contenido de un capítulo de novela. |
| `GET` | `/api/contenido/capitulos-comic/:id` | Imágenes de un capítulo de cómic. |
| `GET` | `/api/contenido/libros/:id` | Ficha y acceso a un libro. |
| `POST` | `/api/contenido/capitulos-novela/:id/comprar` | Registra una compra con `txHash`. |
| `POST` | `/api/contenido/capitulos-comic/:id/comprar` | Registra una compra con `txHash`. |
| `POST` | `/api/contenido/libros/:id/comprar` | Registra la compra de un libro. |
| `POST` | `/api/contenido/novelas/:id/like` | Da like a una novela. |
| `DELETE` | `/api/contenido/novelas/:id/like` | Quita el like. |
| `GET` | `/api/autor/dashboard` | Métricas y obras del autor autenticado. |
| `POST` | `/api/autor/obra` | Crea una obra y sube portada/archivo. |
| `POST` | `/api/autor/obras/:obraId/capitulos/novela` | Crea un capítulo de novela. |
| `POST` | `/api/autor/obras/:obraId/capitulos/comic` | Crea un capítulo de cómic con imágenes. |
| `PATCH` | `/api/autor/obras/:obraId` | Edita una obra. |
| `DELETE` | `/api/autor/obras/:obraId/capitulos/:capituloId` | Elimina un capítulo. |

Las rutas de `/api/autor` requieren `Authorization: Bearer <token>` y rol `autor`.

## Modelo de datos

- `Usuario`: cuenta, rol y credenciales.
- `PerfilAutor`: biografía, wallet Web3, enlaces de donación y anuncios.
- `Novela`, `Comic` y `Libro`: obras con portada, sinopsis, géneros y métricas.
- `CapituloNovela` y `CapituloComic`: contenido, precio, duración y estado premium.
- `CompraCapituloNovela`, `CompraCapituloComic` y `CompraLibro`: compras con `txHash`, precio y vencimiento.
- `VistaNovela`, `VistaComic`, `VistaCapituloNovela` y `VistaCapituloComic`: control de vistas únicas.

## Calidad y limitaciones

- `npm run build` compila el backend (`tsc`) y el frontend (`next build`) sin errores.
- **No hay tests automatizados todavía.** La verificación actual es manual sobre los flujos principales.
- La compra premium registra el `txHash` enviado por el cliente; la verificación on-chain automática queda como siguiente paso.
- El CORS del backend está abierto para desarrollo. En producción debe restringirse al dominio del frontend.
- El token del cliente se guarda en `localStorage` para las vistas y en una cookie para las Server Actions. Una versión productiva debería unificar la estrategia y agregar refresh tokens.

## Autor

Proyecto personal de **Jorge Martín** ([Jemo77](https://github.com/Jemo77)).
