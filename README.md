# Backend-MediSupply (Monorepo con Nx)

Repositorio monorepo creado con Nx. Contiene múltiples servicios (apps) y librerías compartidas (libs) para facilitar el desarrollo y la reutilización de código.

## Inicio rápido

1. Clonar el repositorio.
2. Instalar dependencias desde la raíz del proyecto:
```bash
npm install
```

## Extensiones recomendadas (VS Code)

- Nx Console
- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code
- Path Intellisense
- NestJS Snippets (si trabajas con Nest)

Instalar estas extensiones mejora la experiencia de desarrollo y las integraciones con Nx.

## Estructura principal

- `apps/`  
    Aquí se encuentran todos los servicios (aplicaciones) del monorepo. Cada carpeta dentro de `apps` corresponde a una app/servicio independiente.

- `libs/`  
    Contiene librerías compartidas y modulares que pueden ser usadas por varias apps. Son útiles para lógica de dominio, utilidades, interfaces y módulos reutilizables.

## Comandos útiles

Ejecutar los comandos desde la raíz del monorepo.

- Crear un módulo en una app Nest:
```bash
npx nx g @nx/nest:module nombre --path=apps/servicio/src/app
```

- Crear una librería Nest (por ejemplo en `libs/domain/core`):
```bash
npx nx g @nx/nest:library libs/domain/core
```

- Crear una nueva app/servicio Nest:
```bash
npx nx g @nx/nest:app apps/perfiles
```

Estos generadores ayudan a mantener consistencia en la estructura del monorepo y en las dependencias entre apps y libs.

## Buenas prácticas rápidas

- Mantener la lógica compartida en `libs/`.
- Usar generadores de Nx para crear módulos/librerías/apps.
- Configurar linting y formateo (ESLint + Prettier).
- Ejecutar pruebas y builds desde la raíz para aprovechar cache y distribución de Nx.

--- 

