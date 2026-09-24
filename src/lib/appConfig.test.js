import { describe, expect, it } from 'vitest';
import { ROBSTRIDE_ARM_PARAM_DEFS } from './appConfig';
import { ROBSTRIDE_HIGH_PRIORITY_PARAM_IDS } from './robstrideParamCatalog';

describe('ROBSTRIDE_ARM_PARAM_DEFS covers the export high-priority set', () => {
  it('includes every high-priority RobStride parameter so the dev param panel can read/write them', () => {
    const panelParamIds = new Set(ROBSTRIDE_ARM_PARAM_DEFS.map((d) => d.paramId));
    const missing = [...ROBSTRIDE_HIGH_PRIORITY_PARAM_IDS].filter((id) => !panelParamIds.has(id));
    expect(missing).toEqual([]);
  });

  it('keeps each def keyed consistently (paramId / rid / variable / dataType)', () => {
    for (const def of ROBSTRIDE_ARM_PARAM_DEFS) {
      expect(typeof def.paramId).toBe('number');
      expect(def.rid).toMatch(/^0x[0-9a-fA-F]+$/);
      expect(def.variable).toBeTruthy();
      expect(def.dataType).toMatch(/^(f32|u8|u16|u32|i8)$/);
    }
  });
});
