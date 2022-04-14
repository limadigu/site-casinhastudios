export class Text {
    constructor(content = "Hello!", font = "8px sans-serif", fillStyle = "red", x = 0, y = 0) {
        this.lineWidth = 1;
        this.content = content;
        this.font = font;
        this.fillStyle = fillStyle;
        this.x = x;
        this.y = y;
        this.textBaseline = 'top';
        this.strokeText = "none";
        this.width = 0;
        this.height = 0;
        this.visible = true;
    }
    render(ctx) {
        ctx.font = this.font;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;
        if (this.width === 0)
            this.width = ctx.measureText(this.content).width;
        if (this.height === 0)
            this.height = ctx.measureText("M").actualBoundingBoxAscent;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.content, 0, 0);
        if (this.strokeText !== "none")
            ctx.strokeText('', 0, 0);
    }
}
