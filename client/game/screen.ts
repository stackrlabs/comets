import { Draw } from './draw';

export const WIDTH: number = 960;
export const HEIGHT: number = 720;
export const OBJECT_SCALE: number = .75;

export class Screen implements Rect {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    x: number = 0;
    y: number = 0;
    width: number;
    height: number;
    draw: Draw;
    width2: number;
    height2: number;
    
    private _fontXL: number;
    private _fontL: number;
    private _fontM: number;
    private _fontS: number;
    private _objectScale: number;
    private _shipRect: Rect;
    private _pointSize: number;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.draw = new Draw(this.ctx);
        this.init();

        window.addEventListener('resize', () => {
            this.init();
        });
    }

    init() {
        this.canvas.width = WIDTH; 
        this.canvas.height = HEIGHT; 
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.width2 = this.width / 2;
        this.height2 = this.height / 2;

        this._fontXL = 48;
        this._fontL = 24;
        this._fontM = 18; 
        this._fontS = 10;
        this._objectScale = OBJECT_SCALE;

        this._pointSize = 4 * this._objectScale;

        const offRect = (120 * this._objectScale);

        this._shipRect = {
            x: this.width2 - offRect,
            y: this.height2 - offRect,
            width: offRect * 2,
            height: offRect * 2
        }
    }

    get font() {
        let self = this;
        return {
            get xlarge() {
                return self._fontXL;
            },
            get large() {
                return self._fontL;
            },
            get medium() {
                return self._fontM;
            },
            get small() {
                return self._fontS;
            }
        }
    }

    get objectScale() {
        return this._objectScale;
    }
    
    get pointSize() {
        return this._pointSize;
    }
    
    get shipRect() {
        return this._shipRect;
    }

    preShake() {
        this.ctx.save();
        var dx = Math.random() * 10;
        var dy = Math.random() * 10;
        this.ctx.translate(dx, dy);  
    }

    postShake() {
        this.ctx.restore();
    }
}

export default new Screen();
