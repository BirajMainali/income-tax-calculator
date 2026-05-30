import { formatRu } from './formatCurrency.js';

/** True when every slab before index has a configured finite span. */
export function isSlabChainComplete(slabs, index) {
  for (let i = 0; i < index; i++) {
    const size = slabs[i].size;
    if (size == null || size === Infinity) return false;
  }
  return true;
}

/** Range label for tables: रु 0 – रु 10,00,000 */
export function formatRangeCompact(from, to) {
  if (to == null) {
    if (from == null) return '—';
    return from <= 0 ? 'All income' : `${formatRu(from)} – …`;
  }
  if (from === 0) return `${formatRu(0)} – ${formatRu(to)}`;
  return `${formatRu(from)} – ${formatRu(to)}`;
}

/** Inclusive from/to for display and editing. */
export function getSlabBounds(slabs, index) {
  let prevUpper = 0;
  let chainComplete = true;
  for (let i = 0; i < index; i++) {
    const size = slabs[i].size;
    if (size == null) {
      chainComplete = false;
      break;
    }
    if (size === Infinity) break;
    prevUpper += size;
  }
  const slab = slabs[index];
  const isLast = index === slabs.length - 1;
  const unlimited =
    slab.size === Infinity || (slab.size == null && isLast);
  const from = index === 0 ? 0 : chainComplete ? prevUpper + 1 : null;
  const to =
    slab.size == null || unlimited
      ? null
      : chainComplete || index === 0
        ? prevUpper + slab.size
        : null;
  return { from, to, unlimited };
}

export function clearSlabUpperBound(slabs, index) {
  const isLast = index === slabs.length - 1;
  return slabs.map((s, i) =>
    i === index ? { ...s, size: null, unlimited: isLast } : s,
  );
}

export function setSlabUpperBound(slabs, index, newUpperInclusive) {
  let prevUpper = 0;
  for (let i = 0; i < index; i++) {
    const size = slabs[i].size;
    if (size == null || size === Infinity) break;
    prevUpper += size;
  }
  const minUpper = index === 0 ? 1 : prevUpper + 1;
  const clamped = Math.max(minUpper, newUpperInclusive);
  const newSize = clamped - prevUpper;
  return slabs.map((s, i) =>
    i === index ? { ...s, size: newSize, unlimited: false } : s,
  );
}

/** Adjust slab start by updating the previous bracket's upper bound. */
export function setSlabLowerBound(slabs, index, newFrom) {
  if (index <= 0) return slabs;
  const prevUpper = Math.max(0, newFrom - 1);
  return setSlabUpperBound(slabs, index - 1, prevUpper);
}

export function enrichSlabsWithRanges(slabs) {
  return slabs.map((slab, index) => {
    const { from, to, unlimited } = getSlabBounds(slabs, index);
    const rangeLabel = formatRangeCompact(
      from === 0 ? 0 : from,
      unlimited ? null : to,
    );
    return {
      ...slab,
      rangeFrom: from,
      rangeTo: to,
      size: unlimited ? Infinity : slab.size == null ? null : Math.max(0, slab.size),
      rangeLabel,
      label: rangeLabel,
      tierName: `Tier ${index + 1}`,
    };
  });
}

export function nextSlabId(slabs) {
  if (slabs.length === 0) return 1;
  return Math.max(...slabs.map((s) => s.id)) + 1;
}

export function normalizeSlabSizes(slabs) {
  if (slabs.length === 0) {
    return [{ id: 1, size: null, rate: null, unlimited: true }];
  }

  return slabs.map((slab, i) => {
    const isLast = i === slabs.length - 1;
    if (slab.size == null) {
      return { ...slab, unlimited: isLast };
    }
    if (isLast && (slab.size === Infinity || slab.unlimited)) {
      return { ...slab, size: Infinity, unlimited: true };
    }
    if (!isLast && slab.size === Infinity) {
      return { ...slab, size: null, unlimited: false };
    }
    return {
      ...slab,
      size: Math.max(1, Number(slab.size) || 1),
      unlimited: false,
    };
  });
}
