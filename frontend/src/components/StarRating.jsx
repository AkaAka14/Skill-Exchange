import React, { useState } from 'react';

/**
 * StarRating
 *
 * Props:
 *   value      — current rating (1–5)
 *   onChange   — if provided, makes stars interactive (for writing a review)
 *   size       — 'sm' | 'md' | 'lg'  (default 'md')
 */
export function StarRating({ value = 0, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const interactive = Boolean(onChange);

  const sizes = { sm: 16, md: 20, lg: 28 };
  const px = sizes[size] ?? 20;

  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? hovered || value : value);
        return (
          <svg
            key={star}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={filled ? '#f59e0b' : 'none'}
            stroke={filled ? '#f59e0b' : '#d1d5db'}
            strokeWidth="1.5"
            style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0 }}
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            aria-label={`${star} star`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        );
      })}
    </span>
  );
}
