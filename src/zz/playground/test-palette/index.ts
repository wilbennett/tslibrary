import { Color, WebColors } from '../../../colors';
import { Palette, PaletteBuilder } from '../../../colors/palette';
import { EaseManager } from '../../../easing';

export { };

const canvas = <HTMLCanvasElement>document.getElementById("canvas1");
canvas.width = 300;
canvas.height = 300;
const ctx = canvas.getContext("2d");

if (!ctx)
    throw new Error("Unable to get context.");

ctx.fillStyle = "whitesmoke";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var b = new PaletteBuilder(["red", "green"]);
b = new PaletteBuilder("blue");
b = new PaletteBuilder("green", "blue");

let height = 30;
let y = 0;

// let palette = new Palette(100, WebColors.red, WebColors.green, WebColors.blue);
//let colorStops = new Array<number>(3);
let colorStops = new Float32Array(3);
Palette.calcColorStops(3, colorStops);
let palette = new Palette(100, colorStops, WebColors.red, WebColors.green, WebColors.blue);
drawPalette(ctx, palette.colors, y, height);
y += height + 2;
palette = new Palette("lrgb", 100, WebColors.red, WebColors.green, WebColors.blue);
drawPalette(ctx, palette.colors, y, height);
y += height + 2;
// palette = new Palette("hsl", 100, WebColors.red, WebColors.green, WebColors.blue);
palette = Palette.build(WebColors.red, WebColors.green, WebColors.blue).tween("hsl").count(100).palette;
drawPalette(ctx, palette.colors, y, height);
y += height + 2;
height = 10;

for (let count = 2; count <= 100; count += 4) {
    const ease = getRandomEase();
    const palette = new Palette(count, ease.ease, WebColors.red, WebColors.green, WebColors.blue);
    drawPalette(ctx, palette.colors, y, height);
    y += height + 2;
    // console.log(palette.colors.map(c => c.toString()));
    // console.log(palette.colorStops);
}

function getRandomEase() {
    let ease = EaseManager.getRandom();

    while (/Catmull|Elastic|Back/i.test(ease.name)) {
        ease = EaseManager.getRandom();
    }

    // console.log(`${ease.name}`);
    return ease;
}

function drawPalette(ctx: CanvasRenderingContext2D, colors: Color[], y: number, height: number = 50) {
    ctx.lineWidth = 1;
    const left = 0;
    const right = ctx.canvas.width;
    const width = right - left;
    const step = width / colors.length;

    for (let i = 0; i < colors.length; i++) {
        let color = colors[i];
        const x = i * step;
        ctx.beginPath();
        ctx.fillStyle = color.toString();
        ctx.fillRect(x, y, step + 1, height);
    }
}