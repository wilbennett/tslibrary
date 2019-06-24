export { };

const canvas = <HTMLCanvasElement>document.getElementById("canvas1");
canvas.width = 300;
canvas.height = 300;
const ctx = canvas.getContext("2d");

if (!ctx)
    throw new Error("Unable to get context.");

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const transform = ctx.getTransform();
console.log(transform);
