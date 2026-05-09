export const ANOMALY_DATA = {
  void: [
    { 
      id: 'void-1', 
      title: 'Stellar Nebula', 
      position: [0, 0, 5.5], 
      prompt: "Explain the stellar nebula simply. Describe these giant, glowing clouds of space dust. Crucially, mention that this nebula was primarily composed of Hydrogen and Helium." 
    },
    { 
      id: 'void-2', 
      title: 'Gravitational Collapse', 
      position: [2.0, -2.0, 4.0], 
      prompt: "Explain how Gravity caused this solar nebula to collapse roughly 4.6 Billion Years Ago. Mention that as it collapsed, its rate of rotation increased significantly." 
    },
    { 
      id: 'void-3', 
      title: 'Accretion Disk', 
      position: [-2.5, 3.0, 4.0], 
      prompt: "Explain the term 'Accretion'. Describe how it is the gradual accumulation of dust and gas to form planetesimals, like space rocks clumping together to build planets." 
    }
  ],
  hadean: [
    { 
      id: 'had-1', 
      title: 'Hellish Origins', 
      position: [3.8, 2.0, 3.0], 
      prompt: "Explain that the name 'Hadean' originates from Hades, the Greek god of the underworld. Mention that early Earth was largely molten due to frequent asteroid impacts and radioactive decay." 
    },
    { 
      id: 'had-2', 
      title: 'Core Formation', 
      position: [0.0, -4.0, 3.0], 
      prompt: "Describe how heavier elements slowly sank all the way to the center of the molten Earth, which caused the Iron Core to form." 
    },
    { 
      id: 'had-3', 
      title: 'Theia Collision', 
      position: [-3.0, 1.5, 4.0], 
      prompt: "Explain how a celestial body named Theia collided with the early Earth, and how the broken pieces eventually formed our Moon." 
    },
    { 
      id: 'had-4', 
      title: 'Cooling Patches', 
      position: [1.5, 0.0, 4.5], 
      prompt: "Explain that despite the extreme heat, by the end of the eon, cooling patches allowed small amounts of Liquid Water to finally exist on the surface." 
    }
  ],
  archean: [
    { 
      id: 'arch-1', 
      title: 'Archean Dawn', 
      position: [1.0, -3.0, 4.5], 
      prompt: "State that the Archean eon began 4.0 Billion Years Ago. Describe how the Earth was finally cooling and changing from its previous state of molten magma into a solid crust." 
    },
    { 
      id: 'arch-2', 
      title: 'Anoxic Atmosphere', 
      position: [3.0, 2.0, 3.0], 
      prompt: "Describe the early Archean sky. Mention that while the air had gases like methane, Oxygen was entirely absent." 
    },
    { 
      id: 'arch-3', 
      title: 'First Life', 
      position: [-2.5, 3.0, 3.5], 
      prompt: "Explain that the very first life appeared during this time. Describe them as simple, single-celled prokaryotes floating in the ancient oceans." 
    },
    { 
      id: 'arch-4', 
      title: 'Cyanobacteria', 
      position: [-2.5, -1.0, 4.5], 
      prompt: "Explain that Cyanobacteria emerged and became the very first known oxygen-producing organisms on Earth, creating fresh air." 
    }
  ],
  proterozoic: [
    { 
      id: 'prot-1', 
      title: 'Great Oxidation', 
      position: [1.5, 4.0, 2.5], 
      prompt: "Describe the Great Oxidation Event, where the oceans and sky filled with oxygen. Mention that this unfortunately caused a mass extinction for most anaerobic life." 
    },
    { 
      id: 'prot-2', 
      title: 'Ozone Shield', 
      position: [-3.0, 1.0, 4.0], 
      prompt: "Explain how the newly created oxygen floated high up into the sky and formed the Ozone Layer, a protective shield around the planet." 
    },
    { 
      id: 'prot-3', 
      title: 'Eukaryotes', 
      position: [2.5, -2.5, 3.5], 
      prompt: "Describe how life became more advanced! A new, more complex cellular structure called Eukaryotes emerged in the oceans." 
    },
    { 
      id: 'prot-4', 
      title: 'Snowball Earth', 
      position: [0.0, -4.5, 2.0], 
      prompt: "Explain that the sudden decrease in methane in the air caused a massive Ice Age, freezing the world into what we call 'Snowball Earth'." 
    }
  ],
  mesozoic: [
    { 
      id: 'meso-1', 
      title: 'Supercontinent Pangea', 
      position: [-4.0, 1.5, -2.0], 
      prompt: "Describe Pangea, the massive supercontinent that stuck all the land together and dominated the globe at the start of the Mesozoic era." 
    },
    { 
      id: 'meso-2', 
      title: 'Tectonic Rift', 
      position: [2.0, 3.0, 3.5], 
      prompt: "Explain how Tectonic plate movement was the massive geological force that eventually tore Pangea apart into separate continents." 
    },
    { 
      id: 'meso-3', 
      title: 'Age of Dinosaurs', 
      position: [-1.5, -3.0, 4.0], 
      prompt: "Mention that this era is made of the Triassic, Jurassic, and Cretaceous periods (not the Cambrian), and that Dinosaurs completely dominated the terrestrial ecosystems." 
    },
    { 
      id: 'meso-4', 
      title: 'Asteroid Impact', 
      position: [3.5, 0.0, 3.0], 
      prompt: "Explain that a massive asteroid impact was the catastrophic event that ultimately ended the Mesozoic era and wiped out the dinosaurs." 
    }
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