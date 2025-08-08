# Porflyo Frontend

A modern web application to manage your developer portfolio with GitHub authentication.

## 🚀 Features

- **GitHub Authentication**: Secure OAuth login flow
- **User Profile Management**: Complete personal profile management
- **Data Editing**: Modify name, email, and social links
- **Repository Dashboard**: Organized view of your GitHub repositories
- **Modern Design**: Responsive interface with light/dark mode support
- **SPA Navigation**: Smooth experience with React Router
- **Dynamic Social Links**: Add, edit, or remove multiple social platforms

## 🛠️ Technologies

- **React 19** with TypeScript
- **React Router** for navigation
- **Axios** for HTTP requests
- **Vite** as bundler
- **Modern CSS** with variables and grid/flexbox

## 📁 Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Main dashboard page
│   ├── ProfilePage.tsx  # Profile editing page
│   ├── Navbar.tsx       # Navigation bar
│   └── LoginButton.tsx  # Authentication button
├── context/            # Context API for global state
│   └── UserContext.tsx # User state management
├── services/           # API services
│   └── api.tsx         # HTTP calls to backend
├── styles/             # CSS styles
│   └── modern.css      # Modern design system
└── App.tsx             # Root component with routing
```

## 🔐 Authentication Flow

1. **Initial Load**: App checks authentication status once
2. **Unauthenticated**: Shows welcome page with GitHub login button
3. **OAuth Flow**: Redirects to `/api/login` for GitHub OAuth
4. **Authenticated**: Fetches user data and repositories
5. **State Management**: Prevents infinite API calls with `hasCheckedAuth` flag

## 🎨 Design Features

- **CSS Variables**: Consistent color system
- **Dark Mode**: Automatic support based on system preferences
- **Responsive**: Adapts to mobile and desktop
- **Animations**: Smooth transitions and hover effects
- **Components**: Reusable cards, buttons, and forms

## 🔗 API Endpoints

### Authentication
- `GET /api/user/get` - Get current user data
- `PATCH /api/user/patch` - Update user data
- `GET /api/login` - Start OAuth flow
- `GET /api/logout` - End session

### Repositories
- `GET /api/repos` - Get user repositories

## 🚀 Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## 📋 User State Management

Global state managed with Context API includes:

```typescript
interface User {
  name: string;
  email: string;
  profileImage: string;
  providerUserName: string;    // Read-only (GitHub)
  providerAvatarUrl: string;   // Read-only (GitHub)
  socials: Record<string, string>; // Dynamic social platforms
}
```

## 🌐 Social Links System

The social links system supports dynamic platforms:

```json
{
  "socials": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username"
  }
}
```

Users can:
- Add new social platforms
- Edit existing links
- Remove platforms
- Display all platforms dynamically

## 🔧 Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure backend**: Ensure backend is running on the appropriate port

3. **Start development**:
   ```bash
   npm run dev
   ```

## 🎯 User Flow

1. **Welcome**: User sees welcome page
2. **Login**: Click "Sign in with GitHub"
3. **OAuth**: GitHub authentication flow
4. **Dashboard**: View profile and repositories
5. **Edit Profile**: Modify personal information and social links
6. **Navigation**: Seamless page transitions

## 🚫 Anti-Pattern Prevention

- **No Infinite Loops**: `hasCheckedAuth` prevents repeated API calls
- **Error Handling**: Proper 401/unauthorized handling
- **Loading States**: Clear loading indicators
- **State Management**: Centralized authentication state

## 📱 Responsive Design

- **Desktop**: Full layout with navigation and repository grid
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Stacked view optimized for small screens

## 🔒 Security

- **Credentials**: All API calls include session cookies
- **CORS**: Configured for backend domain
- **HTTPS**: Ready for production with HTTPS
- **OAuth**: Secure GitHub authentication flow
