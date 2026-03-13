# College ERP System - Frontend

React + Vite frontend for the College ERP System.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your backend URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_API_URL`: Backend API URL (without `/api` suffix)
  - Local: `http://localhost:5000`
  - Production: `https://your-backend-domain.com`

## File Uploads

The system uses environment variables to construct file URLs dynamically. This ensures uploaded files (PDFs, images) work in both development and production.

See `FILE_UPLOAD_EXPLAINED.md` in the root directory for details.

## Deployment

1. Update `VITE_API_URL` in `.env` to your production backend URL
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
