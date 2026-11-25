# Puzzle Club

A community puzzle app where people share Sudoku and word search puzzles, solve them, and chat under each one.

Live site: https://your-live-link-here

![Home page](docs/home.png)

## What it does

* Browse, search and filter shared puzzles
* Create Sudoku in 4 by 4, 6 by 6 and 9 by 9 sizes, checked automatically for exactly one valid solution
* Build word searches with a live grid preview
* Solve puzzles with answers checked on the server, so solutions never reach the browser
* Chat under every puzzle

## Built with

Next.js, TypeScript, Tailwind CSS, Firebase Firestore, deployed on Vercel

## Run it locally

1. Clone the repo and run `npm install`
2. Create `.env.local` with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY
3. Run `npm run dev`