/** FY 2082/83 — 10 Lakh first slab (current default). */
export const FY_10L_BASE_SLABS = [
  { id: 1, size: 1_000_000, rate: 1 },
  { id: 2, size: 200_000, rate: 10 },
  { id: 3, size: 300_000, rate: 20 },
  { id: 4, size: 1_000_000, rate: 29 },
  { id: 5, size: Infinity, rate: 29 },
];

/** Legacy — 5 Lakh first slab (pre-reform progressive schedule). */
export const FY_5L_BASE_SLABS = [
  { id: 1, size: 500_000, rate: 1 },
  { id: 2, size: 200_000, rate: 10 },
  { id: 3, size: 300_000, rate: 20 },
  { id: 4, size: 1_000_000, rate: 30 },
  { id: 5, size: 3_000_000, rate: 36 },
  { id: 6, size: Infinity, rate: 39 },
];

/** @deprecated use FY_10L_BASE_SLABS */
export const FY_2083_DEFAULT_SLABS = FY_10L_BASE_SLABS;

export function cloneSlabsForBase(base) {
  const source = base === '5l' ? FY_5L_BASE_SLABS : FY_10L_BASE_SLABS;
  return source.map((s) => ({ ...s }));
}

export function cloneDefaultSlabs() {
  return cloneSlabsForBase('10l');
}

/** Blank starter row — use Reset for preset defaults. */
export function createEmptySlabs() {
  return [{ id: 1, size: null, rate: null, unlimited: true }];
}
