import { ImageData } from './ImageData';
import { Path2D } from './path2d';

declare global {
    interface Window {
        ImageData: any;// ImageData; // TODO: Typescript complains about missing properties.
        Path2D: any;
    }
}

window.ImageData = ImageData;
window.Path2D = Path2D;
