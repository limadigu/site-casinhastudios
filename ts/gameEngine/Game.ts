import { Text } from './Text.js';
import { Ball, GameObject, ObjectTypes } from './GameObjects.js';
import { keyboard, Key, Engine } from './Engine.js';
import { AssetLoader } from './AssetLoader.js';
export class Game {
    ship: GameObject | null;
    leftKey: Key | null;
    rightKey: Key | null;
    pauseKey: Key | null;
    triggerKey: Key | null;
    enterKey: Key | null;
    objects: (GameObject | null) [][];
    texts: Text[];
    canvas: HTMLCanvasElement;
    canvasCtx: CanvasRenderingContext2D | null;
    lastUpdate: number;
    globalScale: number;
    left: number;
    top: number;
    bottom: number;
    right: number;
    engine: Engine | null;
    shipSpeed: number;
    maxVel: number;
    incVel: number;
    livesText: Text;
    gameOverText: Text;
    scoreText: Text;
    startText1: Text;
    startText2: Text;
    stopped: boolean;
    score: number;
    lives: number;
    blocks: (GameObject | null)[][];
    backgroundChanged: boolean;
    blocksChanged: boolean;
    assets: AssetLoader;
    constructor(canvas : HTMLCanvasElement) {
        this.ship = null;
        this.leftKey = null;
        this.rightKey = null;
        this.pauseKey = null;
        this.triggerKey = null;
        this.enterKey = null;
        this.objects = [[], [], []];
        this.texts = [];
        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext("2d");
        this.lastUpdate = 0;
        this.globalScale = .475;
        this.left = 72;
        this.top = 64;
        this.bottom = 1086;
        this.right = 1008;
        this.engine = null;
        this.shipSpeed = 400;
        this.maxVel = 600;
        this.incVel = 15;
        this.livesText = new Text('', "16px courier", "black", 60, 6);
        this.gameOverText = new Text('FIM DE JOGO', "32px courier", "white", 200, 350);
        this.scoreText = new Text('0000000000', "16px courier", "black", 832, 6);
        this.startText1 = new Text('Toque na tela ou tecle', "30px courier", "white", 130, 450);
        this.startText2 = new Text('Enter para iniciar', "30px courier", "white", 200, 550);
        this.texts.push(this.scoreText);
        this.texts.push(this.startText1);
        this.texts.push(this.startText2);
        this.texts.push(this.livesText);
        this.texts.push(this.gameOverText);
        this.gameOverText.visible = false;
        this.stopped = true;
        this.score = 0;
        this.lives = 3;
        this.blocks = [];
        this.backgroundChanged = true;
        this.blocksChanged = true;
        this.assets = new AssetLoader();
        // this.resize();
        // window.onresize = this.resize.bind(this);
    };
    addObject(layer : number, object: GameObject) {
        this.objects[layer].push(object);
        if (layer === 1 && object.type === ObjectTypes.Block) {
            let l = (object.y - 80) / 32;
            let c = (object.x - 108) / 72;
            this.blocks[l][c] = object;
        }
    };
    addText(object: Text) {
        this.texts.push(object);
    };
    getObjectsToRender(layer: number) {
        let list = [];
        for (let item of this.objects[layer].sort((a, b) => a == null || b == null ? 0 : b.y > a.y ? -1 : (b.x > a.x ? -1 : 1)))
            list.push(item);
        return list;
    };
    getTextsToRender() {
        return this.texts;
    }
    getCollidables(x: number, y: number) {
        let l = Math.trunc((y - 80) / 32);
        let c = Math.trunc((x - 108) / 72);
        let list = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let l1 = l - 1 + i;
                let c1 = c - 1 + j;
                if ((l1 >= 0 && l1 < 24) && (c1 >= 0 && c1 < 13)) {
                    if (this.blocks[l1][c1] !== null) {
                        list.push(this.blocks[l1][c1]);
                    }
                }
            }
        }
        if (y > 800)
            list.push(this.ship);
        return list;
    }
    update(timestamp: number) {
        if (timestamp === undefined || timestamp == 0)
            return;
        let delta = (timestamp - this.lastUpdate) / 1000;
        for (let obj of this.objects[1]) {
            obj?.update(delta);
        }
        for (let obj of this.objects[2]) {
            obj?.update(delta);
        }
        this.lastUpdate = timestamp;
        this.processInput();
    }
    hitBlock(block: GameObject) {
        let index = this.objects[1].indexOf(block);
        if (index >= 0) {
            this.objects[1].splice(index, 1);
            let l = (block.y - 80) / 32;
            let c = (block.x - 108) / 72;
            this.blocks[l][c] = null;
        }
        this.updateScore(100);
        this.blocksChanged = true;
    }
    updateScore(amount : number) {
        this.score += amount;
        let s = "000000000000" + this.score;
        this.scoreText.content = s.substr(s.length - 10);
    }
    setShip(object: GameObject) {
        this.ship = object;
    }
    setupKeys() {
        this.leftKey = keyboard("ArrowLeft");
        this.rightKey = keyboard("ArrowRight");
        this.pauseKey = keyboard("KeyP");
        this.triggerKey = keyboard("Space");
        this.enterKey = keyboard("Enter");
        this.pauseKey.release = this.togglePause.bind(this);
        this.triggerKey.release = this.trigger.bind(this);
        this.enterKey.release = this.startGame.bind(this);
    }
    togglePause() {
        if (!this.stopped) {
            if (this.engine?.paused)
                this.engine?.resume();
            else
                this.engine?.pause();
        }
    }
    startGame() {
        if (this.stopped) {
            this.loadStage();
            this.createShip();
            this.engine?.resume();
            this.stopped = false;
            this.startText1.visible = false;
            this.startText2.visible = false;
            this.updateLives();
            this.gameOverText.visible = false;
        }
    }
    updateLives() {
        this.livesText.content = `Vidas: ${this.lives}`;
    }
    trigger() {
        for (let b of this.objects[2]) {
            if (b?.type == ObjectTypes.Ball) {
                let ball = b as Ball;
                if (ball.hold) {
                    ball.release(170, -210);
                }
            }
        }
    }
    processInput() {
        if (!this.stopped && !this.engine?.paused && this.ship !== null) {
            if (this.leftKey?.isDown) {
                if (this.ship.x > 72 + this.ship.centerX)
                    this.ship.vx = -this.shipSpeed;
                else {
                    this.ship.vx = 0;
                    this.ship.x = 72 + this.ship.centerX;
                }
            }
            else if (this.rightKey?.isDown) {
                if (this.ship.x < 1008 - this.ship.centerX)
                    this.ship.vx = this.shipSpeed;
                else {
                    this.ship.vx = 0;
                    this.ship.x = 1008 - this.ship.centerX;
                }
            }
            else {
                this.ship.vx = 0;
            }
        }
    }
    destroyBall(ball: Ball) {
        let index = this.objects[2].indexOf(ball);
        if (index >= 0) {
            this.objects[2].splice(index, 1);
            if (this.objects[2].find(x => x?.type === ObjectTypes.Ball) === undefined)
                this.die();
        }
    }
    die() {
        if (this.lives > 0) {
            this.lives--;
            this.respawn();
        }
        else {
            this.engine?.pause();
            this.stopped = true;
            this.lives = 3;
            this.gameOverText.visible = true;
            this.startText1.visible = true;
            this.startText2.visible = true;
            this.objects[1] = [];
            this.objects[2] = [];
            this.ship = null;
        }
        this.updateLives();
    }
    respawn() {
        let ball = this.createBall();
        if (this.ship != null) {
            this.ship.x = 540;
            ball.stick(this.ship);
        }
    }
    createBall(x = 560, y = 1000) {
        let ball = new Ball(x, y, 16, 16);
        ball.setGame(this);
        ball.setAsset(this.assets.images["img/bola.png"]);
        ball.setScale(1);
        ball.layer = 2;
        ball.shadow = true;
        this.addObject(ball.layer, ball);
        return ball;
    }
    createShip(x = 540, y = 1024) {
        let ship = new GameObject(x, y, 128, 32);
        let ball = this.createBall();
        ball.stick(ship);
        if (this.assets.images["img/nave.png"] != undefined)
            ship.setAsset(this.assets.images["img/nave.png"]);
        ship.setScale(1);
        ship.layer = 2;
        ship.shadow = true;
        ship.type = ObjectTypes.Ship;
        this.addObject(ship.layer, ship);
        this.setShip(ship);
    }
    setAssets(assets: AssetLoader) {
        this.assets = assets;
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        let ratio = window.innerWidth / window.innerHeight;
        if (ratio > 810 / 880) {
            this.globalScale = window.innerHeight / 1173;
        }
        else {
            this.globalScale = window.innerWidth / 1080;
        }
        this.backgroundChanged = true;
        this.blocksChanged = true;
    }
    loadStage() {
        this.blocks = [];
        for (let l = 0; l < 24; l++) {
            this.blocks[l] = [];
            for (let c = 0; c < 13; c++) {
                this.blocks[l][c] = null;
            }
        }
        let assetsBlocks = [this.assets.images["img/blocoazl.png"], this.assets.images["img/blocorox.png"], this.assets.images["img/blocovrd.png"], this.assets.images["img/blocovrm.png"]];
        for (let j = 4; j < 12; j++)
            for (let i = 0; i < 13; i++) {
                let block = new GameObject(108 + (72 * i), 80 + (32 * j), 72, 32);
                block.setAsset(assetsBlocks[j % 4]);
                block.setScale(1);
                block.layer = 1;
                block.shadow = true;
                block.type = ObjectTypes.Block;
                this.addObject(block.layer, block);
            }
        this.blocksChanged = true;
    }
}
