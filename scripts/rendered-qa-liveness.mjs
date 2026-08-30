export const DEFAULT_RENDERED_QA_CLOSE_TIMEOUT_MS = 5_000;

export class RenderedQaCloseTimeoutError extends Error {
  constructor(label, timeoutMs) {
    super(`Rendered QA timed out closing ${label} after ${timeoutMs}ms`);
    this.name = 'RenderedQaCloseTimeoutError';
    this.label = label;
    this.timeoutMs = timeoutMs;
  }
}

export async function closeWithinDeadline(
  label,
  close,
  timeoutMs = DEFAULT_RENDERED_QA_CLOSE_TIMEOUT_MS,
) {
  if (typeof label !== 'string' || label.trim().length === 0) {
    throw new TypeError('Rendered QA close label must be a non-empty string');
  }
  if (typeof close !== 'function') {
    throw new TypeError(`Rendered QA close action for ${label} must be a function`);
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError(`Rendered QA close timeout for ${label} must be positive`);
  }

  let timeoutHandle;
  const timeout = new Promise((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new RenderedQaCloseTimeoutError(label, timeoutMs)),
      timeoutMs,
    );
  });

  try {
    await Promise.race([
      Promise.resolve().then(close),
      timeout,
    ]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
