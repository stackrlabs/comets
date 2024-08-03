const VOLUME = 0.5;

let soundOn: boolean = true;
interface ISound {
  play: () => void;
  stop: () => void;
  volume: (a: number) => void;
  on: (s: any, f: any) => void;
  off: () => void;
  _origVolume: 0;
}

export const all: ISound[] = [];

function createSound(options: any) {
  let count = 0;

  let sound: ISound = {
    play: () => {},
    stop: () => {},
    volume: () => {},
    on: (s, f) => {},
    off: () => {},
    _origVolume: 0,
  };

  try {
    if (window) {
      const { Howl } = require("howler");
      sound = new Howl(options);
    }
  } catch (e) {}

  sound.on("end", () => {
    if (options.max) {
      count--;
    }
  });

  const play = sound.play.bind(sound);
  const canPlay = options.max ? count < options.max && soundOn : soundOn;

  sound.play = () => {
    if (soundOn) {
      if (options.max) {
        if (count < options.max) {
          play();
          count++;
        }
      } else {
        play();
      }
    }
  };

  sound._origVolume = options.volume;

  all.push(sound);
  return sound;
}

export const fire = createSound({
  src: ["./sounds/fire.wav"],
  volume: 0.2,
});

export const thrust = createSound({
  src: ["./sounds/thrust.wav"],
  volume: 0.3,
});

export const alienFire = createSound({
  src: ["./sounds/sfire.wav"],
  volume: VOLUME,
});

export const largeExplosion = createSound({
  src: ["./sounds/explode1.wav"],
  volume: VOLUME,
  max: 2,
});

export const mediumExplosion = createSound({
  src: ["./sounds/explode2.wav"],
  volume: VOLUME,
  max: 2,
});

export const smallExplosion = createSound({
  src: ["./sounds/explode3.wav"],
  volume: VOLUME,
  max: 2,
});

export const largeAlien = createSound({
  src: ["./sounds/lsaucer.wav"],
  volume: VOLUME,
  loop: true,
});

export const smallAlien = createSound({
  src: ["./sounds/ssaucer.wav"],
  volume: VOLUME,
  loop: true,
});

export const thumpLo = createSound({
  src: ["./sounds/thumplo.wav"],
  volume: 0.3,
});

export const thumpHi = createSound({
  src: ["./sounds/thumphi.wav"],
  volume: 0.3,
});

export const extraLife = createSound({
  src: ["./sounds/life.wav"],
  volume: 0.5,
});

export const powerup = createSound({
  src: ["./sounds/powerup.wav"],
  volume: 0.5,
});

export const getPowerup = createSound({
  src: ["./sounds/getpowerup.wav"],
  volume: 0.5,
});

export const Sound = {
  on: () => {
    soundOn = true;
    all.forEach((sound) => sound.volume(sound._origVolume));
  },
  off: () => {
    soundOn = false;
    // do not "stop" sound, just set volume to 0.
    all.forEach((sound) => sound.volume(0));
  },
  stop: () => {
    all.forEach((sound) => sound.stop());
  },
};
