# Gemini Prompt Usage - Quick Reference

## 📚 **What Was Created**

### 1. **Prompt Templates Library**
**File**: `src/lib/prompts/gemini-prompts.ts`

Centralized, reusable prompt templates for all frameworks:
- ✅ B2C Elements (30 elements, 4 categories)
- ✅ B2B Elements (40 elements, 5 categories)
- ✅ CliftonStrengths (34 themes, 4 domains)
- ✅ Golden Circle (4 elements: Why/How/What/WHO)
- ✅ Content Comparison (generic)

### 2. **Documentation**
**File**: `docs/GEMINI_PROMPT_TEMPLATES.md`

Complete reference guide with:
- Framework definitions
- Token optimization guidelines
- Output format specifications
- Best practices

---

## 🚀 **How To Use**

### Import Templates
```typescript
import { PROMPT_TEMPLATES } from '@/lib/prompts/gemini-prompts';
import { buildFrameworkPrompt } from '@/lib/prompts/gemini-prompts';

// Access any template
const b2cTemplate = PROMPT_TEMPLATES.b2c;
const goldenCircle = PROMPT_TEMPLATES.goldenCircle;
```

### Use in API Routes
```typescript
import { buildFrameworkPrompt } from '@/lib/prompts/gemini-prompts';
import { analyzeWithGemini } from '@/lib/free-ai-analysis';

// Build prompt using template
const prompt = buildFrameworkPrompt('b2c', existing, proposed, url);

// Analyze with Gemini
const result = await analyzeWithGemini(prompt, 'b2c-elements');
```

---

## ✅ **Benefits**

1. **Consistency** - All frameworks use same prompt structure
2. **Maintainability** - Change once, apply everywhere
3. **Gemini-Optimized** - Designed for Gemini API parameters
4. **Token-Efficient** - Optimized for Gemini's token limits
5. **Documentation** - Clear reference for all frameworks

---

## 📊 **Current Status**

- ✅ All framework APIs use clear, Gemini-optimized prompts
- ✅ Prompts fit within Gemini's parameters
- ✅ Consistent structure across all frameworks
- ✅ Documentation complete
- ✅ Ready for production use
