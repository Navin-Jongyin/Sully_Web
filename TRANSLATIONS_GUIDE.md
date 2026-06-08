# Translation Guide

This guide explains how to add translations for Thai and English to your Sully Academy website.

## How It Works

The translation system uses:
- **LanguageContext**: Manages the current language state (en/th)
- **Translations Dictionary**: Contains all translation strings in `src/translations/translations.ts`
- **useTranslation Hook**: Provides easy access to translations in any component
- **LanguageToggle Component**: A button in the header to switch between languages

## Adding Translations to a New Page

### Step 1: Add Translation Keys

Open `src/translations/translations.ts` and add your translation keys to both the `en` and `th` objects.

Example:
```typescript
export const translations: Record<Language, Translations> = {
  en: {
    // ... existing translations
    courses: {
      title: 'Our Courses',
      description: 'Browse our available courses',
    },
  },
  th: {
    // ... existing translations
    courses: {
      title: 'หลักสูตรของเรา',
      description: 'เรียกดูหลักสูตรที่มีให้',
    },
  },
};
```

### Step 2: Update the Translations Interface

Make sure to add the new section to the `Translations` interface:

```typescript
export interface Translations {
  // ... existing interfaces
  courses: {
    title: string;
    description: string;
  };
}
```

### Step 3: Use Translations in Your Component

Import and use the `useTranslation` hook in your component:

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t.courses.title}</h1>
      <p>{t.courses.description}</p>
    </div>
  );
};
```

## Handling Content That's Already in Thai

If your basic content is already in Thai, you have two options:

### Option 1: Use Thai as the Base (Recommended)
Set Thai as the default language and add English translations:

```typescript
// In LanguageContext.tsx
const [language, setLanguageState] = useState<Language>(() => {
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'th') return saved;
  return 'th'; // Default to Thai
});
```

### Option 2: Keep English as Base, Use Thai for Specific Content
If some content should always be in Thai regardless of language selection, you can conditionally render:

```typescript
const { language } = useTranslation();

<div>
  {language === 'th' ? (
    <p>ข้อความภาษาไทยเสมอ</p>
  ) : (
    <p>English text that can be translated</p>
  )}
</div>
```

## Adding New Languages

To add a new language (e.g., Chinese):

1. Update the `Language` type in `src/translations/translations.ts`:
```typescript
export type Language = 'en' | 'th' | 'zh';
```

2. Add translations for the new language:
```typescript
export const translations: Record<Language, Translations> = {
  // ... existing
  zh: {
    common: {
      home: '首页',
      // ... add all other translations
    },
    // ... add all other sections
  },
};
```

3. Update the `LanguageToggle` component to include the new language option.

## Best Practices

1. **Organize translations by page/section**: Group related translations together (e.g., `home`, `courses`, `common`)
2. **Use descriptive keys**: Use clear, descriptive keys like `heroTitle` instead of `title1`
3. **Keep translations in sync**: When adding a new key, add it to both languages immediately
4. **Test both languages**: Always test your changes in both English and Thai
5. **Use localStorage**: The language preference is automatically saved to localStorage and persists across sessions

## File Structure

```
src/
├── translations/
│   └── translations.ts          # Translation dictionaries
├── context/
│   └── LanguageContext.tsx      # Language state management
├── hooks/
│   └── useTranslation.ts        # Translation hook
└── components/
    └── LanguageToggle.tsx       # Language switcher button
```

## Example: Adding Translations to Courses Page

1. Add to `translations.ts`:
```typescript
courses: {
  title: string;
  description: string;
  viewAll: string;
}
```

2. Add translations:
```typescript
en: {
  courses: {
    title: 'Our Courses',
    description: 'Explore our comprehensive aviation courses',
    viewAll: 'View All Courses',
  },
},
th: {
  courses: {
    title: 'หลักสูตรของเรา',
    description: 'สำรวจหลักสูตรการบินที่ครอบคลุมของเรา',
    viewAll: 'ดูหลักสูตรทั้งหมด',
  },
},
```

3. Use in component:
```typescript
const { t } = useTranslation();
return <h1>{t.courses.title}</h1>;
```

That's it! The translation system will automatically handle switching between languages.
