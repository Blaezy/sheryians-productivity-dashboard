# Basecamp — Daily Control Panel

A single-page productivity dashboard built with plain HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser.

## Features

### Todo List
- Add tasks with a text input
- Mark a task important (star)
- Mark a task complete (checkbox)
- Delete a task
- Filter by All / Active / Important / Done
- Saved to Local Storage, so tasks survive a page refresh

### Daily Planner
- 24 hourly slots covering the full day
- Type a plan into any hour
- The current hour is highlighted automatically
- Saved to Local Storage

### Daily Goals
- Add short-term goals for the day
- Mark a goal done
- Delete a goal
- Live progress bar and "X of Y completed" counter
- Saved to Local Storage

### Motivation Quote
- Fetches a random quote from a live API on load
- "New Quote" button fetches another one
- If the API is unreachable, falls back to a small built-in quote list instead of showing a blank card

### Pomodoro Timer
- Work session (25 min), Short Break (5 min), Long Break (15 min)
- Start / Pause / Reset controls
- Countdown shown as MM:SS
- Plays a soft two-tone chime and shows an alert when a session ends

### Weather
- Detects your location (with your permission) and shows live temperature, condition, wind, humidity, and feels-like
- If location access is denied or unavailable, falls back to a default city
- Shows your actual city name via reverse geocoding
- "Refresh" button to reload

### Date & Time
- Live clock that updates every second
- Full formatted date (day, date, month, year)

### Theme Toggle
- Switch between light and dark mode
- Choice is remembered across visits (saved to Local Storage)
- Theme is applied before the page renders, so there's no flash of the wrong theme on load

### Dynamic Background (time-of-day)
The background glow behind the dashboard changes automatically based on the real-world time of day:

| Time range   | Category  |
|--------------|-----------|
| 5 AM – 12 PM | Morning   |
| 12 PM – 5 PM | Afternoon |
| 5 PM – 9 PM  | Evening   |
| 9 PM – 5 AM  | Night     |

Each category has its own soft gradient color, and the greeting text at the top ("Good morning...", "Good evening...", etc.) updates along with it. This is checked every second using the device's system clock, so if you leave the dashboard open across a time boundary (e.g. it turns 9 PM while the tab is open), the background transitions automatically — no refresh needed.

## Project structure

```
index.html    → page structure and all sections
style.css     → all styling, themes, layout
script.js     → all logic: navigation, storage, timers, API calls
```

## Data & APIs used

- **Local Storage** — todos, planner entries, goals, and theme choice
- **Open-Meteo** — live weather data (no API key required)
- **BigDataCloud** — reverse geocoding (turns your coordinates into a city name)
- **DummyJSON** — random motivation quotes

## Notes

- Everything runs client-side — no backend, no build tools, no npm install needed
- Works as a single folder you can open directly or deploy to any static host (e.g. Vercel)