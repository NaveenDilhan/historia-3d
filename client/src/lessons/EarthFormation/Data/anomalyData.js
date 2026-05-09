export const ANOMALY_DATA = {
  void: [
    { id: 'void-1', title: 'Stellar Nebula', position: [0, 0, 5.5], prompt: "Explain the stellar nebula simply. Describe these giant, glowing clouds of space dust and gas as the ultimate building blocks that make up everything in space." },
    { id: 'void-2', title: 'Protoplanetary Disk', position: [-2.5, 3.0, 4.0], prompt: "Explain how floating space dust and rocks started bumping into each other and clumping together like rolling snowballs to make the very first pieces of our planet." }
  ],
  hadean: [
    { id: 'had-1', title: 'Magma Ocean', position: [3.8, 2.0, 3.0], prompt: "Describe the early Earth as a giant, super-hot ball of melted rock. Picture a glowing, bubbling sea of orange lava everywhere you look." },
    { id: 'had-2', title: 'Theia Collision', position: [-3.0, 1.5, 4.0], prompt: "Explain how a giant space rock crashed into Earth a long time ago, and how the broken pieces floated up into the sky to clump together and make our Moon." }
  ],
  archean: [
    { id: 'arch-1', title: 'Cooling Crust', position: [1.0, -3.0, 4.5], prompt: "Describe how the super-hot Earth finally started to cool down, forming a hard, dark rocky crust and allowing the very first puddles of water to gather." },
    { id: 'arch-2', title: 'Cyanobacteria', position: [-2.5, -1.0, 4.5], prompt: "Explain how tiny, invisible living things appeared in the water and started using sunlight to make fresh air for the very first time." }
  ],
  proterozoic: [
    { id: 'prot-1', title: 'Great Oxidation', position: [1.5, 4.0, 2.5], prompt: "Describe how the sky and oceans slowly filled up with fresh, breathable oxygen, changing the colors of the world and making it a safer place." },
    { id: 'prot-2', title: 'Snowball Earth', position: [0.0, -4.5, 2.0], prompt: "Explain a crazy time when the weather got so cold that the entire Earth froze over into a giant snowball covered in thick white ice." }
  ],
  mesozoic: [
    { id: 'meso-1', title: 'Supercontinent Pangea', position: [-4.0, 1.5, -2.0], prompt: "Describe a time when all the land on Earth was stuck together in one giant puzzle piece, totally surrounded by a huge, deep ocean." },
    { id: 'meso-2', title: 'Tectonic Rift', position: [2.0, 3.0, 3.5], prompt: "Explain how the ground rumbled and slowly broke that giant land puzzle piece apart, sending the pieces floating away to become the continents we live on today." }
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