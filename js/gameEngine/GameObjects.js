export var ObjectTypes;
(function (ObjectTypes) {
    ObjectTypes[ObjectTypes["Block"] = 0] = "Block";
    ObjectTypes[ObjectTypes["Ship"] = 1] = "Ship";
    ObjectTypes[ObjectTypes["Ball"] = 2] = "Ball";
    ObjectTypes[ObjectTypes["Wall"] = 3] = "Wall";
    ObjectTypes[ObjectTypes["Other"] = 4] = "Other";
})(ObjectTypes || (ObjectTypes = {}));
;
export class GameObject {
    constructor(x, y, width, height) {
        this.asset = null;
        this.visible = true;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.rotation = 0;
        this.alpha = 1;
        this.scaleX = 1;
        this.scaleY = 1;
        this.type = ObjectTypes.Other;
        this.vx = 0;
        this.vy = 0;
        this.radius = Math.sqrt(Math.pow(this.centerX, 2) + Math.pow(this.centerY, 2));
        this.shadow = false;
        this.shadowColor = "rgba(30, 30, 30, 0.5)";
        this.shadowOffsetX = 2;
        this.shadowOffsetY = 2;
        this.shadowBlur = 1;
        this.layer = 0;
    }
    ;
    setScale(scale) {
        this.scaleX = scale;
        this.scaleY = scale;
    }
    setAsset(asset) {
        this.asset = asset;
    }
    render(context) {
        if (this.asset != null)
            context.drawImage(this.asset, -this.centerX, -this.centerY, this.width, this.height);
    }
    update(deltaTime) {
        this.x = this.x + (deltaTime * this.vx);
        this.y = this.y + (deltaTime * this.vy);
    }
}
;
export class Ball extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.hold = false;
        this.stickPos = 0;
        this.game = null;
        this.type = ObjectTypes.Ball;
    }
    setGame(game) {
        this.game = game;
    }
    update(deltaTime) {
        if (!this.hold) {
            super.update(deltaTime);
            if (this.checkBounds())
                this.checkCollisions();
        }
        else {
            if (this.game != null && this.game.ship != undefined)
                this.x = this.game.ship.x + this.stickPos;
        }
    }
    stick(ship) {
        this.hold = true;
        this.stickPos = this.x - ship.x;
    }
    release(vx, vy) {
        this.hold = false;
        this.vx = vx;
        this.vy = vy;
    }
    checkBounds() {
        if (this.game == null)
            return true;
        if ((this.x - this.centerX) < this.game.left && this.vx < 0) {
            this.vx = this.vx * -1.0;
            return false;
        }
        else if ((this.y - this.centerY) < this.game.top && this.vy < 0) {
            this.vy = this.vy * -1.0;
            return false;
        }
        else if ((this.y + this.centerY) > this.game.bottom && this.vy > 0) {
            this.game.destroyBall(this);
            return false;
        }
        else if ((this.x + this.centerX) > this.game.right && this.vx > 0) {
            this.vx = this.vx * -1.0;
            return false;
        }
        return true;
    }
    checkCollisions() {
        if (this.game != null)
            for (let obj of this.game?.getCollidables(this.x, this.y)) {
                if (obj == null)
                    continue;
                let dist = this.distance(this.x, obj.x, this.y, obj.y);
                if (dist < (this.radius + obj.radius) && this.fineCheckCollision(obj)) {
                    if (obj.type === ObjectTypes.Block) {
                        if ((this.vy > 0 && ((this.y + this.centerY - 5) <= (obj.y - obj.centerY)))
                            || (this.vy < 0 && ((this.y - this.centerY + 5) >= (obj.y + obj.centerY)))
                            || Math.abs(this.x - obj.x) <= 28)
                            this.vy = this.vy * -1.0;
                        else
                            this.vx = this.vx * -1.0;
                        this.game.hitBlock(obj);
                        let norm = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
                        let vel = Math.min(norm + this.game.incVel, this.game.maxVel);
                        this.vx = (this.vx / norm) * vel;
                        this.vy = (this.vy / norm) * vel;
                    }
                    else if (obj.type === ObjectTypes.Ship && obj.y > this.y) {
                        let vel = Math.min(Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2)) + this.game.incVel, this.game.maxVel);
                        let posx = (this.x - obj.x + (Math.random() * 20.0 - 10)) / (1.4);
                        let posy = -Math.abs(obj.centerX - posx);
                        let norm = Math.sqrt(Math.pow(posx, 2) + Math.pow(posy, 2));
                        this.vx = (posx / norm) * vel;
                        this.vy = (posy / norm) * vel;
                    }
                    return true;
                }
            }
        return false;
    }
    fineCheckCollision(obj) {
        if ((this.x - this.centerX) < (obj.x + obj.centerX) && (this.x + this.centerX) > (obj.x - obj.centerX) &&
            (this.y - this.centerY) < (obj.y + obj.centerY) && (this.y + this.centerY) > (obj.y - obj.centerY)) {
            return true;
        }
        return false;
    }
    distance(x0, x1, y0, y1) {
        return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    }
}
