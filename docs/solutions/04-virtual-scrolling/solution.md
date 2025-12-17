# Solution: Virtual Scrolling Implementation

## Problem Overview
All messages are rendered in the DOM simultaneously, causing performance degradation as conversations grow. With 30+ messages, the DOM becomes bloated, leading to slow rendering, scroll jank, and increased memory usage.

---

## Solution: Implement Virtual Scrolling with react-window

### Step 1: Install react-window
**Command:**
```bash
npm install react-window
npm install --save-dev @types/react-window
```

**Expected Result:** react-window library installed for virtual scrolling.

---

### Step 2: Create Virtual Message List Component
**File:** `components/features/spaces/chat/virtual-message-list.tsx` (Create new file)

**Action:** Create a virtualized message list component.

```typescript
import { VariableSizeList as List } from 'react-window';
import { useRef, useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  currentMessageId?: string;
}

export function VirtualMessageList({
  messages,
  isStreaming,
  currentMessageId,
}: VirtualMessageListProps) {
  const listRef = useRef<List>(null);
  const rowHeights = useRef<{ [key: number]: number }>({});
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Function to get row height
  const getRowHeight = (index: number) => {
    return rowHeights.current[index] || 200; // Default height
  };

  // Function to set row height
  const setRowHeight = (index: number, size: number) => {
    if (rowHeights.current[index] !== size) {
      rowHeights.current[index] = size;
      listRef.current?.resetAfterIndex(index);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0) {
      listRef.current?.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length, shouldScrollToBottom]);

  // Row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const message = messages[index];

    // Measure row height after render
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setRowHeight(index, height);
      }
    }, [index, message.content]);

    return (
      <div style={style}>
        <div ref={rowRef}>
          <MessageComponent
            message={message}
            isLast={index === messages.length - 1}
            isStreaming={isStreaming && message.id === currentMessageId}
          />
        </div>
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          width={width}
          itemCount={messages.length}
          itemSize={getRowHeight}
          overscanCount={5} // Render 5 extra items above/below viewport
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
```

**Expected Result:** Only visible messages are rendered in the DOM.

---

### Step 3: Install react-virtualized-auto-sizer
**Command:**
```bash
npm install react-virtualized-auto-sizer
npm install --save-dev @types/react-virtualized-auto-sizer
```

**Expected Result:** Auto-sizer component for responsive virtual list.

---

### Step 4: Create Message Height Cache
**File:** `lib/utils/messageHeightCache.ts` (Create new file)

**Action:** Create a persistent cache for message heights.

```typescript
class MessageHeightCache {
  private cache: Map<string, number> = new Map();
  private defaultHeight = 200;

  get(messageId: string): number {
    return this.cache.get(messageId) || this.defaultHeight;
  }

  set(messageId: string, height: number) {
    this.cache.set(messageId, height);
  }

  has(messageId: string): boolean {
    return this.cache.has(messageId);
  }

  clear() {
    this.cache.clear();
  }

  // Estimate height based on content length
  estimate(message: Message): number {
    if (this.has(message.id)) {
      return this.get(message.id);
    }

    // Rough estimation based on content
    const contentLength = message.content?.length || 0;
    const hasCode = message.content?.includes('```');
    const hasImages = message.parts?.some(p => p.type === 'image');

    let estimatedHeight = this.defaultHeight;

    // Adjust based on content
    if (contentLength > 500) estimatedHeight += 100;
    if (contentLength > 1000) estimatedHeight += 200;
    if (hasCode) estimatedHeight += 150;
    if (hasImages) estimatedHeight += 300;

    return estimatedHeight;
  }
}

export const messageHeightCache = new MessageHeightCache();
```

**Expected Result:** Better height estimation reduces layout shifts.

---

### Step 5: Update Messages Component to Use Virtual List
**File:** `components/features/spaces/chat/messages.tsx`

**Action:** Replace traditional rendering with virtual list.

**Before:**
```typescript
export function Messages({ messages }: MessagesProps) {
  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <MessageComponent
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  );
}
```

**After:**
```typescript
import { VirtualMessageList } from './virtual-message-list';

export function Messages({ messages, isStreaming, currentMessageId }: MessagesProps) {
  return (
    <div className="messages-container" style={{ height: '100%' }}>
      <VirtualMessageList
        messages={messages}
        isStreaming={isStreaming}
        currentMessageId={currentMessageId}
      />
    </div>
  );
}
```

**Expected Result:** Virtual scrolling enabled for message list.

---

### Step 6: Optimize Message Component for Virtual Rendering
**File:** `components/features/spaces/chat/message.tsx`

**Action:** Memoize message component to prevent unnecessary re-renders.

```typescript
import React, { memo } from 'react';

interface MessageComponentProps {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
}

export const MessageComponent = memo(
  ({ message, isLast, isStreaming }: MessageComponentProps) => {
    return (
      <div className="message">
        {/* Message content */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.isLast === nextProps.isLast &&
      prevProps.isStreaming === nextProps.isStreaming
    );
  }
);

MessageComponent.displayName = 'MessageComponent';
```

**Expected Result:** Messages only re-render when their data changes.

---

### Step 7: Add Scroll Position Tracking
**File:** `components/features/spaces/chat/virtual-message-list.tsx`

**Action:** Track scroll position to determine auto-scroll behavior.

```typescript
export function VirtualMessageList({ messages, isStreaming }: VirtualMessageListProps) {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const listRef = useRef<List>(null);

  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: any) => {
    if (!scrollUpdateWasRequested) {
      // User manually scrolled
      const listHeight = listRef.current?.props.height || 0;
      const totalHeight = messages.reduce((sum, _, i) => sum + getRowHeight(i), 0);
      const distanceFromBottom = totalHeight - (scrollOffset + listHeight);
      
      // Consider "near bottom" if within 100px
      setIsNearBottom(distanceFromBottom < 100);
    }
  };

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      listRef.current?.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length, isNearBottom]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          width={width}
          itemCount={messages.length}
          itemSize={getRowHeight}
          onScroll={handleScroll}
          overscanCount={5}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
```

**Expected Result:** Auto-scroll only when user is at bottom, preserving scroll position otherwise.

---

### Step 8: Add Scroll-to-Message Functionality
**File:** `components/features/spaces/chat/virtual-message-list.tsx`

**Action:** Add ability to scroll to specific messages.

```typescript
export function VirtualMessageList({ messages, scrollToMessageId }: VirtualMessageListProps) {
  const listRef = useRef<List>(null);

  useEffect(() => {
    if (scrollToMessageId) {
      const index = messages.findIndex(m => m.id === scrollToMessageId);
      if (index !== -1) {
        listRef.current?.scrollToItem(index, 'center');
      }
    }
  }, [scrollToMessageId, messages]);

  // Rest of component...
}
```

**Expected Result:** Can programmatically scroll to any message.

---

## Alternative Solution: react-virtual

If react-window doesn't meet your needs, consider react-virtual:

### Step 1: Install react-virtual
```bash
npm install @tanstack/react-virtual
```

### Step 2: Implement with react-virtual
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualMessageList({ messages }: VirtualMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => messageHeightCache.estimate(messages[index]),
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MessageComponent
              message={messages[virtualItem.index]}
              isLast={virtualItem.index === messages.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Expected Result:** Alternative virtual scrolling implementation with automatic size measurement.

---

## Verification Steps

### Step 1: Test with Small Conversation (5-10 messages)
1. Open DevTools → Elements tab
2. Count rendered message elements
3. **Expected:** All messages rendered (virtual scrolling overhead not worth it yet)

### Step 2: Test with Medium Conversation (20-30 messages)
1. Scroll to top
2. Count rendered message elements in DOM
3. **Expected:** Only ~10-15 messages rendered (visible + overscan)
4. Scroll to bottom
5. **Expected:** Different set of messages rendered

### Step 3: Test with Large Conversation (50+ messages)
1. Check DOM element count
2. **Expected:** Still only ~10-15 messages rendered
3. Test scroll performance
4. **Expected:** Smooth 60fps scrolling

### Step 4: Performance Profiling
```javascript
// Run in browser console
console.time('scroll-performance');
// Scroll from top to bottom
console.timeEnd('scroll-performance');
// Should be < 100ms
```

### Step 5: Memory Usage Test
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot with 10 messages
3. Add 40 more messages
4. Take another heap snapshot
5. Compare memory usage
6. **Expected:** Memory increase should be minimal (only visible messages in memory)

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| DOM elements (50 messages) | 50+ | 10-15 | 70-80% |
| Scroll FPS | 30-40 | 60 | 50% |
| Memory usage (50 messages) | 50-100 MB | 20-30 MB | 60-70% |
| Initial render time | 500-1000ms | 100-200ms | 80% |
| Scroll jank | Frequent | Rare | 90% |

---

## Troubleshooting

### Issue: Messages jumping during scroll
**Solution:** Improve height estimation
```typescript
const estimateSize = (index: number) => {
  const message = messages[index];
  // More accurate estimation based on content
  return messageHeightCache.estimate(message);
};
```

### Issue: Auto-scroll not working
**Solution:** Ensure proper scroll detection
```typescript
useEffect(() => {
  if (isStreaming && isNearBottom) {
    listRef.current?.scrollToItem(messages.length - 1, 'end');
  }
}, [messages.length, isStreaming, isNearBottom]);
```

### Issue: Images causing layout shifts
**Solution:** Reserve space for images
```typescript
<img
  src={src}
  style={{ maxWidth: '100%', height: 'auto' }}
  onLoad={() => {
    // Recalculate height after image loads
    listRef.current?.resetAfterIndex(messageIndex);
  }}
/>
```

---

## Rollback Plan

1. **Feature flag:**
   ```typescript
   const USE_VIRTUAL_SCROLLING = process.env.NEXT_PUBLIC_VIRTUAL_SCROLLING === 'true';
   
   if (USE_VIRTUAL_SCROLLING) {
     return <VirtualMessageList messages={messages} />;
   }
   return <TraditionalMessageList messages={messages} />;
   ```

2. **Gradual rollout:**
   - Enable for conversations with 30+ messages first
   - Monitor for issues
   - Gradually lower threshold to 20, then 10 messages

3. **Quick revert:**
   ```bash
   git revert <commit-hash>
   npm run build
   ```

---

## Additional Resources

- [react-window Documentation](https://react-window.vercel.app/)
- [react-virtual Documentation](https://tanstack.com/virtual/latest)
- [Virtual Scrolling Guide](https://web.dev/virtualize-long-lists-react-window/)
- [Performance Optimization](https://react.dev/learn/render-and-commit)
