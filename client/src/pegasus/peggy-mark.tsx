/** Peggy's own winged P. Optical simplification of the approved mark for UI sizes. */
export function PeggyMark({ size = 32 }: { size?: number }) {
  return <svg className="peggy-mark" width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
    <path fill="#f5efe4" fillRule="evenodd" d="M8 20h21c12 0 19 6 19 16 0 11-8 17-21 17h-4v3c0 3 2 4 6 5H8c5-1 7-3 7-7V28c0-4-2-6-7-8Zm15 6v21h4c8 0 12-4 12-11 0-6-4-10-12-10h-4Z" clipRule="evenodd" />
    <path fill="#f5efe4" d="M29 20c13-1 24-8 30-18 0 14-8 25-23 23l-7-5Zm13 8c7 1 12-1 17-5-2 9-7 14-13 11l-4-6Zm5 10c4 1 7 0 10-2-3 7-6 9-10 7v-5Z" />
    <path fill="#d9a47c" d="m38 3 1.7 5.3L45 10l-5.3 1.7L38 17l-1.7-5.3L31 10l5.3-1.7L38 3Z" />
    <path stroke="#d9a47c" strokeWidth="1.6" strokeLinecap="round" d="M29 23c10 1 16 6 16 14 0 6-3 10-8 13" />
  </svg>;
}
