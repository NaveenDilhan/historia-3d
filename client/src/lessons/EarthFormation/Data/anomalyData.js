export const ANOMALY_DATA = {
  void: [
    { id: 'void-1', title: 'Stellar Nebula', position: [0, 0, 5.5], prompt: "Describe the raw materials of the solar nebula before they condensed into Earth. Address the user directly as an observer." },
    { id: 'void-2', title: 'Protoplanetary Disk', position: [-2.5, 3.0, 4.0], prompt: "Explain how gravity caused cosmic dust and gas to clump together to form early planetesimals." }
  ],
  hadean: [
    { id: 'had-1', title: 'Magma Ocean', position: [3.8, 2.0, 3.0], prompt: "Describe the violent, completely molten state of the Hadean Earth's surface." },
    { id: 'had-2', title: 'Theia Collision', position: [-3.0, 1.5, 4.0], prompt: "Explain the giant impact hypothesis involving the Mars-sized body Theia, leading to the moon's formation." }
  ],
  archean: [
    { id: 'arch-1', title: 'Cooling Crust', position: [1.0, -3.0, 4.5], prompt: "Describe how Earth's crust finally began to cool enough to form solid rock and early shallow oceans." },
    { id: 'arch-2', title: 'Cyanobacteria', position: [-2.5, -1.0, 4.5], prompt: "Detail the emergence of cyanobacteria and their revolutionary ability to photosynthesize." }
  ],
  proterozoic: [
    { id: 'prot-1', title: 'Great Oxidation', position: [1.5, 4.0, 2.5], prompt: "Explain the catastrophic and transformative Great Oxidation Event." },
    { id: 'prot-2', title: 'Snowball Earth', position: [0.0, -4.5, 2.0], prompt: "Describe the massive glaciations of the 'Snowball Earth' period caused by shifting atmospheric gases." }
  ],
  mesozoic: [
    { id: 'meso-1', title: 'Supercontinent Pangea', position: [-4.0, 1.5, -2.0], prompt: "Provide a vivid description of the massive supercontinent Pangea." },
    { id: 'meso-2', title: 'Tectonic Rift', position: [2.0, 3.0, 3.5], prompt: "Explain the intense tectonic forces that began to tear Pangea apart." }
  ]
};

export const getLockedEraKey = (threshold) => {
    if (threshold === 0.0) return 'void';
    if (threshold === 0.2) return 'hadean';
    if (threshold === 0.4) return 'archean';
    if (threshold === 0.6) return 'proterozoic';
    if (threshold === 0.8) return 'mesozoic';
    return null;
};

export const getNextThreshold = (eraKey) => {
    if (eraKey === 'void') return 0.2;
    if (eraKey === 'hadean') return 0.4;
    if (eraKey === 'archean') return 0.6;
    if (eraKey === 'proterozoic') return 0.8;
    if (eraKey === 'mesozoic') return 1.0;
    return 1.0;
};