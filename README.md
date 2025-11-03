# Gestor Órion
App web (React + Vite + TS) + Supabase para controle diário.
## Passos
1) Crie **novo projeto** no Supabase (recomendado) para isolar dados financeiros.
2) SQL: rode `schema.sql` no editor do Supabase.
3) Storage: buckets privados `invoices` e `pos_reports`.
4) Auth: e-mail/senha ativado.
5) Local:
```bash
npm i
npm run dev
```
6) Configure `public/env.js` com URL e anon key.
7) Deploy Netlify: Publish `dist`, e mantenha `public/_redirects`.
