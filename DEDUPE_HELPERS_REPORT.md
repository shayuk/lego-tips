# Deduplication of Scholarly Helpers - Refactoring Report

## Summary
Successfully deduplicated `materialQuality` and `scholarlySearch` logic by creating shared modules accessible to both Firebase Functions and Express server.

## Files Created

### Shared Modules (TypeScript Source)
- `shared/materialQuality.ts` - Material quality assessment logic
  - Exports: `assessMaterialQuality()`, `validateAssignmentSpecificity()`, `extractKeywords()`, `MaterialQualityReport` interface
- `shared/scholarlySearch.ts` - Scholarly source search via OpenAlex API
  - Exports: `searchScholarlySources()`, `formatAPA7References()`, `ScholarlySource` interface
- `shared/tsconfig.json` - TypeScript config for compiling shared modules to CommonJS

### Compiled Output (for server.js)
- `shared/lib/materialQuality.js` - CommonJS compiled version
- `shared/lib/materialQuality.d.ts` - TypeScript declarations
- `shared/lib/scholarlySearch.js` - CommonJS compiled version
- `shared/lib/scholarlySearch.d.ts` - TypeScript declarations

## Files Modified

### Firebase Functions
- `functions/src/index.ts`
  - **Removed**: Duplicated `assessMaterialQuality()`, `searchScholarlySources()`, `formatAPA7References()`, `validateAssignmentSpecificity()`, `extractKeywords()` functions
  - **Removed**: Duplicated `ScholarlySource` and `MaterialQualityReport` interface definitions
  - **Added**: Imports from `../../shared/materialQuality` and `../../shared/scholarlySearch`
  - **Removed**: Unused `qualityReason` variable

- `functions/tsconfig.json`
  - **Added**: `../shared/**/*.ts` to include patterns
  - **Removed**: `rootDir` setting to allow importing from parent directory

### Express Server
- `server/server.js`
  - **Removed**: Simplified inline material quality assessment (lines 189-197)
  - **Removed**: Inline scholarly search logic (lines 199-245)
  - **Removed**: Inline APA7 formatting (lines 416-430)
  - **Added**: Requires from `../shared/lib/materialQuality` and `../shared/lib/scholarlySearch`
  - **Updated**: Now uses full `assessMaterialQuality()` function instead of simplified version
  - **Updated**: Now uses full `searchScholarlySources()` function instead of inline implementation

### Root
- `package.json`
  - **Added**: `build:shared` script to compile shared modules to CommonJS

## How Functions Imports Shared

Firebase Functions imports shared modules directly from TypeScript source:

```typescript
import { assessMaterialQuality, validateAssignmentSpecificity, MaterialQualityReport } from "../../shared/materialQuality";
import { searchScholarlySources, formatAPA7References, ScholarlySource } from "../../shared/scholarlySearch";
```

The functions TypeScript compiler includes `../shared/**/*.ts` in its compilation, so shared modules are compiled as part of the functions build process.

## How Server Imports Shared

Express server (CommonJS) imports compiled JavaScript from `shared/lib/`:

```javascript
const { assessMaterialQuality } = require('../shared/lib/materialQuality');
const { searchScholarlySources, formatAPA7References } = require('../shared/lib/scholarlySearch');
```

The shared modules are compiled to CommonJS format using:
```bash
npm run build:shared
# or
npx tsc --project shared/tsconfig.json
```

## Build Process

### Functions Build
```bash
cd functions
npm run build
```
- Compiles `functions/src/index.ts` and `shared/**/*.ts` to `functions/lib/`
- Shared modules are included in the functions deployment bundle

### Shared Modules Build (for server)
```bash
npm run build:shared
```
- Compiles `shared/*.ts` to `shared/lib/*.js` (CommonJS format)
- Required before running `server/server.js`

### Root Build
```bash
npm run build
```
- Compiles frontend TypeScript and builds Vite bundle
- Unaffected by shared module changes

## Commands Run and Outcomes

### Build Verification
1. **Functions build**: ✅ PASSED
   ```bash
   npm --prefix functions run build
   ```
   - No TypeScript errors
   - All imports resolved correctly

2. **Root build**: ✅ PASSED
   ```bash
   npm run build
   ```
   - Frontend build successful
   - No impact from shared module changes

3. **Linter check**: ✅ PASSED
   - No linting errors in modified files

## Deployment Implications

### Firebase Functions Deployment
- **No changes required** - Shared modules are compiled as part of functions build
- Functions deployment includes shared module code in the bundle
- No runtime dependencies on external shared files

### Express Server Deployment
- **Action required**: Run `npm run build:shared` before deploying server
- Server requires `shared/lib/*.js` files to be present
- Consider adding `build:shared` to server deployment pipeline

### CI/CD Considerations
1. **Functions CI**: No changes needed - shared modules compile automatically
2. **Server CI**: Add `npm run build:shared` step before starting server
3. **Root CI**: No changes needed

## Notes

### Frontend Helpers
- `src/helpers/materialQuality.ts` and `src/helpers/scholarlySearch.ts` are **not imported anywhere**
- These can be safely deleted in a future cleanup (not done in this refactor to minimize scope)

### Code Quality Improvements
- Single source of truth for material quality assessment logic
- Single source of truth for scholarly search logic
- Consistent behavior between Firebase Functions and Express server
- Server now uses full-featured assessment instead of simplified version

### Compatibility
- Shared modules use only Node-compatible APIs (fetch, no browser APIs)
- No new external dependencies added
- Compatible with Node 18+ (fetch API available)

## Branch and Commit

- **Branch**: `refactor/dedupe-scholarly-helpers`
- **Commit**: `699887f471edace75526137d5da306da7c5a0272`
- **Commit Message**: "Refactor: dedupe scholarly fallback helpers via shared modules"

## Next Steps

1. ✅ Create PR against main branch
2. ⏳ Review and merge PR
3. ⏳ Update server deployment pipeline to include `build:shared` step
4. ⏳ (Optional) Delete unused `src/helpers/materialQuality.ts` and `src/helpers/scholarlySearch.ts` in future cleanup

## Testing Recommendations

Before merging:
1. Test Firebase Functions deployment locally
2. Test Express server with compiled shared modules
3. Verify material quality assessment works in both environments
4. Verify scholarly search works in both environments
5. Test assignment generation end-to-end in both Firebase Functions and Express server

