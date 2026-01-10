import { useRef, useCallback, useState, useEffect, memo } from "react";

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  columns?: number;
  gap?: number;
  className?: string;
  overscanCount?: number;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight,
  columns: forcedColumns,
  gap = 24,
  className = "",
  overscanCount = 3,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [columns, setColumns] = useState(forcedColumns || 3);

  useEffect(() => {
    if (forcedColumns) {
      setColumns(forcedColumns);
      return;
    }

    const updateColumns = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [forcedColumns]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const rowHeight = itemHeight + gap;
  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscanCount);
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscanCount
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (items.length === 0) {
    return null;
  }

  const visibleRows = [];
  for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
    const startItemIndex = rowIndex * columns;
    const rowItems = items.slice(startItemIndex, startItemIndex + columns);

    visibleRows.push(
      <div
        key={rowIndex}
        style={{
          position: "absolute",
          top: rowIndex * rowHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {rowItems.map((item, colIndex) => (
          <div key={startItemIndex + colIndex}>
            {renderItem(item, startItemIndex + colIndex)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ 
        height: "100%", 
        minHeight: 600, 
        overflow: "auto",
        position: "relative"
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleRows}
      </div>
    </div>
  );
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  threshold = 200
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, threshold]);

  return loadMoreRef;
}

export const VirtualizedItem = memo(function VirtualizedItem<T>({
  item,
  index,
  renderItem,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  return <>{renderItem(item, index)}</>;
});
