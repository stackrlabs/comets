"use client";

type KeyPressMap = { [key: number]: boolean };

export const Keys = {
  HYPERSPACE: 17,
  ROTATE_LEFT: 37,
  ROTATE_LEFT_A: 65,
  ROTATE_RIGHT: 39,
  ROTATE_RIGHT_D: 68,
  THRUST: 38,
  THRUST_W: 87,
  FIRE: 32,
  START: 13,
};

export class KeyManager {
  keys: KeyPressMap = {};
  prev: KeyPressMap = {};
  touched: boolean = false;
  mc: any;

  constructor() {
    const stage = document.getElementById("game");
    if (!stage) {
      console.debug("Not found");
      return;
    }

    window.onkeydown = (e) => {
      this.keys[e.keyCode] = true;
    };

    window.onkeyup = (e) => {
      this.keys[e.keyCode] = false;
    };

    // this.mc = new Hammer.Manager(stage);

    // const pan = new Hammer.Pan();
    // const tap = new Hammer.Tap();
    // const pinch = new Hammer.Pinch({
    //   enable: true,
    // });

    //   this.mc.add(pan);
    //   this.mc.add(tap, {
    //     interval: 50,
    //   });
    //   this.mc.add(pinch);

    //   this.mc.on("panup", () => {
    //     this.thrust(true);
    //   });

    //   this.mc.on("panleft", () => {
    //     this.rotateLeft(true);
    //   });

    //   this.mc.on("panright", () => {
    //     this.rotateRight(true);
    //   });

    //   this.mc.on("panend", () => {
    //     this.thrust(false);
    //     this.rotateLeft(false);
    //     this.rotateRight(false);
    //   });

    //   this.mc.on("tap", () => {
    //     this.fire(true);
    //     this.touched = true;
    //   });

    //   this.mc.on("pinchout", () => {
    //     this.hyperspace(true);
    //   });

    //   this.mc.on("pinchend", () => {
    //     this.hyperspace(false);
    //   });
  }

  update() {
    Object.keys(this.keys).forEach((key: any) => {
      this.prev[key] = this.keys[key];
    });

    if (this.touched) {
      this.fire(false);
    }

    this.touched = !this.touched;
  }

  clear() {
    this.keys = {};
    this.prev = {};
  }

  isPressed(key: number) {
    return this.prev[key] === false && this.keys[key] === true;
  }

  wasPressed(key: number) {
    return this.prev[key] && !this.keys[key];
  }

  isDown(key: number) {
    return this.keys[key];
  }

  isEnterPressed() {
    return this.keys[Keys.START];
  }

  isRotateLeft() {
    return this.keys[Keys.ROTATE_LEFT] || this.keys[Keys.ROTATE_LEFT_A];
  }

  isRotateRight() {
    return this.keys[Keys.ROTATE_RIGHT] || this.keys[Keys.ROTATE_RIGHT_D];
  }

  isThrust() {
    return this.keys[Keys.THRUST] || this.keys[Keys.THRUST_W];
  }

  isFire() {
    return this.keys[Keys.FIRE];
  }

  isHyperspace() {
    return this.keys[Keys.HYPERSPACE];
  }

  wasRotateLeft() {
    return (
      this.isPressed(Keys.ROTATE_LEFT) || this.isPressed(Keys.ROTATE_LEFT_A)
    );
  }

  wasRotateRight() {
    return (
      this.isPressed(Keys.ROTATE_RIGHT) || this.isPressed(Keys.ROTATE_RIGHT_D)
    );
  }

  wasHyperspace() {
    return this.isPressed(Keys.HYPERSPACE);
  }

  private rotateLeft = (active: boolean) => {
    this.keys[Keys.ROTATE_LEFT] = active;
    this.keys[Keys.ROTATE_LEFT_A] = active;
  };

  private rotateRight = (active: boolean) => {
    this.keys[Keys.ROTATE_RIGHT] = active;
    this.keys[Keys.ROTATE_RIGHT_D] = active;
  };

  private thrust = (active: boolean) => {
    this.keys[Keys.THRUST] = active;
  };

  private fire = (active: boolean) => {
    this.keys[Keys.FIRE] = active;
  };

  private hyperspace = (active: boolean) => {
    this.keys[Keys.HYPERSPACE] = active;
  };
}
