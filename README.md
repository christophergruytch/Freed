# Free'd — Built for Hope


**A compassionate React Native app designed to help people overcome pornography/lust addiction without shame or immediate paywalls.**

Free'd meets users in their hardest moments with practical tools, daily encouragement, and real hope. Built from personal experience, with a generous free tier and thoughtful premium features coming soon.

## Core Features

- **Freedom Timer** — Live "Time Free" counter (days + HH:MM:SS) with rotating motivational messages (faith-based or neutral toggle)
- **Facing Temptation** — Guided reflection prompts to pause, and process emotions, with easy access to AI Coach
- **Journal & Insights** — Track journal entries, log relapses with context (app, time, location, notes), view streaks, patterns, and progress calendar
- **Learn & Grow** — Educational content on how addiction develops, recovery patterns, setbacks, and mindset shifts
- **Support Tools** — Music playlist sharing, Smart Protection suggestions, Accountability Partners (in progress), and Community
- **Privacy & Trust** — Local persistence, optional Face ID lock, and user-controlled data

## Tech Stack

- **Frontend**: React Native + Expo (development builds + EAS)
- **State Management**: Zustand + AsyncStorage (persistent across app restarts)
- **Navigation**: React Navigation (bottom tabs + screen navigation)
- **UI/UX**: Custom components and dark theme 
- **Build & Deploy**: EAS for iOS development builds

## Screenshots

Will add screenshots.

- Home Screen with live timer and encouragement
- Facing Temptation reflection flow
- Journal + Relapse logging
- Insights & Progress calendar
- Learn section
- Settings with faith toggle & Face ID

## Getting Started (Local Development)

```bash
git clone https://github.com/christophergruytch/Freed.git
cd Freed
npm install
npx expo start