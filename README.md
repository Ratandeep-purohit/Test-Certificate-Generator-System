# Test Certificate Generator System

A production-ready, frontend-only Test Certificate Generator application designed for enterprise-grade, print-ready document rendering. Built entirely on client-side logic using HTML5, CSS3, and Vanilla JavaScript, ensuring rapid rendering speeds and zero server dependency.

## Features

- **Live Data Binding**: Inputs dynamically render to the certificate preview with high responsiveness.
- **Glassmorphic UI**: A premium user interface for data entry with modern, clean styling.
- **Client-side PDF Generation**: Uses `html2pdf.js` for completely local, high-performance rendering.
- **Print Optimization**: Automatically strips heavy shadows, transforms, and UI elements during export to ensure clean A4 physical paper printing without pixel bleeding.
- **Sub-Pixel Pagebreak Prevention**: Incorporates temporary DOM modifications during snapshot capture to prevent rendering errors like ghost pages.
- **Offline Drafts**: Automatically saves form data locally to your browser via `localStorage` so your progress is never lost.

## Tech Stack
- HTML5
- Vanilla CSS3 (Custom properties, Flexbox, media print queries)
- Vanilla JavaScript
- FontAwesome Icons
- Google Fonts (Cinzel, Lora, Inter)

## Deployment

Since this application relies strictly on frontend code, it can easily be hosted completely for free via **GitHub Pages**, Vercel, or Netlify.

Simply upload the codebase and visit the `index.html`.
