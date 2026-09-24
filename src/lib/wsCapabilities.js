export const WS_V1_FALLBACK_CAPABILITIES = Object.freeze({
  api_version: 'v1',
  vendors: {
    damiao: {
      transports: ['auto', 'socketcan', 'socketcanfd', 'dm-serial'],
      modes: ['mit', 'pos_vel', 'vel', 'force_pos'],
      ops_unified: ['scan', 'set_id', 'enable', 'disable', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: ['write_register_u32', 'write_register_f32', 'get_register_u32', 'get_register_f32'],
    },
    robstride: {
      transports: ['auto', 'socketcan', 'socketcanfd'],
      modes: ['mit', 'pos_vel', 'vel'],
      ops_unified: ['scan', 'set_id', 'enable', 'disable', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: ['robstride_ping', 'robstride_read_param', 'robstride_write_param'],
    },
    hexfellow: {
      transports: ['auto', 'socketcanfd'],
      modes: ['mit', 'pos_vel'],
      ops_unified: ['scan', 'enable', 'disable', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: [],
    },
    myactuator: {
      transports: ['auto', 'socketcan', 'socketcanfd'],
      modes: ['pos_vel', 'vel'],
      ops_unified: ['scan', 'enable', 'disable', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: ['status', 'version', 'mode-query'],
    },
    hightorque: {
      transports: ['auto', 'socketcan'],
      modes: ['mit', 'vel'],
      ops_unified: ['scan', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: ['read'],
    },
    hexmovr: {
      transports: ['auto', 'socketcan'],
      modes: ['mit', 'pos_vel', 'vel'],
      ops_unified: ['scan', 'enable', 'disable', 'stop', 'state_once', 'status', 'verify'],
      ops_vendor_native: ['set_zero_position'],
    },
  },
});

export function normalizeGatewayCapabilities(raw) {
  const data = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  if (!data || typeof data !== 'object' || !data.vendors || typeof data.vendors !== 'object') {
    return WS_V1_FALLBACK_CAPABILITIES;
  }

  const vendors = { ...WS_V1_FALLBACK_CAPABILITIES.vendors };
  Object.entries(data.vendors).forEach(([vendor, value]) => {
    if (!value || typeof value !== 'object') return;
    vendors[vendor] = {
      ...(vendors[vendor] || {}),
      ...value,
      modes: Array.isArray(value.modes) ? value.modes : vendors[vendor]?.modes || [],
      ops_unified: Array.isArray(value.ops_unified) ? value.ops_unified : vendors[vendor]?.ops_unified || [],
      ops_vendor_native: Array.isArray(value.ops_vendor_native)
        ? value.ops_vendor_native
        : vendors[vendor]?.ops_vendor_native || [],
      transports: Array.isArray(value.transports) ? value.transports : vendors[vendor]?.transports || [],
    };
  });

  return {
    ...WS_V1_FALLBACK_CAPABILITIES,
    ...data,
    vendors,
  };
}

export function modesForVendor(capabilities, vendor) {
  const modes = capabilities?.vendors?.[vendor]?.modes;
  if (Array.isArray(modes) && modes.length > 0) return modes;
  return WS_V1_FALLBACK_CAPABILITIES.vendors[vendor]?.modes || ['vel'];
}

export function supportsVendorMode(capabilities, vendor, mode) {
  return modesForVendor(capabilities, vendor).includes(mode);
}
