# Alumni frontend

A simple React application built with Vite, React Router, and Tailwind CSS.

## Run locally

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run lint
npm run build
npm run preview
```

Routes: `/` (home), `/about` (association), and a fallback for unknown URLs.
When deploying, configure your host to serve `index.html` for frontend routes.

## Homepage

The public homepage introduces the association and its community features.
It includes responsive navigation, reusable sections, and links to the About page.
The feature descriptions are informational; account, directory, event, and donation workflows are not implemented yet.

Use a current Node.js LTS release supported by Vite (Node.js 22.12+ or 24 LTS).
