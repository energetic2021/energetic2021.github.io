export const VENDORS = ['damiao', 'robstride', 'myactuator', 'hightorque', 'hexfellow', 'hexmovr'];

export const SET_ID_VENDORS = new Set(['damiao', 'robstride']);

export const VENDOR_LABELS = {
  damiao: 'Damiao',
  robstride: 'RobStride',
  myactuator: 'MyActuator',
  hightorque: 'HighTorque',
  hexfellow: 'HexFellow',
  hexmovr: 'Hexmovr',
};

export const DEFAULT_VENDOR_CONFIG = {
  damiao: { enabled: true, model: '4340,4310', startId: '0x01', endId: '0x0A', feedbackBase: '0x10' },
  robstride: { enabled: false, model: 'rs-00', startId: '0x01', endId: '0x10', feedbackId: '0xFD,0xFF,0xFE' },
  myactuator: { enabled: false, model: 'X8', startId: '0x01', endId: '0x10' },
  hightorque: { enabled: false, model: 'hightorque', startId: '0x01', endId: '0x10' },
  hexfellow: { enabled: false, model: 'hexfellow', startId: '0x01', endId: '0x10' },
  hexmovr: { enabled: false, model: 'hexmovr', startId: '0x01', endId: '0x10' },
};
