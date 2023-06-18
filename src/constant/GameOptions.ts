export const GameOptions = {
  terrain: {
    // terrain start, in screen height ratio, where 0 = top, 1 = bottom
    start: 0.6,

    // vertical offset where to start placing stuff, in pixels
    stuffOffset: 38,
  },

  // girl x position, in screen width ratio, where 0 = left, 1 = right
  girlPosition: 0.15,

  target: {
    // target position range, in screen width ratio, where 0 = left, 1 = right
    positionRange: {
      from: 0.6,
      to: 0.9,
    },

    // target height range, in pixels
    heightRange: {
      from: 200,
      to: 450,
    },
  },

  targetRings: {
    // number of rings
    amount: 5,

    // ring ratio, to make target look oval, this is the ratio of width compared to height
    ratio: 0.8,

    // ring colors, from external to internal
    color: [0xffffff, 0x5cb6f8, 0xe34d46, 0xf2aa3c, 0x95a53c],

    // ring radii, from external to internal, in pixels
    radius: [50, 40, 40, 30, 20],

    // tolerance of ring radius, can be up to this ratio bigger or smaller
    radiusTolerance: 0.5,
  },

  rainbow: {
    // rainbow rings width, in pixels
    width: 5,

    // rainbow colors
    colors: [
      0xe8512e, 0xfbb904, 0xffef02, 0x65b33b, 0x00aae5, 0x3c4395, 0x6c4795,
    ],
  },

  arrow: {
    // arrow rotation speed, in degrees per second
    rotationSpeed: 180,

    // flying speed
    flyingSpeed: 1000,
  },
};
