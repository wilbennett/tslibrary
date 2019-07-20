import { CanvasColor, Color, Palette, RgbConverter, SColor } from '../../../colors';
import { MathEx, RangeMapper } from '../../../core';
import { Ease } from '../../../easing';
import { Noise, Perlin } from '../../../noise';
import { CanvasContext } from '../../../twod/canvas-context';

abstract class NoiseTester {
    protected ctx: CanvasContext;

    constructor(protected canvas: HTMLCanvasElement) {
        this.ctx = new CanvasContext(canvas);

        this.ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
        this.ctx.scale(1, -1);

        this.left = -canvas.width / 2;
        this.right = -this.left;
        this._top = canvas.height / 2;
        this.bottom = -this._top;

        this.range = canvas.height / 3;
        this.step = 0.005;
        this.offset = this.left;

        this.noise = new Perlin();
        // this.noise.scale = range;
        this.noise.currentIndex = 0.3;
        this.noise.step = this.step;
        this.noise.setOutputRange(-this.range, this.range);
    }

    left: number;
    right: number;
    _top: number;
    bottom: number;
    range: number;
    step: number;
    offset: number;
    noise: Noise;

    protected abstract update(): void;
    protected abstract renderCore(ctx: CanvasContext): void;

    render() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "whitesmoke";
        this.ctx.fillRect(this.left, this.bottom, this.canvas.width, this.canvas.height);

        this.update();
        this.renderCore(this.ctx);
    }

    drawSeries(series: number[], startX: number, color: string) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(startX, series[0]);

        for (let i = 0; i <= series.length; i += 1) {
            this.ctx.lineTo(startX + i, series[i]);
        }

        this.ctx.stroke();
    }
}

class Tester1D extends NoiseTester {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.values = Array.from({ length: this.right - this.left }, () => 0);
        this.valuesF = this.values.slice();
    }

    minV = Number.POSITIVE_INFINITY;
    maxV = Number.NEGATIVE_INFINITY;

    values: number[];
    valuesF: number[];

    protected update() {
        let value = this.noise.getValue(this.offset);
        // console.log(`offset ${offset}: ${this.value}`);
        this.minV = Math.min(value, this.minV);
        this.maxV = Math.max(value, this.maxV);
        this.values.shift();
        this.values.push(value);

        // this.ctx.pushTransform();
        // this.ctx.scale(1, -1);
        // this.ctx.font = "20px Arial";
        // this.ctx.fillStyle = "black";
        // this.ctx.fillText(value.toString(), 10, 10);
        // this.ctx.popTransform();

        value = this.noise.fractal(this.offset);
        this.valuesF.shift();
        this.valuesF.push(value);
    }

    protected renderCore(ctx: CanvasContext) {
        ctx.lineWidth = 1;

        // x axis.
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.line(this.left, 0, this.right, 0).stroke();

        // y axis.
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.line(0, this._top, 0, this.bottom).stroke();

        // Range extents.
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.line(this.left, this.range, this.right, this.range).stroke();
        ctx.line(this.left, -this.range, this.right, -this.range).stroke();

        // Range.
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.line(this.left, this.minV, this.right, this.minV).stroke();
        ctx.line(this.left, this.maxV, this.right, this.maxV).stroke();

        this.drawSeries(this.values, this.left, "green");
        this.drawSeries(this.valuesF, this.left, "purple");

        this.offset += this.step;

        if (this.offset > 100000000)
            this.offset = 0;
    }
}

class Tester1DFluctuation extends Tester1D {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    protected update() {
        this.values = [];
        this.valuesF = [];

        for (let i = this.left; i <= this.right; i += 1) {
            const value = this.noise.getValue2D(i * this.step, this.offset);
            this.values.push(value);
            this.minV = Math.min(value, this.minV);
            this.maxV = Math.max(value, this.maxV);
        }

        for (let i = this.left; i <= this.right; i += 1) {
            // const value = this.noise.fractal2D(i * this.step, this.offset, this.range * 0.4, 5, 1, 2, 1, 0.5);
            const value = this.noise.fractal2D(i * this.step, this.offset, undefined, 5, 1, 2, 1, 0.5);
            this.valuesF.push(value);
        }
    }
}

class Tester2DPattern extends NoiseTester {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.colors = [new SColor(235, 250, 225), new SColor(0, 0, 255), new SColor(235, 250, 225), new SColor(25, 25, 255), new SColor(235, 250, 225)];
        // this.colors = [WebColors.blue, WebColors.white, WebColors.blue];
        // this.colors = [WebColors.red, WebColors.green, WebColors.blue];

        this.palette = new Palette("rgb", 200, Ease.smootherStep, ...this.colors);
        this.colorMap = new RangeMapper(this.noise.minOutput2, this.noise.maxOutput2, 0, this.palette.colors.length - 1);
        this.pcolors = this.palette.colors;
        this.rgbConvert = new RgbConverter();
    }

    colors: CanvasColor[];
    palette: Palette;
    colorMap: RangeMapper;
    pcolors: Color[];
    rgbConvert: RgbConverter;

    protected update() {
    }

    protected renderCore(ctx: CanvasContext) {
        const rand = MathEx.random();

        if (rand < 0.1)
            this.pcolors.push(this.pcolors.shift()!);
        else if (rand < 0.15)
            this.pcolors.unshift(this.pcolors.pop()!);

        const image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const index = y * (this.canvas.width * 4) + x * 4;

                const value = this.noise.getValue2D(x * this.step + this.offset, y * this.step * 10);
                // const value = this.noise.fractal2D(x * this.step + this.offset, y * this.step);
                const color = this.pcolors[Math.round(this.colorMap.convert(value))];
                this.rgbConvert.decode(color.rgbValue, image.data, index, "rgba255");
            }
        }

        ctx.putImageData(image, 0, 0);
        this.drawPalette(ctx, this.palette.colors, this.bottom, 20);

        this.offset += this.step;

        if (this.offset > 100000000)
            this.offset = 0;
    }

    drawPalette(ctx: CanvasContext, colors: Color[], y: number, height: number = 50) {
        ctx.lineWidth = 1;
        const left = 0;
        const right = this.canvas.width;
        const width = right - left;
        const halfWidth = width * 0.5;
        const step = width / colors.length;

        for (let i = 0; i < colors.length; i++) {
            let color = colors[i];
            const x = i * step;
            ctx.beginPath();
            ctx.fillStyle = color.toString();
            ctx.fillRect(x - halfWidth, y, step + 1, height);
        }
    }
}

console.clear();
const w = 150;
const h = 100;
const canvas1 = <HTMLCanvasElement>document.getElementById("canvas1");
canvas1.width = w;
canvas1.height = h;

const canvas2 = <HTMLCanvasElement>document.getElementById("canvas2");
canvas2.width = w;
canvas2.height = h;

const canvas3 = <HTMLCanvasElement>document.getElementById("canvas3");
canvas3.width = w;
canvas3.height = h;

let frame = 0;

const tests = [
    new Tester1D(canvas1),
    new Tester1DFluctuation(canvas2),
    new Tester2DPattern(canvas3),
];

function loop() {
    try {
        tests.forEach(t => t.render());

        // if (frame < 10)
        requestAnimationFrame(loop);
        frame++;
    } catch (e) {
        console.log(`frame: ${frame}`);
        console.log(e);
    }
}

requestAnimationFrame(loop);
