# Taskmaster App

A task management application built with Angular 20. Users can track their progress on tasks and save their progress with nicknames.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd taskmaster-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:4200](http://localhost:4200) in your browser.

## Building for Production

To build the app for production (Cloudflare Pages deployment):

```bash
npm run build:static
```

The built files will be in the `dist/taskmaster-app/browser` directory.

## Deployment to Cloudflare Pages

There are two ways to deploy:

1. **Using Cloudflare Pages UI**:
   - Build command: `npm run build:static`
   - Build output directory: `dist/taskmaster-app/browser`
   - Root directory: `/` (leave empty)

2. **Using Wrangler CLI**:
   ```bash
   npm install -g wrangler
   npm run deploy
   ```

This will:
1. Build your application
2. Deploy it to Cloudflare Pages

### Data Storage

The app uses browser localStorage to save:
- User nicknames and progress
- Task completion status
- Leaderboard data

This means data is saved locally on each user's device and persists between sessions.

### Tasks

The app comes with predefined tasks related to learning Angular development, but these can be easily customized by editing the `TaskService` in `src/app/services/task.service.ts`.

### Adding New Tasks

Edit `src/app/services/task.service.ts` and modify the `defaultTasks` array:

```typescript
private readonly defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Your Task Title',
    description: 'Task description here',
    category: 'Task Category'
  },
  // Add more tasks...
];

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)