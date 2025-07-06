# Technical Context - Pedagogical Lego

## Technology Stack

### Frontend Framework
- **React 18.2.0**: Modern React with concurrent features
- **TypeScript 4.9.3**: Type safety and developer experience
- **Vite 4.2.0**: Fast build tool and development server

### UI and Styling
- **CSS Modules**: Scoped styling with component isolation
- **Combini Framework**: Custom component library
- **Lucide React**: Icon library for consistent iconography
- **RTL Support**: Hebrew right-to-left layout support

### Routing and Navigation
- **React Router DOM 6.8.0**: Client-side routing
- **Browser Router**: HTML5 history API integration

### State Management
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **Custom Hooks**: Business logic encapsulation
- **Context API**: Global state sharing (planned)

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Vite Plugin React**: React-specific Vite integration

## Architecture Decisions

### 1. Component-Based Architecture
**Decision**: Use React functional components with hooks
**Rationale**: 
- Modern React patterns
- Better performance with hooks
- Easier testing and maintenance
- TypeScript integration

### 2. CSS Modules
**Decision**: Use CSS Modules instead of styled-components or CSS-in-JS
**Rationale**:
- Better performance (no runtime CSS generation)
- Simpler debugging
- Native CSS support
- RTL compatibility

### 3. Vite Build System
**Decision**: Use Vite instead of Create React App or Webpack
**Rationale**:
- Faster development server
- Better hot module replacement
- Modern ES modules approach
- Smaller bundle sizes

### 4. TypeScript
**Decision**: Use TypeScript for type safety
**Rationale**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Refactoring safety

## Development Environment

### Required Tools
- **Node.js**: Version 16+ for Vite compatibility
- **npm**: Package manager
- **Git**: Version control
- **VS Code**: Recommended IDE with TypeScript support

### Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure
```
pedagogical-lego/
├── src/
│   ├── main.tsx          # React entry point
│   └── App.tsx           # Main application component
├── components/           # Reusable UI components
├── pages/               # Page components
├── helpers/             # Business logic and hooks
├── global.css           # Global styles
├── CombiniSetup.css     # Combini framework setup
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Performance Considerations

### 1. Bundle Size Optimization
- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compress images and fonts
- **Dependency Analysis**: Monitor bundle size

### 2. Runtime Performance
- **Component Memoization**: React.memo for expensive components
- **Hook Optimization**: useMemo and useCallback for expensive operations
- **Virtual Scrolling**: For large lists (future)
- **Debouncing**: For search and input operations

### 3. Loading Performance
- **Lazy Loading**: Load components on demand
- **Preloading**: Critical resources
- **Caching**: Browser and service worker caching
- **CDN**: Static asset delivery

## Security Considerations

### 1. Frontend Security
- **Input Validation**: Client-side validation
- **XSS Prevention**: Proper content encoding
- **CSP**: Content Security Policy headers
- **HTTPS**: Secure communication

### 2. Data Protection
- **Local Storage**: Secure data storage
- **Session Management**: Proper session handling
- **Privacy Compliance**: GDPR and local regulations
- **Data Encryption**: Sensitive data protection

## Browser Support

### Target Browsers
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### Polyfills
- **Core-js**: Modern JavaScript features
- **Regenerator Runtime**: Async/await support
- **Fetch API**: Network requests

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper element usage
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Management**: Visible focus indicators

### RTL Support
- **CSS Direction**: Right-to-left layout
- **Text Alignment**: Proper text direction
- **Component Logic**: RTL-aware components
- **Icon Direction**: Flipped icons for RTL

## Testing Strategy

### Unit Testing
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **TypeScript**: Type checking in tests
- **Coverage**: Minimum 80% code coverage

### Integration Testing
- **User Interactions**: Component integration
- **State Management**: Hook testing
- **API Integration**: Mock service testing
- **Error Handling**: Error boundary testing

### E2E Testing
- **Playwright**: Cross-browser testing
- **User Journeys**: Complete workflow testing
- **Performance**: Load time testing
- **Accessibility**: Automated accessibility testing

## Deployment Strategy

### Development
- **Local Development**: Vite dev server
- **Hot Reload**: Instant feedback
- **Environment Variables**: Local configuration
- **Debug Tools**: React DevTools

### Staging
- **Build Process**: Production-like builds
- **Environment Testing**: Staging environment
- **Performance Testing**: Load testing
- **User Acceptance**: Stakeholder testing

### Production
- **Static Hosting**: CDN deployment
- **Build Optimization**: Minified bundles
- **Monitoring**: Error tracking and analytics
- **Backup Strategy**: Data backup and recovery

## Future Technical Considerations

### Scalability
- **Micro-frontends**: Component federation
- **Service Workers**: Offline functionality
- **PWA**: Progressive web app features
- **SSR**: Server-side rendering

### Integration
- **LMS APIs**: Learning management system integration
- **Authentication**: SSO and OAuth
- **Analytics**: User behavior tracking
- **Notifications**: Real-time updates

Last Updated: 2024-01-XX 