# Solution: Input Component Performance

## Problem Overview
The input component experiences lag during typing, especially in long conversations. The main issues are:
- Auto-resize hook triggering on every keystroke
- DOM measurements causing layout recalculations
- Real-time command processing
- No debouncing for updates

---

## Solution 1: Optimize Auto-Resize Hook

### Step 1: Debounce Height Calculations
**File:** `components/features/spaces/input/input-content-box.tsx` (Lines 54-79)

**Action:** Add debouncing to reduce layout recalculations.

**Before:**
```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, [value]); // Runs on every keystroke!
```

**After:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const updateHeight = useDebouncedCallback(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, 100); // 100ms debounce

useEffect(() => {
  updateHeight();
}, [value, updateHeight]);
```

**Install dependency:**
```bash
npm install use-debounce
```

**Expected Result:** Height calculations happen 100ms after user stops typing, not on every keystroke.

---

### Step 2: Use requestAnimationFrame for Resize
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Schedule resize during next animation frame for smoother updates.

```typescript
useEffect(() => {
  let rafId: number;

  const updateHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Schedule update for next frame
  rafId = requestAnimationFrame(updateHeight);

  return () => {
    cancelAnimationFrame(rafId);
  };
}, [value]);
```

**Expected Result:** Resize happens during browser's paint cycle, reducing jank.

---

### Step 3: Create Optimized Auto-Resize Hook
**File:** `hooks/useAutoResize.ts` (Create new file)

**Action:** Create a reusable, optimized auto-resize hook.

```typescript
import { useEffect, useRef } from 'react';

interface UseAutoResizeOptions {
  minHeight?: number;
  maxHeight?: number;
  debounceMs?: number;
}

export function useAutoResize<T extends HTMLTextAreaElement>(
  value: string,
  options: UseAutoResizeOptions = {}
) {
  const {
    minHeight = 40,
    maxHeight = 400,
    debounceMs = 0,
  } = options;

  const ref = useRef<T>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resize = () => {
      if (!ref.current) return;

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        if (!ref.current) return;

        // Reset height to get accurate scrollHeight
        ref.current.style.height = `${minHeight}px`;

        // Calculate new height
        const scrollHeight = ref.current.scrollHeight;
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

        // Apply new height
        ref.current.style.height = `${newHeight}px`;

        // Enable/disable scrolling based on max height
        ref.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      });
    };

    // Debounce if specified
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(resize, debounceMs);
    } else {
      resize();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, minHeight, maxHeight, debounceMs]);

  return ref;
}
```

**Usage:**
```typescript
export function InputContentBox() {
  const [value, setValue] = useState('');
  
  const textareaRef = useAutoResize<HTMLTextAreaElement>(value, {
    minHeight: 40,
    maxHeight: 400,
    debounceMs: 100,
  });

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Expected Result:** Optimized auto-resize with configurable debouncing and height limits.

---

## Solution 2: Optimize Command Processing

### Step 1: Debounce Command Detection
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Only check for commands after user pauses typing.

**Before:**
```typescript
useEffect(() => {
  // Check for commands on every input change
  const commandMatch = value.match(/^\/(\w+)/);
  if (commandMatch) {
    setActiveCommand(commandMatch[1]);
  }
}, [value]); // Runs on every keystroke!
```

**After:**
```typescript
import { useDebouncedValue } from 'use-debounce';

export function InputContentBox() {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebouncedValue(value, 200);

  useEffect(() => {
    // Only check commands on debounced value
    const commandMatch = debouncedValue.match(/^\/(\w+)/);
    if (commandMatch) {
      setActiveCommand(commandMatch[1]);
    } else {
      setActiveCommand(null);
    }
  }, [debouncedValue]); // Runs 200ms after typing stops

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Expected Result:** Command detection happens 200ms after user stops typing.

---

### Step 2: Optimize Regex Matching
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Use more efficient regex patterns and early returns.

**Before:**
```typescript
const commandMatch = value.match(/^\/(\w+)/);
const mentionMatch = value.match(/@(\w+)/g);
const hashtagMatch = value.match(/#(\w+)/g);
```

**After:**
```typescript
// Early return if no special characters
if (!value.includes('/') && !value.includes('@') && !value.includes('#')) {
  return;
}

// Only check relevant patterns
const commandMatch = value.startsWith('/') ? value.match(/^\/(\w+)/) : null;
const mentionMatch = value.includes('@') ? value.match(/@(\w+)/g) : null;
const hashtagMatch = value.includes('#') ? value.match(/#(\w+)/g) : null;
```

**Expected Result:** Faster pattern matching with early exits.

---

### Step 3: Memoize Command Suggestions
**File:** `components/features/spaces/input/command-suggestions.tsx`

**Action:** Cache command suggestions to avoid recalculation.

```typescript
import { useMemo } from 'react';

const AVAILABLE_COMMANDS = [
  { name: 'help', description: 'Show help' },
  { name: 'clear', description: 'Clear conversation' },
  { name: 'export', description: 'Export conversation' },
  // ... more commands
];

export function CommandSuggestions({ query }: { query: string }) {
  const suggestions = useMemo(() => {
    if (!query) return AVAILABLE_COMMANDS;

    const lowerQuery = query.toLowerCase();
    return AVAILABLE_COMMANDS.filter(cmd =>
      cmd.name.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  return (
    <div className="suggestions">
      {suggestions.map(cmd => (
        <div key={cmd.name}>{cmd.name}</div>
      ))}
    </div>
  );
}
```

**Expected Result:** Command suggestions only recalculated when query changes.

---

## Solution 3: Optimize Input State Management

### Step 1: Use Uncontrolled Input for Better Performance
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Switch to uncontrolled input for faster typing.

**Before (Controlled):**
```typescript
export function InputContentBox() {
  const [value, setValue] = useState('');

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**After (Uncontrolled with ref):**
```typescript
export function InputContentBox() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const value = textareaRef.current?.value || '';
    // Process value
    onSubmit(value);
    
    // Clear input
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  };

  return (
    <textarea
      ref={textareaRef}
      defaultValue=""
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      }}
    />
  );
}
```

**Expected Result:** No React re-renders on every keystroke, much faster typing.

---

### Step 2: Debounce State Updates
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** If controlled input is necessary, debounce state updates.

```typescript
export function InputContentBox() {
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');

  const debouncedSetValue = useDebouncedCallback((newValue: string) => {
    setValue(newValue);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue); // Immediate update for display
    debouncedSetValue(newValue); // Debounced update for state
  };

  return (
    <textarea
      value={displayValue}
      onChange={handleChange}
    />
  );
}
```

**Expected Result:** Immediate visual feedback, debounced state updates.

---

### Step 3: Optimize Character Count Display
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Debounce character count updates.

**Before:**
```typescript
<div className="character-count">
  {value.length} / 4000
</div>
```

**After:**
```typescript
const [debouncedValue] = useDebouncedValue(value, 500);

<div className="character-count">
  {debouncedValue.length} / 4000
</div>
```

**Expected Result:** Character count updates every 500ms instead of every keystroke.

---

## Solution 4: Reduce Input Component Re-renders

### Step 1: Memoize Input Component
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Wrap component in React.memo.

```typescript
export const InputContentBox = memo(({ onSubmit, placeholder }: InputProps) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.onSubmit === nextProps.onSubmit &&
    prevProps.placeholder === nextProps.placeholder
  );
});
```

**Expected Result:** Component only re-renders when props actually change.

---

### Step 2: Isolate Input from Parent Re-renders
**File:** `app/(core)/ChatClient.tsx`

**Action:** Prevent parent re-renders from affecting input.

```typescript
// Create a separate component for input
const MemoizedInput = memo(InputContentBox);

export function ChatClient() {
  const [messages, setMessages] = useState([]);
  
  // Input won't re-render when messages change
  return (
    <>
      <Messages messages={messages} />
      <MemoizedInput onSubmit={handleSubmit} />
    </>
  );
}
```

**Expected Result:** Input remains responsive even when messages update.

---

### Step 3: Use useCallback for Event Handlers
**File:** `components/features/spaces/input/input-content-box.tsx`

**Action:** Memoize event handlers to prevent re-renders.

```typescript
export function InputContentBox({ onSubmit }: InputProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <textarea
      onKeyDown={handleKeyDown}
      onChange={handleChange}
    />
  );
}
```

**Expected Result:** Event handlers don't cause re-renders.

---

## Verification Steps

### Step 1: Measure Input Lag Before
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Type quickly in the input (20-30 characters)
4. Stop recording
5. Check "Input Latency" metric
6. **Before:** Likely 50-200ms per keystroke

### Step 2: Apply Optimizations
Implement solutions in this order:
1. Debounce auto-resize
2. Optimize command processing
3. Switch to uncontrolled input (if possible)
4. Memoize component

### Step 3: Measure Input Lag After
1. Repeat performance recording
2. Type quickly in the input
3. Check "Input Latency" metric
4. **After:** Should be < 16ms per keystroke (60fps)

### Step 4: Test with Long Conversations
1. Create conversation with 50+ messages
2. Test typing responsiveness
3. **Expected:** No noticeable lag

### Step 5: Automated Performance Test
```typescript
// test/input-performance.test.ts
describe('Input Performance', () => {
  it('should handle rapid typing without lag', async () => {
    const { getByRole } = render(<InputContentBox />);
    const input = getByRole('textbox');

    const startTime = performance.now();
    
    // Simulate rapid typing
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: 'a'.repeat(i) } });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in < 100ms
    expect(duration).toBeLessThan(100);
  });
});
```

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Input lag (30+ messages) | 100-300ms | 10-20ms | 85-95% |
| Keystrokes per second | 5-10 | 30-50 | 400% |
| Re-renders per keystroke | 3-5 | 0-1 | 80-100% |
| Auto-resize calculations | Every keystroke | Every 100ms | 90% |
| Command detection | Every keystroke | Every 200ms | 95% |

---

## Rollback Plan

1. **Feature flags:**
   ```typescript
   const USE_DEBOUNCED_INPUT = process.env.NEXT_PUBLIC_DEBOUNCED_INPUT === 'true';
   const USE_UNCONTROLLED_INPUT = process.env.NEXT_PUBLIC_UNCONTROLLED_INPUT === 'true';
   ```

2. **Gradual rollout:**
   - Deploy debouncing first
   - Monitor for 24 hours
   - Deploy uncontrolled input
   - Monitor for 48 hours

3. **Quick revert:**
   ```bash
   git revert <commit-hash>
   ```

---

## Additional Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react)
- [Controlled vs Uncontrolled Components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
