# Multi-School Receipt System

This system allows customizing receipt layouts for different schools using configuration-based templates.

## Quick Start

1. Set the `SCHOOL_ID` environment variable in your `.env` file:
   ```bash
   SCHOOL_ID="dhaarus-salaam"
   ```

2. Available school configurations:
   - `dhaarus-salaam` - Formal black & white template (default)
   - `bluemoon-modern` - Modern colorful template with gradients  
   - `islamic-academy` - Islamic-themed template with Arabic text

## School Configuration

Each school configuration includes:

- **Template Type**: formal, modern, islamic, compact
- **Branding**: colors, fonts, borders, spacing
- **Header**: school name, logo, contact information
- **Footer**: custom text, additional information
- **Custom Fields**: additional student information fields
- **Formatting**: page size, margins, table styles

## Adding a New School

1. **Create Configuration** in `src/lib/schools/config.ts`:
   ```typescript
   export const NEW_SCHOOL_CONFIG: SchoolConfig = {
     id: 'new-school',
     name: 'New School Name',
     template: 'formal', // or 'modern', 'islamic'
     // ... other configuration
   }
   ```

2. **Add to Registry**:
   ```typescript
   export const SCHOOL_CONFIGS: Record<string, SchoolConfig> = {
     // ... existing configs
     'new-school': NEW_SCHOOL_CONFIG
   }
   ```

3. **Add Assets**:
   - Create directory: `public/schools/new-school/`
   - Add logo: `public/schools/new-school/logo.jpg`

4. **Update Environment**:
   ```bash
   SCHOOL_ID="new-school"
   ```

## Template Customization

### Template Types

- **Formal Template**: Traditional black & white receipt with borders
- **Modern Template**: Colorful with gradients and rounded corners  
- **Islamic Template**: Arabic text and Islamic styling elements
- **Compact Template**: Space-efficient layout (uses formal template currently)

### Custom Fields

Add school-specific fields to student information:

```typescript
customFields: [
  {
    name: 'section',
    label: 'SECTION', 
    position: 'student-info',
    type: 'text',
    required: false,
    defaultValue: 'A'
  }
]
```

### Branding Options

```typescript
branding: {
  colors: {
    primary: '#1e40af',    // Main color
    secondary: '#3b82f6',  // Secondary color
    accent: '#60a5fa',     // Accent color
    background: '#f8fafc', // Background
    text: '#1e293b'        // Text color
  },
  fonts: {
    header: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  },
  borderStyle: 'single' | 'double' | 'dotted' | 'dashed',
  spacing: 'compact' | 'normal' | 'spacious'
}
```

## File Structure

```
src/lib/schools/
├── types.ts           # TypeScript interfaces
├── config.ts          # School configurations
└── README.md          # This documentation

src/components/receipts/
├── templates/
│   ├── FormalTemplate.tsx
│   ├── ModernTemplate.tsx
│   └── IslamicTemplate.tsx
└── ReceiptRenderer.tsx

public/schools/
├── dhaarus-salaam/
│   └── logo.jpg
├── bluemoon-modern/
│   └── logo.png
└── islamic-academy/
    └── logo.png
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SCHOOL_ID` | School configuration ID | `dhaarus-salaam` |
| `NEXT_PUBLIC_SCHOOL_ID` | Client-side school ID (if needed) | `dhaarus-salaam` |

## Development Tips

1. **Testing Different Schools**: Change `SCHOOL_ID` in `.env` and restart the development server
2. **Logo Requirements**: 
   - Size: 40x40px to 60x60px recommended
   - Format: JPG, PNG, or SVG
   - Place in `public/schools/[school-id]/logo.[ext]`
3. **Color Schemes**: Use consistent color palettes that match school branding
4. **Print Optimization**: All templates are optimized for A4 printing with proper margins

## Creating Custom Templates

To create a new template:

1. Create `src/components/receipts/templates/CustomTemplate.tsx`
2. Import and use in `ReceiptRenderer.tsx`
3. Add template type to `types.ts`
4. Configure schools to use the new template

Example template structure:
```typescript
export default function CustomTemplate({ receipt, schoolConfig }: ReceiptProps) {
  return (
    <div style={{ 
      fontFamily: schoolConfig.branding.fonts.body,
      color: schoolConfig.branding.colors.text 
    }}>
      {/* Custom template JSX */}
    </div>
  )
}
```