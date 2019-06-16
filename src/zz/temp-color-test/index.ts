import { Color, ColorData, SColor } from '../../colors';
import { MathEx } from '../../core';

console.clear();

const c = new SColor("rgb(1, 2, 3)");
console.log(c.toString());
c.r = 0;
c.g = 0;
// c.b = 255;
c.set("b", 255);
console.log(c.toString());

const fore = new SColor(15, 15, 15);
const back = new SColor(255, 255, 255);
const cont = Color.calcContrast(fore, back);
console.log(cont);
console.log("");

// @ts-ignore - unused param.
function fixed(data: ColorData, precision: number) {
    const values = Array.from(data);
    // return values.map(v => v.toFixed(precision));
    // return values.map(v => v.toPrecision(Math.max(precision, 1)));
    return values.map(v => v.toLocaleString());
}

function testConversion(color: Color) {
    const rgb = color.rgbValue;
    console.log(`${color.toString()} ${MathEx.toHex(color.colorValue)} ${MathEx.toHex(rgb)}`);
    console.log(`..Is Web: ${color.isWebColor}, Frozen: ${color.isFrozen},  ${color.name}`);

    for (let conv of Color.converters) {
        const value = conv.fromRgb(rgb);
        console.log("");
        console.log(`${conv.formats[0]} ${MathEx.toHex(value).toUpperCase()} (${MathEx.toHex(conv.toRgb(value)).toUpperCase()} - ${MathEx.toHex(rgb).toUpperCase()})`);
        const objs = [];
        let w1 = 0;
        let w2 = 0;
        console.group();

        // for (let i = 0; i < conv.channelCount; i++) {
        //   console.log(`...${i}: ${conv.get(i, value)}`);
        // }

        for (const format of conv.formats) {
            let temp: number[] = [];
            const obj = { format: format, text: conv.toString(value, format), values: fixed(conv.decode(value, temp, 0, format), 3) };
            w1 = Math.max(w1, obj.format.length);
            w2 = Math.max(w2, obj.text.length);
            objs.push(obj);
        }

        for (const obj of objs) {
            console.log(`.  ${obj.format.padStart(w1)}: ${obj.text.padEnd(w2)} [${obj.values}]`);
        }

        // console.table(objs);
        console.groupEnd();
    }

    console.log(`.`);
}

try {
    // testConversion(new SColor(255, 0, 0, 1));
    testConversion(new SColor("rgb(255, 0, 0, 0.2)"));
    // testConversion(new SColor("rgba(10%, 20%, 30%, 0.3)"));
    // testConversion(new SColor("rgb(500, 0, 0, 0.4)"));
    // testConversion(new SColor("rgb", [100, 0, 0, 0.5]));
    // testConversion(new SColor("#F00F"));
    // testConversion(new SColor("#FF0000FF"));
    // testConversion(new SColor("#FF000080"));
    // testConversion(new SColor("hsl", 0, 100, 50, 0.6));
    // testConversion(new SColor("hsl(480, 100%, 50%, 0.7)"));
    // testConversion(new SColor("hsl(270,60%,70%)"));
    // testConversion(new SColor("hsl(270, 60%, 70%)"));
    // testConversion(new SColor("hsl(270 60% 70%)"));
    // testConversion(new SColor("hsl(270deg, 60%, 70%)"));
    // testConversion(new SColor("hsl(4.71239rad, 60%, 70%)"));
    // testConversion(new SColor("hsl(0.75turn, 60%, 70%)"));
    // testConversion(new SColor("hsl(0.75199turn, 60%, 70%, 0.243)"));

    // testConversion(new SColor(255, 0, 0, 1, true, "red", true));
    // testConversion(new SColor(255, 0, 0, 1, true, "", true));
    // testConversion(new SColor(255, 0, 0, 1, true, "tester", false));
    // testConversion(new SColor(0, 255, 255, 1, true, "tester", false));

    // testConversion(new SColor("red"));
} catch (e) {
    console.log(`${e.stack}`);
}

try {
    const c = new SColor("rgb", [100, 0, 0, 0.6]).freeze();
    c.g = 1;
    c.name = "red1";
    c.setWebColor();
} catch (e) {
    console.log(`${e}`);
}
