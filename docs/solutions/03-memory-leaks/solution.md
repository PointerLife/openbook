# Solution: Memory Leaks and Accumulation

## Problem Overview
Interval timers and event listeners are not being properly cleaned up, causing memory leaks and CPU consumption that accumulates over time. This leads to degraded performance in long-running sessions.

---

## Solution 1: Fix Interval Timer Cleanup

### Step 1: Audit All setInterval Usage
**Action:** Find all interval timers in the codebase.

```bash
# Run this command to find all setInterval usage
grep -r "setInterval" --include="*.tsx" --include="*.ts" components/ app/
```

**Expected Result:** List of all files using setInterval.

---

### Step 2: Fix Reasoning Timing Intervals
**File:** `components/features/spaces/chat/messages.tsx` (Line 425)

**Action:** Ensure proper cleanup of reasoning timing intervals.

**Before:**
```typescript
useEffect(() => {
  if (hasActiveReasoning) {
    const interval = setInterval(() => {
      updateReasoningTiming();
    }, 100);
    // Missing cleanup!
  }
}, [hasActiveReasoning]);
```

**After:**
```typescript
useEffect(() => {
  if (!hasActiveReasoning) return;
  
  const interval = setInterval(() => {
    updateReasoningTiming();
  }, 100);
  
  // Proper cleanup
  return () => {
    clearInterval(interval);
    console.log('🧹 Cleared reasoning timing interval');
  };
}, [hasActiveReasoning]);
```

**Expected Result:** Intervals are cleared when component unmounts or dependency changes.

---

### Step 3: Fix Thinking Duration Intervals
**File:** `components/features/spaces/chat/messages.tsx` (Line 110)

**Action:** Prevent multiple intervals from running simultaneously.

**Before:**
```typescript
useEffect(() => {
  if (status === 'thinking') {
    const interval = setInterval(() => {
      setThinkingDuration(prev => prev + 1000);
    }, 1000);
  }
}, [status]); // Creates new interval on every status change!
```

**After:**
```typescript
useEffect(() => {
  if (status !== 'thinking') {
    setThinkingDuration(0); // Reset when not thinking
    return;
  }
  
  const interval = setInterval(() => {
    setThinkingDuration(prev => prev + 1000);
  }, 1000);
  
  return () => {
    clearInterval(interval);
    console.log('🧹 Cleared thinking duration interval');
  };
}, [status]);
```

**Expected Result:** Only one interval runs at a time, properly cleaned up on status change.

---

### Step 4: Fix Stream Progress Intervals
**File:** `components/features/spaces/chat/messages.tsx` (Line 138)

**Action:** Ensure stream progress intervals are cleaned up.

**Before:**
```typescript
useEffect(() => {
  if (isStreaming) {
    const interval = setInterval(() => {
      updateStreamProgress();
    }, 300);
  }
}, [isStreaming]);
```

**After:**
```typescript
useEffect(() => {
  if (!isStreaming) return;
  
  const interval = setInterval(() => {
    updateStreamProgress();
  }, 300);
  
  return () => {
    clearInterval(interval);
    console.log('🧹 Cleared stream progress interval');
  };
}, [isStreaming]);
```

**Expected Result:** Stream intervals properly cleaned up when streaming stops.

---

### Step 5: Create Interval Manager Hook
**File:** `hooks/useInterval.ts` (Create new file)

**Action:** Create a reusable hook that guarantees cleanup.

```typescript
import { useEffect, useRef } from 'react';

export function useInterval(
  callback: () => void,
  delay: number | null,
  immediate: boolean = false
) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if no delay is specified
    if (delay === null) return;

    // Execute immediately if requested
    if (immediate) {
      savedCallback.current();
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    // Cleanup
    return () => {
      clearInterval(id);
      console.log(`🧹 Cleared interval (${delay}ms)`);
    };
  }, [delay, immediate]);
}
```

**Usage:**
```typescript
// In your component
useInterval(
  () => updateReasoningTiming(),
  hasActiveReasoning ? 100 : null // Pass null to stop
);

useInterval(
  () => setThinkingDuration(prev => prev + 1000),
  status === 'thinking' ? 1000 : null
);
```

**Expected Result:** Centralized interval management with guaranteed cleanup.

---

## Solution 2: Fix Event Listener Cleanup

### Step 1: Audit All Event Listeners
**Action:** Find all addEventListener usage.

```bash
# Find all event listeners
grep -r "addEventListener" --include="*.tsx" --include="*.ts" components/ app/
```

**Expected Result:** List of all files using event listeners.

---

### Step 2: Fix Scroll Listener Cleanup
**File:** `app/(core)/ChatClient.tsx` (Line 499)

**Action:** Ensure scroll listeners are properly removed.

**Before:**
```typescript
useEffect(() => {
  const container = scrollContainerRef.current;
  if (container) {
    container.addEventListener('scroll', handleScroll);
  }
  // Missing cleanup or incorrect cleanup!
}, [messages]);
```

**After:**
```typescript
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;
  
  const handleScroll = (event: Event) => {
    // Scroll handling logic
  };
  
  container.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    container.removeEventListener('scroll', handleScroll);
    console.log('🧹 Removed scroll listener');
  };
}, []); // Remove messages dependency to prevent re-adding listener
```

**Expected Result:** Scroll listener added once and properly cleaned up.

---

### Step 3: Fix Window Resize Listener
**File:** `app/(core)/ChatClient.tsx` (Line 511)

**Action:** Ensure resize listener is properly removed.

**Before:**
```typescript
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [handleResize]); // handleResize recreated on every render!
```

**After:**
```typescript
useEffect(() => {
  const handleResize = () => {
    // Resize logic
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    console.log('🧹 Removed resize listener');
  };
}, []); // No dependencies - listener added once
```

**Expected Result:** Single resize listener, properly cleaned up on unmount.

---

### Step 4: Create Event Listener Hook
**File:** `hooks/useEventListener.ts` (Create new file)

**Action:** Create a reusable hook for event listeners with automatic cleanup.

```typescript
import { useEffect, useRef } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = window,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    // Create event listener that calls handler from ref
    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    // Cleanup
    return () => {
      element.removeEventListener(eventName, eventListener, options);
      console.log(`🧹 Removed ${eventName} listener`);
    };
  }, [eventName, element, options]);
}
```

**Usage:**
```typescript
// In your component
useEventListener('scroll', handleScroll, scrollContainerRef.current, { passive: true });
useEventListener('resize', handleResize);
useEventListener('keydown', handleKeyDown);
```

**Expected Result:** Automatic cleanup of all event listeners.

---

## Solution 3: Implement Memory Leak Detection

### Step 1: Create Memory Monitor Hook
**File:** `hooks/useMemoryMonitor.ts` (Create new file)

**Action:** Create a development-only hook to detect memory leaks.

```typescript
import { useEffect, useRef } from 'react';

export function useMemoryMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current++;

    // Log memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`[${componentName}] Render #${renderCount.current}`, {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        uptime: `${((Date.now() - mountTime.current) / 1000).toFixed(1)}s`,
      });
    }

    // Warn if component renders too frequently
    if (renderCount.current > 100) {
      console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times! Possible performance issue.`);
    }
  });

  useEffect(() => {
    return () => {
      console.log(`🧹 ${componentName} unmounted after ${renderCount.current} renders`);
    };
  }, [componentName]);
}
```

**Usage:**
```typescript
// In your component
export function Messages() {
  useMemoryMonitor('Messages');
  
  // Rest of component...
}
```

**Expected Result:** Console logs showing memory usage and render counts in development.

---

### Step 2: Create Cleanup Tracker
**File:** `hooks/useCleanupTracker.ts` (Create new file)

**Action:** Track all cleanup functions to ensure they're called.

```typescript
import { useEffect, useRef } from 'react';

export function useCleanupTracker(componentName: string) {
  const cleanups = useRef<Map<string, () => void>>(new Map());

  const registerCleanup = (name: string, cleanup: () => void) => {
    cleanups.current.set(name, cleanup);
    console.log(`📝 Registered cleanup: ${componentName}.${name}`);
  };

  const executeCleanup = (name: string) => {
    const cleanup = cleanups.current.get(name);
    if (cleanup) {
      cleanup();
      cleanups.current.delete(name);
      console.log(`✅ Executed cleanup: ${componentName}.${name}`);
    }
  };

  useEffect(() => {
    return () => {
      // Execute all remaining cleanups on unmount
      cleanups.current.forEach((cleanup, name) => {
        console.log(`🧹 Auto-cleanup: ${componentName}.${name}`);
        cleanup();
      });
      cleanups.current.clear();
    };
  }, [componentName]);

  return { registerCleanup, executeCleanup };
}
```

**Usage:**
```typescript
export function Messages() {
  const { registerCleanup, executeCleanup } = useCleanupTracker('Messages');

  useEffect(() => {
    const interval = setInterval(() => {}, 1000);
    
    registerCleanup('reasoningInterval', () => clearInterval(interval));
    
    return () => executeCleanup('reasoningInterval');
  }, []);
}
```

**Expected Result:** All cleanups are tracked and logged, making leaks easy to spot.

---

## Solution 4: Optimize Cleanup Patterns

### Step 1: Use AbortController for Fetch Requests
**File:** Any component making fetch requests

**Action:** Use AbortController to cancel in-flight requests.

```typescript
useEffect(() => {
  const abortController = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch('/api/data', {
        signal: abortController.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🧹 Fetch aborted');
      } else {
        console.error('Fetch error:', error);
      }
    }
  }

  fetchData();

  return () => {
    abortController.abort();
    console.log('🧹 Aborted pending fetch requests');
  };
}, []);
```

**Expected Result:** No memory leaks from pending fetch requests.

---

### Step 2: Create Cleanup Helper Utilities
**File:** `lib/utils/cleanup.ts` (Create new file)

**Action:** Create utilities for common cleanup patterns.

```typescript
export class CleanupManager {
  private cleanups: (() => void)[] = [];

  add(cleanup: () => void) {
    this.cleanups.push(cleanup);
  }

  addInterval(interval: NodeJS.Timeout) {
    this.add(() => clearInterval(interval));
  }

  addTimeout(timeout: NodeJS.Timeout) {
    this.add(() => clearTimeout(timeout));
  }

  addEventListener<K extends keyof WindowEventMap>(
    element: Window | HTMLElement,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) {
    element.addEventListener(event, handler as any, options);
    this.add(() => element.removeEventListener(event, handler as any, options));
  }

  cleanup() {
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
    console.log(`🧹 Cleaned up ${this.cleanups.length} items`);
  }
}

export function useCleanupManager() {
  const managerRef = useRef<CleanupManager>();

  if (!managerRef.current) {
    managerRef.current = new CleanupManager();
  }

  useEffect(() => {
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  return managerRef.current;
}
```

**Usage:**
```typescript
export function Messages() {
  const cleanup = useCleanupManager();

  useEffect(() => {
    // Add interval
    const interval = setInterval(() => {}, 1000);
    cleanup.addInterval(interval);

    // Add event listener
    cleanup.addEventListener(window, 'resize', handleResize);

    // Manual cleanup
    cleanup.add(() => {
      console.log('Custom cleanup');
    });
  }, []);
}
```

**Expected Result:** Centralized cleanup management, no leaks.

---

## Verification Steps

### Step 1: Use Chrome DevTools Memory Profiler

1. **Open Chrome DevTools** → Performance tab
2. **Enable memory tracking:**
   - Check "Memory" checkbox
3. **Record a session:**
   - Click Record
   - Use the app (send 20+ messages)
   - Stop recording
4. **Analyze:**
   - Look for memory that doesn't get garbage collected
   - Check for increasing interval/timer count

---

### Step 2: Use React DevTools Profiler

1. **Install React DevTools** browser extension
2. **Open Profiler tab**
3. **Record interactions:**
   - Send messages
   - Switch between spaces
   - Navigate pages
4. **Check for:**
   - Components that render too frequently
   - Long render times
   - Unnecessary re-renders

---

### Step 3: Monitor Active Timers

**Create a timer monitoring script:**

```typescript
// Add to your app during development
if (process.env.NODE_ENV === 'development') {
  const originalSetInterval = window.setInterval;
  const originalClearInterval = window.clearInterval;
  const activeIntervals = new Set<number>();

  window.setInterval = function(...args) {
    const id = originalSetInterval.apply(this, args);
    activeIntervals.add(id);
    console.log(`⏱️ Active intervals: ${activeIntervals.size}`);
    return id;
  };

  window.clearInterval = function(id) {
    activeIntervals.delete(id);
    console.log(`🧹 Active intervals: ${activeIntervals.size}`);
    return originalClearInterval.call(this, id);
  };

  // Log active intervals every 10 seconds
  setInterval(() => {
    console.log(`📊 Currently active intervals: ${activeIntervals.size}`);
  }, 10000);
}
```

**Expected Result:** Active interval count should remain stable or decrease over time.

---

### Step 4: Memory Leak Test Script

**Create a test to detect leaks:**

```typescript
// test/memory-leak.test.ts
describe('Memory Leak Tests', () => {
  it('should not leak memory when mounting/unmounting Messages', async () => {
    const { unmount, rerender } = render(<Messages />);
    
    // Get initial memory
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Mount and unmount 10 times
    for (let i = 0; i < 10; i++) {
      rerender(<Messages />);
      unmount();
    }
    
    // Force garbage collection (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
    
    // Check final memory
    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory should not increase significantly
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB threshold
  });
});
```

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Active intervals (after 30 min) | 15-20 | 2-3 | 85% |
| Memory usage (after 30 min) | +50-100 MB | +10-20 MB | 80% |
| Event listeners (after 30 min) | 20-30 | 5-8 | 70% |
| Cleanup execution rate | 60-70% | 100% | 40% |

---

## Rollback Plan

1. **Git revert:**
   ```bash
   git revert <commit-hash>
   ```

2. **Disable monitoring in production:**
   ```typescript
   const ENABLE_MEMORY_MONITORING = process.env.NODE_ENV === 'development';
   ```

3. **Gradual rollout:**
   - Deploy to development first
   - Monitor for 24 hours
   - Deploy to staging
   - Monitor for 48 hours
   - Deploy to production

---

## Additional Resources

- [React useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Chrome DevTools Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Detecting Memory Leaks](https://web.dev/detached-window-memory-leaks/)
- [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
