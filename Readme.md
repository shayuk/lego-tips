# Pedagogical Lego - פלטפורמת הערכה חלופית

## Vision Statement
**Revolutionizing Academic Assessment Through Intuitive Building Blocks**

Pedagogical Lego is an innovative platform that transforms how educators create alternative assessments. By adopting a "Lego-like" building approach, we enable professors to construct customized evaluation tools through visual, drag-and-drop interactions.

## Core Concept

### The Lego Model
- **Building Blocks**: Each assessment component (questions, rubrics, instructions) is a "Lego piece"
- **Visual Assembly**: Educators drag and connect components on a canvas
- **Intuitive Design**: No technical expertise required - pure visual thinking

### The Final Product
- **Custom Assessment**: Tailored assignment with detailed instructions
- **Comprehensive Rubric**: Detailed evaluation criteria with scoring levels
- **Implementation Guide**: Step-by-step instructions for execution

## Value Proposition

### For Educators
- **Reduced Workload**: Streamlined assessment creation process
- **AI Resistance**: Assessments designed to minimize AI-assisted cheating
- **Personalization**: Tailored evaluations for specific course contexts
- **Learning Enhancement**: Improved student engagement and knowledge retention
- **Objectivity**: Standardized evaluation criteria ensuring fairness
- **Pedagogical Knowledge**: Access to best practices embedded in components

### For Institutions
- **Innovation Leadership**: Positioning at the forefront of pedagogical innovation
- **Quality Assurance**: Standardized assessment quality across departments
- **Resource Efficiency**: Reduced time investment in assessment design
- **Student Success**: Better learning outcomes through improved assessments

## Technology Stack

- **Frontend**: React 18.2.0 with TypeScript 4.9.3
- **Build System**: Vite 4.2.0
- **Styling**: CSS Modules with RTL support
- **Routing**: React Router DOM 6.8.0
- **Icons**: Lucide React
- **Component Library**: Custom Combini Framework

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm package manager

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd pedagogical-lego

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Project Structure

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

## Features

### Assessment Builder
- **Guided Mode**: Step-by-step assessment creation process
- **Visual Mode**: Drag-and-drop component assembly
- **Component Library**: Pre-built assessment elements
- **Real-time Preview**: Live preview of assessment structure

### Assessment Management
- **Save & Load**: Persist assessments locally
- **Edit & Update**: Modify existing assessments
- **Organization**: Categorize and search assessments
- **Export**: Generate assessment documents

### Method Explorer
- **Browse Methods**: Discover alternative assessment methods
- **Filter & Search**: Find methods by category and criteria
- **Detailed Information**: Implementation guidelines and examples
- **Compatibility Calculator**: Find methods suitable for your course

## Development

### Architecture
The application follows a component-based architecture with:
- **Presentation Layer**: Pages and UI components
- **Business Logic Layer**: Custom hooks and utilities
- **Data Layer**: Types, schemas, and mock data

### Key Patterns
- **Component Composition**: Build complex UIs from simple components
- **Custom Hooks**: Encapsulate business logic and state management
- **Context Providers**: Share state across component trees
- **Builder Pattern**: Construct assessments step by step

### State Management
- **Local State**: Component-specific state with useState
- **Custom Hooks**: Business logic encapsulation
- **Context API**: Global state sharing (planned)

## Contributing

### Development Workflow
1. Create a feature branch from main
2. Make your changes following the coding standards
3. Add tests for new functionality
4. Submit a pull request with detailed description

### Coding Standards
- Use TypeScript for type safety
- Follow React functional component patterns
- Use CSS Modules for styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Testing
- Unit tests for components and hooks
- Integration tests for user workflows
- E2E tests for critical paths
- Accessibility testing for WCAG compliance

## Deployment

### Development
```bash
npm run dev
```
Access the application at `http://localhost:3000`

### Production
```bash
npm run build
npm run preview
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
VITE_API_URL=your-api-url
VITE_APP_TITLE=Pedagogical Lego
```

## Support

### Documentation
- [Component Library](./components/README.md)
- [API Documentation](./docs/api.md)
- [User Guide](./docs/user-guide.md)

### Issues
Report bugs and feature requests through the project's issue tracker.

### Community
Join our community discussions and share your feedback.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [CSS Modules](https://github.com/css-modules/css-modules)
- Icons from [Lucide](https://lucide.dev/)
- Build tool [Vite](https://vitejs.dev/)

---

**Pedagogical Lego** - Building better assessments, one block at a time.
