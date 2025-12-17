# Quick Reference Guide - Performance Solutions

This is a condensed reference for quickly finding solutions to specific performance issues.

---

## 🔍 Symptom-Based Troubleshooting

### "Typing feels laggy in the input box"
**→ Solution:** [05-input-performance](./05-input-performance/solution.md)
- Debounce auto-resize hook
- Use uncontrolled input
- Optimize command processing

**Quick Fix:**
```typescript
// Debounce the auto-resize
const updateHeight = useDebouncedCallback(() => {
  // resize logic
}, 100);
```

---

### "UI freezes when AI is responding"
**→ Solution:** [06-web-workers](./06-web-workers/solution.md)
- Move markdown processing to Web Worker
- Offload syntax highlighting
- Use worker pool

**Quick Fix:**
```typescript
// Process markdown in worker
const { postMessage } = useWorker('/workers/markdown.worker.js');
const result = await postMessage('parse', content);
```

---

### "Scrolling is janky with many messages"
**→ Solution:** [04-virtual-scrolling](./04-virtual-scrolling/solution.md)
- Implement react-window
- Only render visible messages

**Quick Fix:**
```bash
npm install react-window react-virtualized-auto-sizer
```

---

### "App slows down after 20+ messages"
**→ Solutions:** Multiple
1. [01-react-rerenders](./01-react-rerenders/solution.md) - Reduce re-renders
2. [03-memory-leaks](./03-memory-leaks/solution.md) - Fix cleanup
3. [04-virtual-scrolling](./04-virtual-scrolling/solution.md) - Reduce DOM

**Quick Fix:**
```typescript
// Memoize message components
export const Message = React.memo(MessageComponent, (prev, next) => {
  return prev.message.id === next.message.id;
});
```

---

### "localStorage errors or quota exceeded"
**→ Solution:** [02-localstorage-performance](./02-localstorage-performance/solution.md)
- Migrate to IndexedDB
- Implement compression
- Debounce writes

**Quick Fix:**
```typescript
// Debounce localStorage writes
const [spaces, setSpaces] = useDebouncedLocalStorage('spaces', [], 1000);
```

---

### "Memory usage keeps growing"
**→ Solution:** [03-memory-leaks](./03-memory-leaks/solution.md)
- Fix interval cleanup
- Fix event listener cleanup
- Use AbortController

**Quick Fix:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  return () => clearInterval(interval); // Always cleanup!
}, []);
```

---

## 🎯 Priority-Based Quick Start

### 🔴 Critical (Do First)
1. **Fix Memory Leaks** - [03-memory-leaks](./03-memory-leaks/solution.md)
   - Time: 1 day
   - Impact: Prevents crashes
   
2. **Optimize Input** - [05-input-performance](./05-input-performance/solution.md)
   - Time: 1 day
   - Impact: Immediate user experience improvement

### 🟡 Important (Do Second)
3. **Reduce Re-renders** - [01-react-rerenders](./01-react-rerenders/solution.md)
   - Time: 2 days
   - Impact: Overall performance boost

4. **Fix LocalStorage** - [02-localstorage-performance](./02-localstorage-performance/solution.md)
   - Time: 3 days
   - Impact: Prevents blocking

### 🟢 Enhancement (Do Third)
5. **Virtual Scrolling** - [04-virtual-scrolling](./04-virtual-scrolling/solution.md)
   - Time: 3 days
   - Impact: Scalability

6. **Web Workers** - [06-web-workers](./06-web-workers/solution.md)
   - Time: 3 days
   - Impact: Eliminates blocking

---

## 📦 Quick Installation Commands

### For React Re-renders
```bash
# No additional packages needed
# Uses built-in React.memo, useMemo, useCallback
```

### For LocalStorage Performance
```bash
npm install idb lz-string
```

### For Memory Leaks
```bash
# No additional packages needed
# Uses built-in cleanup patterns
```

### For Virtual Scrolling
```bash
npm install react-window react-virtualized-auto-sizer
# OR
npm install @tanstack/react-virtual
```

### For Input Performance
```bash
npm install use-debounce
```

### For Web Workers
```bash
# No additional packages needed
# Workers are native browser API
```

---

## 🔧 Common Code Patterns

### Pattern 1: Memoize Component
```typescript
export const MyComponent = React.memo(
  ({ data }) => {
    return <div>{data}</div>;
  },
  (prev, next) => prev.data.id === next.data.id
);
```

### Pattern 2: Debounce State Update
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback((value) => {
  setState(value);
}, 300);
```

### Pattern 3: Cleanup Effect
```typescript
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  const listener = () => {};
  window.addEventListener('resize', listener);
  
  return () => {
    clearInterval(interval);
    window.removeEventListener('resize', listener);
  };
}, []);
```

### Pattern 4: Use Worker
```typescript
const { postMessage } = useWorker('/workers/my-worker.js');

useEffect(() => {
  postMessage('process', data)
    .then(setResult)
    .catch(console.error);
}, [data]);
```

### Pattern 5: Virtual List
```typescript
import { VariableSizeList } from 'react-window';

<VariableSizeList
  height={600}
  itemCount={items.length}
  itemSize={(index) => getItemHeight(index)}
>
  {Row}
</VariableSizeList>
```

---

## 🐛 Debugging Tools

### Check Re-renders
```typescript
// Add to component
useEffect(() => {
  console.log('Component rendered');
});

// Use React DevTools Profiler
// Highlight updates when components render
```

### Check Memory Leaks
```javascript
// Chrome DevTools → Memory → Take Heap Snapshot
// Compare snapshots before/after actions
// Look for detached DOM nodes
```

### Check Performance
```javascript
// Chrome DevTools → Performance → Record
// Look for long tasks (>50ms)
// Check frame rate
```

### Monitor LocalStorage
```javascript
// Check size
let total = 0;
for (let key in localStorage) {
  total += localStorage[key].length;
}
console.log(`LocalStorage: ${(total / 1024).toFixed(2)} KB`);
```

---

## 📊 Performance Metrics Cheat Sheet

### Good Targets
- ✅ Input lag: < 16ms (60fps)
- ✅ Re-renders per action: < 3
- ✅ LocalStorage operations: < 10ms
- ✅ Memory growth: < 50MB per hour
- ✅ Frame rate: 60fps
- ✅ Time to Interactive: < 100ms

### Warning Signs
- ⚠️ Input lag: 50-100ms
- ⚠️ Re-renders per action: 5-10
- ⚠️ LocalStorage operations: 50-100ms
- ⚠️ Memory growth: 50-100MB per hour
- ⚠️ Frame rate: 30-45fps

### Critical Issues
- 🚨 Input lag: > 200ms
- 🚨 Re-renders per action: > 15
- 🚨 LocalStorage operations: > 200ms
- 🚨 Memory growth: > 100MB per hour
- 🚨 Frame rate: < 30fps
- 🚨 UI freezes: Any occurrence

---

## 🚀 Quick Wins (< 1 hour each)

### 1. Memoize Expensive Components
```typescript
// Before
export function Message({ message }) { ... }

// After
export const Message = React.memo(function Message({ message }) { ... });
```

### 2. Add Cleanup to Effects
```typescript
// Before
useEffect(() => {
  setInterval(() => {}, 1000);
}, []);

// After
useEffect(() => {
  const id = setInterval(() => {}, 1000);
  return () => clearInterval(id);
}, []);
```

### 3. Debounce Input Resize
```typescript
// Before
useEffect(() => {
  resize();
}, [value]);

// After
const debouncedResize = useDebouncedCallback(resize, 100);
useEffect(() => {
  debouncedResize();
}, [value]);
```

### 4. Use Passive Event Listeners
```typescript
// Before
element.addEventListener('scroll', handler);

// After
element.addEventListener('scroll', handler, { passive: true });
```

### 5. Reduce Interval Frequency
```typescript
// Before
setInterval(update, 100); // 10 times per second

// After
setInterval(update, 500); // 2 times per second
```

---

## 🔗 Quick Links

- [Full Solutions README](./README.md)
- [Original Issues Document](../issues_sonnet.md)
- [React Performance Docs](https://react.dev/learn/render-and-commit)
- [Web Performance Docs](https://web.dev/performance/)

---

**Pro Tip:** Start with the quick wins above, then tackle the priority-based solutions in order. Each solution builds on the previous ones for maximum impact.
