export class Key {
    constructor(keyCode) {
        this.code = keyCode;
        this.isDown = false;
        this.isUp = true;
        this.press = undefined;
        this.release = undefined;
    }
    //The `downHandler`
    downHandler(event) {
        if (event.code === this.code) {
            if (this.isUp && this.press)
                this.press();
            this.isDown = true;
            this.isUp = false;
        }
        //Prevent the event's default behavior
        event.preventDefault();
    }
    ;
    //The `upHandler`
    upHandler(event) {
        if (event.code === this.code) {
            if (this.isDown && this.release)
                this.release();
            this.isDown = false;
            this.isUp = true;
        }
        event.preventDefault();
    }
    ;
}
export function keyboard(keyCode) {
    let key = new Key(keyCode);
    //Attach event listeners
    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    //Return the key object
    return key;
}
export class Engine {
    constructor(canvas, game) {
        this.paused = false;
        this.justResumed = false;
        this.bctx = null;
        this.bgctx = null;
        this.cctx = null;
        this.canvas = canvas;
        this.cctx = canvas.getContext('2d');
        this.game = game;
        this.paused = false;
        this.backgroundCanvas = document.createElement('canvas');
        this.blocksCanvas = document.createElement('canvas');
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
        this.justResumed = true;
        this.gameLoop(this.game.lastUpdate);
    }
    gameLoop(timestamp) {
        if (!this.paused)
            requestAnimationFrame(this.gameLoop.bind(this));
        if (this.justResumed && this.game.lastUpdate !== timestamp) {
            this.game.lastUpdate = timestamp;
            this.justResumed = false;
        }
        this.game.update(timestamp);
        this.render();
    }
    start() {
        this.gameLoop(0);
    }
    render() {
        this.cctx = this.canvas.getContext('2d');
        if (this.cctx != null) {
            this.cctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.game.backgroundChanged) {
                this.backgroundCanvas.width = this.canvas.width;
                this.backgroundCanvas.height = this.canvas.height;
                this.bgctx = this.backgroundCanvas.getContext('2d');
                this.bgctx?.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
                this.game.getObjectsToRender(0).forEach(sprite => {
                    if (sprite != null)
                        this.displaySprite(sprite, this.backgroundCanvas);
                });
                this.game.backgroundChanged = false;
            }
            this.cctx.drawImage(this.backgroundCanvas, 0, 0);
            if (this.game.blocksChanged) {
                this.blocksCanvas.width = this.canvas.width;
                this.blocksCanvas.height = this.canvas.height;
                this.bctx = this.blocksCanvas.getContext('2d');
                this.bctx?.clearRect(0, 0, this.blocksCanvas.width, this.blocksCanvas.height);
                this.game.getObjectsToRender(1).forEach(sprite => {
                    if (sprite != null)
                        this.displaySprite(sprite, this.blocksCanvas);
                });
                this.game.blocksChanged = false;
            }
            this.cctx.drawImage(this.blocksCanvas, 0, 0);
            this.game.getObjectsToRender(2).forEach(sprite => {
                if (sprite != null)
                    this.displaySprite(sprite, this.canvas);
            });
            this.game.getTextsToRender().forEach(text => {
                this.displayText(text);
            });
        }
    }
    displaySprite(sprite, canvas) {
        let gameScale = this.game.globalScale;
        if (sprite.visible
            && (sprite.x * gameScale) < canvas.width + sprite.width
            && (sprite.x + sprite.width) * gameScale >= -sprite.width
            && sprite.y * gameScale < canvas.height + sprite.height
            && (sprite.y + sprite.height) * gameScale >= -sprite.height) {
            let ctx = canvas.getContext('2d');
            if (ctx != null) {
                //Save the canvas's present state
                ctx.save();
                //Shift the canvas to the center of the sprite's position
                //ctx.translate((sprite.x - sprite.centerX) * gameScale , (sprite.y - sprite.centerY) * gameScale );
                ctx.translate((sprite.x) * gameScale, (sprite.y) * gameScale);
                //Set the sprite's `rotation`, `alpha` and `scale`
                let angle = sprite.rotation * Math.PI / 180;
                ctx.rotate(angle);
                ctx.globalAlpha = sprite.alpha;
                ctx.scale(sprite.scaleX * gameScale, sprite.scaleY * gameScale);
                //Display the sprite's optional drop shadow
                if (sprite.shadow) {
                    ctx.shadowColor = sprite.shadowColor;
                    ctx.shadowOffsetX = sprite.shadowOffsetX;
                    ctx.shadowOffsetY = sprite.shadowOffsetY;
                    ctx.shadowBlur = sprite.shadowBlur;
                }
                //Use the sprite's own `render` method to draw the sprite
                if (sprite.render)
                    sprite.render(ctx);
                //Restore the canvas to its previous state
                ctx.restore();
            }
        }
    }
    displayText(sprite) {
        if (sprite.visible) {
            let gameScale = this.game.globalScale;
            let ctx = this.cctx;
            if (ctx != null) {
                ctx.save();
                ctx.translate((sprite.x) * gameScale, (sprite.y) * gameScale);
                //ctx.globalAlpha = sprite.alpha;
                if (sprite.render)
                    sprite.render(ctx);
                ctx.restore();
            }
        }
    }
}
