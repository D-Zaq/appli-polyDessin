import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { Spraypaint } from './spraypaint';

describe('Spraypaint', () => {
    let spraypaint: Spraypaint;
    let ctxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let mouseDownCoord: Vec2;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    const testPixel: Vec2 = { x: 0, y: 0 };
    const DROPLET_SIZE = 2;
    const DIAMETER_SIZE = 50;
    const STROKE_INTERVAL = 100;

    beforeEach(() => {
        ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['save', 'beginPath', 'fill', 'restore']);
        mouseDownCoord = { x: 0, y: 0 };
        strokeThickness = 0;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        const primaryColor = '#000000';
        const secondaryColor = '#000000';
        spraypaint = new Spraypaint(mouseDownCoord, attributes, primaryColor, secondaryColor, DROPLET_SIZE, DIAMETER_SIZE, STROKE_INTERVAL);
        spraypaint.affectedPixels.push(testPixel);
    });

    it('should be created', () => {
        expect(spraypaint).toBeTruthy();
    });
    it('draw should save context', () => {
        spraypaint.draw(ctxSpy);
        expect(ctxSpy.save).toHaveBeenCalled();
    });
    it('draw should beginPath of context', () => {
        spraypaint.draw(ctxSpy);
        expect(ctxSpy.beginPath).toHaveBeenCalled();
    });
    it('draw should draw circle on context', () => {
        spraypaint.draw(ctxSpy);
        expect(ctxSpy.fill).toHaveBeenCalled();
    });
    it('updateDraw should  push new pixels', () => {
        const pixels: string = spraypaint.affectedPixels.toString();
        spraypaint.updateDraw();
        expect(spraypaint.affectedPixels.toString() === pixels).toBe(false);
    });
    it('updateStroke should update mouse x and y', () => {
        spraypaint.mouseX = 0;
        spraypaint.mouseY = 0;
        const newPostion: Vec2 = { x: 1, y: 1 };
        spraypaint.updateStroke(newPostion);
        expect(spraypaint.mouseX).toBe(1);
        expect(spraypaint.mouseY).toBe(1);
    });
});
