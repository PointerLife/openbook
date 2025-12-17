# Solution: Web Workers for Heavy Computations

## Problem Overview
Heavy computations like markdown parsing, LaTeX rendering, and syntax highlighting block the main thread, causing UI freezes. Moving these to Web Workers keeps the UI responsive.

---

## Solution 1: Set Up Web Workers Infrastructure

### Step 1: Create Worker Directory Structure
**Action:** Create directory for worker files.

```bash
mkdir -p public/workers
```

**Expected Result:** Directory created for worker scripts.

---

### Step 2: Create Markdown Worker
**File:** `public/workers/markdown.worker.js` (Create new file)

**Action:** Create worker for markdown processing.

```javascript
// Markdown processing worker
self.addEventListener('message', async (event) => {
  const { id, type, content } = event.data;

  try {
    let result;

    switch (type) {
      case 'parse':
        result = await parseMarkdown(content);
        break;
      case 'extractLatex':
        result = extractLatexBlocks(content);
        break;
      case 'processCitations':
        result = processCitations(content);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({
      id,
      success: true,
      result,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
});

// Markdown parsing function
async function parseMarkdown(content) {
  // Import markdown library in worker
  // Note: You may need to use importScripts for some libraries
  
  // Process markdown
  const processed = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  return processed;
}

function extractLatexBlocks(content) {
  const latexBlocks = [];
  const regex = /\$\$(.+?)\$\$/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    latexBlocks.push({
      content: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return latexBlocks;
}

function processCitations(content) {
  // Process citation links
  return content.replace(/\[(\d+)\]/g, '<sup><a href="#ref-$1">[$1]</a></sup>');
}
```

**Expected Result:** Worker script ready for markdown processing.

---

### Step 3: Create Worker Hook
**File:** `hooks/useWorker.ts` (Create new file)

**Action:** Create a React hook to manage Web Workers.

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface WorkerMessage {
  id: string;
  type: string;
  content: any;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

export function useWorker(workerPath: string) {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (response: WorkerResponse) => void>>(new Map());
  const messageIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(workerPath);

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id } = event.data;
      const callback = callbacksRef.current.get(id);

      if (callback) {
        callback(event.data);
        callbacksRef.current.delete(id);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
    };

    return () => {
      workerRef.current?.terminate();
      console.log('🧹 Worker terminated');
    };
  }, [workerPath]);

  // Send message to worker
  const postMessage = useCallback(
    <T = any>(type: string, content: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const id = `msg-${messageIdRef.current++}`;

        callbacksRef.current.set(id, (response) => {
          if (response.success) {
            resolve(response.result as T);
          } else {
            reject(new Error(response.error));
          }
        });

        workerRef.current.postMessage({ id, type, content });
      });
    },
    []
  );

  return { postMessage };
}
```

**Expected Result:** Reusable hook for worker communication.

---

### Step 4: Use Markdown Worker in Component
**File:** `components/features/spaces/chat/markdown.tsx`

**Action:** Offload markdown processing to worker.

**Before:**
```typescript
export function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = useMemo(() => {
    // Heavy processing on main thread
    return processMarkdown(content);
  }, [content]);

  return <div>{processedContent}</div>;
}
```

**After:**
```typescript
import { useWorker } from '@/hooks/useWorker';

export function MarkdownRenderer({ content }: { content: string }) {
  const [processedContent, setProcessedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { postMessage } = useWorker('/workers/markdown.worker.js');

  useEffect(() => {
    let cancelled = false;
    setIsProcessing(true);

    postMessage<string>('parse', content)
      .then((result) => {
        if (!cancelled) {
          setProcessedContent(result);
        }
      })
      .catch((error) => {
        console.error('Markdown processing error:', error);
        // Fallback to original content
        if (!cancelled) {
          setProcessedContent(content);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content, postMessage]);

  if (isProcessing) {
    return <div className="markdown-loading">Processing...</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
}
```

**Expected Result:** Markdown processing happens off main thread, UI stays responsive.

---

## Solution 2: Create Syntax Highlighting Worker

### Step 1: Create Syntax Highlighting Worker
**File:** `public/workers/syntax-highlighter.worker.js` (Create new file)

**Action:** Create worker for code syntax highlighting.

```javascript
// Import Prism.js in worker
importScripts('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js');
// Add more languages as needed

self.addEventListener('message', (event) => {
  const { id, code, language } = event.data;

  try {
    // Highlight code using Prism
    const highlighted = self.Prism.highlight(
      code,
      self.Prism.languages[language] || self.Prism.languages.plaintext,
      language
    );

    self.postMessage({
      id,
      success: true,
      result: highlighted,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
});
```

**Expected Result:** Syntax highlighting worker ready.

---

### Step 2: Use Syntax Highlighting Worker
**File:** `components/features/spaces/chat/code-block.tsx`

**Action:** Offload syntax highlighting to worker.

```typescript
import { useWorker } from '@/hooks/useWorker';

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [highlighted, setHighlighted] = useState('');
  const { postMessage } = useWorker('/workers/syntax-highlighter.worker.js');

  useEffect(() => {
    postMessage<string>('highlight', { code, language })
      .then(setHighlighted)
      .catch((error) => {
        console.error('Syntax highlighting error:', error);
        setHighlighted(code); // Fallback to plain code
      });
  }, [code, language, postMessage]);

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: highlighted || code }} />
    </pre>
  );
}
```

**Expected Result:** Syntax highlighting doesn't block UI.

---

## Solution 3: Create LaTeX Rendering Worker

### Step 1: Create LaTeX Worker
**File:** `public/workers/latex.worker.js` (Create new file)

**Action:** Create worker for LaTeX rendering.

```javascript
// Import KaTeX in worker
importScripts('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js');

self.addEventListener('message', (event) => {
  const { id, latex, displayMode } = event.data;

  try {
    const rendered = self.katex.renderToString(latex, {
      displayMode: displayMode || false,
      throwOnError: false,
      errorColor: '#cc0000',
    });

    self.postMessage({
      id,
      success: true,
      result: rendered,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
});
```

**Expected Result:** LaTeX rendering worker ready.

---

### Step 2: Use LaTeX Worker
**File:** `components/features/spaces/chat/latex-block.tsx`

**Action:** Offload LaTeX rendering to worker.

```typescript
import { useWorker } from '@/hooks/useWorker';

export function LaTeXBlock({ latex, displayMode }: { latex: string; displayMode?: boolean }) {
  const [rendered, setRendered] = useState('');
  const { postMessage } = useWorker('/workers/latex.worker.js');

  useEffect(() => {
    postMessage<string>('render', { latex, displayMode })
      .then(setRendered)
      .catch((error) => {
        console.error('LaTeX rendering error:', error);
        setRendered(`<span class="latex-error">${latex}</span>`);
      });
  }, [latex, displayMode, postMessage]);

  return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
}
```

**Expected Result:** LaTeX rendering happens off main thread.

---

## Solution 4: Worker Pool for Parallel Processing

### Step 1: Create Worker Pool Manager
**File:** `lib/workers/worker-pool.ts` (Create new file)

**Action:** Create a pool of workers for parallel processing.

```typescript
interface Task {
  id: string;
  type: string;
  content: any;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private taskId = 0;

  constructor(workerPath: string, poolSize: number = 4) {
    // Create worker pool
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerPath);
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(worker, event.data);
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async execute<T = any>(type: string, content: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task = {
        id: `task-${this.taskId++}`,
        type,
        content,
        resolve,
        reject,
      };

      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  private processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      // Store task info on worker for later retrieval
      (worker as any).currentTask = task;

      worker.postMessage({
        id: task.id,
        type: task.type,
        content: task.content,
      });
    }
  }

  private handleWorkerMessage(worker: Worker, response: any) {
    const task = (worker as any).currentTask as Task;

    if (task) {
      if (response.success) {
        task.resolve(response.result);
      } else {
        task.reject(new Error(response.error));
      }

      delete (worker as any).currentTask;
    }

    // Return worker to available pool
    this.availableWorkers.push(worker);
    this.processQueue();
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    console.log('🧹 Worker pool terminated');
  }
}
```

**Expected Result:** Pool of workers for parallel processing.

---

### Step 2: Use Worker Pool
**File:** `lib/workers/markdown-pool.ts` (Create new file)

**Action:** Create singleton worker pool for markdown processing.

```typescript
import { WorkerPool } from './worker-pool';

let markdownPool: WorkerPool | null = null;

export function getMarkdownPool(): WorkerPool {
  if (!markdownPool) {
    markdownPool = new WorkerPool('/workers/markdown.worker.js', 4);
  }
  return markdownPool;
}

export function terminateMarkdownPool() {
  if (markdownPool) {
    markdownPool.terminate();
    markdownPool = null;
  }
}
```

**Usage:**
```typescript
import { getMarkdownPool } from '@/lib/workers/markdown-pool';

export function MarkdownRenderer({ content }: { content: string }) {
  const [processed, setProcessed] = useState('');

  useEffect(() => {
    const pool = getMarkdownPool();
    
    pool.execute<string>('parse', content)
      .then(setProcessed)
      .catch(console.error);
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: processed }} />;
}
```

**Expected Result:** Multiple messages can be processed in parallel.

---

## Verification Steps

### Step 1: Measure Main Thread Blocking Before
```javascript
// Run in browser console
console.time('markdown-processing');
// Process markdown on main thread
processMarkdown(largeContent);
console.timeEnd('markdown-processing');
// Note: Likely 100-500ms, blocking UI
```

### Step 2: Implement Web Workers
Apply solutions in this order:
1. Set up worker infrastructure
2. Create markdown worker
3. Create syntax highlighting worker
4. Implement worker pool

### Step 3: Measure Performance After
```javascript
// Worker processing
console.time('worker-processing');
await workerPool.execute('parse', largeContent);
console.timeEnd('worker-processing');
// Note: Similar time, but non-blocking
```

### Step 4: Test UI Responsiveness
1. Start processing large markdown content
2. Try typing in input during processing
3. **Before:** Input lag, UI freezes
4. **After:** Smooth typing, no lag

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main thread blocking | 100-500ms | 0ms | 100% |
| UI responsiveness during processing | Frozen | Smooth | ∞ |
| Parallel processing | Sequential | 4x parallel | 400% |
| Time to Interactive | Blocked | Always < 100ms | 100% |

---

## Rollback Plan

1. **Feature flag:**
   ```typescript
   const USE_WEB_WORKERS = process.env.NEXT_PUBLIC_USE_WEB_WORKERS === 'true';
   
   if (USE_WEB_WORKERS) {
     return <WorkerMarkdownRenderer content={content} />;
   }
   return <SyncMarkdownRenderer content={content} />;
   ```

2. **Fallback on error:**
   ```typescript
   try {
     const result = await workerPool.execute('parse', content);
     setProcessed(result);
   } catch (error) {
     // Fallback to sync processing
     setProcessed(processMarkdownSync(content));
   }
   ```

---

## Additional Resources

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Using Web Workers](https://web.dev/workers-overview/)
- [Worker Performance](https://developer.chrome.com/docs/workbox/modules/workbox-window/)
