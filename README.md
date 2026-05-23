# Barnehagehjelpen

Planleggingsverktøy for barnehagelærere — bygget med React + Vite.

## Funksjoner

- 🎵 100 sanger og rim
- 🏃 78 ferdige aktiviteter
- 🖍️ 105 tegneark
- 📖 Rammeplan for barnehagen 2017 (alle 7 fagområder + verdigrunnlag, lek, livsmestring, m.m.)
- 🤖 AI-assistent for ukeplan, månedsplan, årsplan, månedsbrev
- 📅 Egen ukeplan-modul med formiddag/ettermiddag/notat + bilder eller emoji per dag
- 📔 Dokumentasjon (praksisfortellinger og refleksjoner)
- 🔍 Globalt søk på tvers av alt innhold
- 👤 Bruker-system med profilbilder
- 🖨️ Utskrift og nedlasting

All data lagres lokalt i nettleseren.

## Komme i gang

### Forutsetninger

- [Node.js](https://nodejs.org) (versjon 18 eller nyere)
- En kodeeditor (anbefalt: [VS Code](https://code.visualstudio.com))

### Installasjon

```bash
# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev
```

Åpne `http://localhost:5173` i nettleseren.

### Bygg for produksjon

```bash
npm run build
```

Ferdig bygget app legges i `dist/`-mappen.

### Forhåndsvis produksjonsbygg lokalt

```bash
npm run preview
```

## Filstruktur

```
barnehagehjelpen/
├── index.html              # HTML entry point
├── package.json            # Avhengigheter
├── vite.config.js          # Vite-konfigurasjon
├── .gitignore
└── src/
    ├── main.jsx            # React entry point
    └── Barnehagehjelpen.jsx # Hovedappen
```

## Deploye til Vercel

1. Push prosjektet til GitHub
2. Logg inn på [vercel.com](https://vercel.com) med GitHub
3. "Add New..." → "Project" → velg GitHub-repoet
4. Vercel oppdager automatisk Vite – ingen ekstra konfigurasjon nødvendig
5. Klikk "Deploy"

## Bygget med

- React 18
- Vite 5
- Native CSS (ingen Tailwind eller andre CSS-rammeverk)

## Lisens

Privat prosjekt.
