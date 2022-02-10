

class Text {
    constructor(
        content = "Hello!",
        font = "8px sans-serif",
        fillStyle = "red",
        x = 0,
        y = 0
    ) {
        this.content = content;
        this.font = font;
        this.fillStyle = fillStyle;
        this.x = x;
        this.y = y;
        this.textBaseline = "top";
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
            this.height = ctx.measureText("M").height;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.content, 0, 0);
        if (this.strokeText !== "none")
            ctx.strokeText();
    }
}

const ObjectTypes = {
    Block: 0,
    Ship: 1,
    Ball: 2,
    Wall: 3,
    Other: 4
};

class GameObject {
    constructor(x, y, width, height) {
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
    setScale(scale) {
        this.scaleX = scale;
        this.scaleY = scale;
    }
    setAsset(asset) {
        this.asset = asset;
    }
    render(ctx, gameScale = 1) {
        ctx.drawImage(this.asset, -this.centerX, -this.centerY, this.width, this.height);
    }
    update(deltaTime) {
        this.x = this.x + (deltaTime * this.vx);
        this.y = this.y + (deltaTime * this.vy);
    }
}

class Ball extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
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
        for (let obj of this.game.getCollidables(this.x, this.y)) {
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

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The `downHandler`
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        //Prevent the event's default behavior
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );

    //Return the key object
    return key;
}


class Engine {
    constructor(canvas, game) {
        this.canvas = canvas;
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
        this.gameLoop();
    }
    render() {
        let ctx = this.canvas.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.game.backgroundChanged) {
            this.backgroundCanvas.width = this.canvas.width;
            this.backgroundCanvas.height = this.canvas.height;
            this.backgroundCanvas.ctx = this.backgroundCanvas.getContext('2d');
            let bctx = this.backgroundCanvas.ctx;
            bctx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
            this.game.getObjectsToRender(0).forEach(sprite => {
                this.displaySprite(sprite, this.backgroundCanvas);
            });
            this.game.backgroundChanged = false;
        }
        ctx.drawImage(this.backgroundCanvas, 0, 0);
        if (this.game.blocksChanged) {
            this.blocksCanvas.width = this.canvas.width;
            this.blocksCanvas.height = this.canvas.height;
            this.blocksCanvas.ctx = this.blocksCanvas.getContext('2d');
            let bctx = this.blocksCanvas.ctx;
            bctx.clearRect(0, 0, this.blocksCanvas.width, this.blocksCanvas.height);
            this.game.getObjectsToRender(1).forEach(sprite => {
                this.displaySprite(sprite, this.blocksCanvas);
            });
            this.game.blocksChanged = false;
        }
        ctx.drawImage(this.blocksCanvas, 0, 0);
        this.game.getObjectsToRender(2).forEach(sprite => {
            this.displaySprite(sprite, this.canvas);
        });

        this.game.getTextsToRender().forEach(text => {
            this.displayText(text);
        });
    }
    displaySprite(sprite, canvas) {
        let gameScale = this.game.globalScale;
        if (sprite.visible
            && (sprite.x * gameScale) < canvas.width + sprite.width
            && (sprite.x + sprite.width) * gameScale >= -sprite.width
            && sprite.y * gameScale < canvas.height + sprite.height
            && (sprite.y + sprite.height) * gameScale >= -sprite.height) {
            let ctx = canvas.ctx;
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
            if (sprite.render) sprite.render(ctx, gameScale);

            //Restore the canvas to its previous state
            ctx.restore();
        }
    }
    displayText(sprite) {
        if (sprite.visible) {
            let canvas = this.canvas;
            let gameScale = this.game.globalScale;
            let ctx = canvas.ctx;
            ctx.save();
            ctx.translate((sprite.x) * gameScale, (sprite.y) * gameScale);
            ctx.globalAlpha = sprite.alpha;
            if (sprite.render) sprite.render(ctx);

            ctx.restore();
        }
    }
}

let assets = {

    //Properties to help track the assets being loaded
    toLoad: 0,
    loaded: 0,

    //File extensions for different types of assets
    imageExtensions: ["png", "jpg", "gif"],
    fontExtensions: ["ttf", "otf", "ttc", "woff"],
    jsonExtensions: ["json"],
    audioExtensions: ["mp3", "ogg", "wav", "webm"],

    //The `load` method creates and loads all the assets. Use it like this:
    //`assets.load(["img/anyImage.png", "fonts/anyFont.otf"]);`
    load(sources) {

        //The `load` method will return a Promise when everything has
        //loaded
        return new Promise(resolve => {

            //The `loadHandler` counts the number of assets loaded, compares
            //it to the total number of assets that need to be loaded, and
            //resolves the Promise when everything has loaded
            let loadHandler = () => {
                this.loaded += 1;

                //Check whether everything has loaded
                if (this.toLoad === this.loaded) {

                    //Reset `toLoad` and `loaded` to `0` so you can use them
                    //to load more assets later if you need to
                    this.toLoad = 0;
                    this.loaded = 0;

                    //Resolve the promise
                    resolve();
                }
            };

            //Find the number of files that need to be loaded
            this.toLoad = sources.length;

            //Loop through all the source file names and find out how
            //they should be interpreted
            sources.forEach(source => {
                //Find the file extension of the asset
                let extension = source.split(".").pop();

                //Load images that have file extensions that match 
                //the imageExtensions array
                if (this.imageExtensions.indexOf(extension) !== -1) {
                    this.loadImage(source, loadHandler);
                }
                //Load fonts 
                else if (this.fontExtensions.indexOf(extension) !== -1) {
                    this.loadFont(source, loadHandler);
                }
                //Load JSON files  
                else if (this.jsonExtensions.indexOf(extension) !== -1) {
                    this.loadJson(source, loadHandler);
                }
                //Load audio files  
                else if (this.audioExtensions.indexOf(extension) !== -1) {
                    this.loadSound(source, loadHandler);
                }
                //Display a message if a file type isn't recognized
                else {
                    console.log("File type not recognized: " + source);
                }
            });
        });
    },

    loadImage(source, loadHandler) {
        //Create a new image and call the `loadHandler` when the image
        //file has loaded
        let image = new Image();
        image.addEventListener("load", loadHandler, false);
        //Assign the image as a property of the `assets` object so
        //you can access it like this: `assets["path/imageName.png"]`
        this[source] = image;

        //Alternatively, if you only want the file name without the full
        //path, you can get it like this:
        //image.name = source.split("/").pop();
        //this[image.name] = image; 
        //This will allow you to access the image like this:
        //assets["imageName.png"];

        //Set the image's `src` property to start loading the image
        image.src = source;
    },

    loadFont(source, loadHandler) {
        //Use the font's file name as the `fontFamily` name
        let fontFamily = source.split("/").pop().split(".")[0];
        //Append an `@afont-face` style rule to the head of the HTML
        //document. It's kind of a hack, but until HTML5 has a
        //proper font loading API, it will do for now
        let newStyle = document.createElement("style");
        let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);
        //Tell the `loadHandler` we're loading a font
        loadHandler();
    },

    loadJson(source, loadHandler) {
        //Create a new `xhr` object and an object to store the file
        let xhr = new XMLHttpRequest();

        //Use xhr to load the JSON file
        xhr.open("GET", source, true);

        //Tell xhr that it's a text file
        xhr.responseType = "text";

        //Create an `onload` callback function that
        //will handle the file loading    
        xhr.onload = event => {
            //Check to make sure the file has loaded properly
            if (xhr.status === 200) {
                //Convert the JSON data file into an ordinary object
                let file = JSON.parse(xhr.responseText);
                //Get the file name
                file.name = source;
                //Assign the file as a property of the assets object so
                //you can access it like this: `assets["file.json"]`
                this[file.name] = file;
                //Texture atlas support:
                //If the JSON file has a `frames` property then 
                //it's in Texture Packer format
                if (file.frames) {
                    //Create the tileset frames
                    this.createTilesetFrames(file, source, loadHandler);
                } else {
                    //Alert the load handler that the file has loaded
                    loadHandler();
                }
            }
        };
        //Send the request to load the file
        xhr.send();
    },
    createTilesetFrames(file, source, loadHandler) {

        //Get the tileset image's file path
        let baseUrl = source.replace(/[^\/]*$/, "");

        //Here's how this regular expression works:
        //http://stackoverflow.com/questions/7601674/id-like-to-remove-the-filename-from-a-path-using-javascript

        //Use the `baseUrl` and `image` name property from the JSON 
        //file's `meta` object to construct the full image source path 
        let imageSource = baseUrl + file.meta.image;

        //The image's load handler
        let imageLoadHandler = () => {

            //Assign the image as a property of the `assets` object so
            //you can access it like this:
            //`assets["img/imageName.png"]`
            this[imageSource] = image;

            //Loop through all the frames
            Object.keys(file.frames).forEach(frame => {

                //The `frame` object contains all the size and position
                //data for each sub-image.
                //Add the frame data to the asset object so that you
                //can access it later like this: `assets["frameName.png"]`
                this[frame] = file.frames[frame];

                //Get a reference to the source so that it will be easy for
                //us to access it later
                this[frame].source = image;
            });

            //Alert the load handler that the file has loaded
            loadHandler();
        };

        //Load the tileset image
        let image = new Image();
        image.addEventListener("load", imageLoadHandler, false);
        image.src = imageSource;
    },

    loadSound(source, loadHandler) {

        //Create a sound sprite and alert the `loadHandler`
        //when the sound file has loaded.
        //
        let sound = makeSound(source, loadHandler);

        //Get the sound file name.
        sound.name = source;

        //If you just want to extract the file name with the
        //extension, you can do it like this:
        //soundSprite.name = source.split("/").pop();
        //Assign the sound as a property of the assets object so
        //we can access it like this: `assets["sounds/sound.mp3"]`.
        this[sound.name] = sound;
    }
};

class Game{
    constructor(canvas){
        this.objects = [[],[],[]];
        this.texts = [];
        this.canvas = canvas;
        this.canvas.ctx = this.canvas.getContext("2d");
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
        this.assets = [];
        this.blocks = [];
        this.backgroundChanged = true;
        this.blocksChanged = true;
        // this.resize();
        // window.onresize = this.resize.bind(this);
    }    
    addObject(layer, object) {
        this.objects[layer].push(object);
        if (layer === 1 && object.type === ObjectTypes.Block){
            let l = (object.y - 80) / 32;
            let c = (object.x - 108) / 72;
            this.blocks[l][c] = object;
        }
    }       
    addText(object) {
        this.texts.push(object);
    }
    getObjectsToRender(layer){
        let list = [];
        for(let item of this.objects[layer].sort((a,b) => b.y > a.y ? -1 : (b.x > a.x ? -1 : 1)))
            list.push(item);
        return list;
    }
    getTextsToRender(){
        return this.texts;
    }
    getCollidables(x, y){
        let l = Math.trunc((y - 80) / 32);
        let c = Math.trunc((x - 108) / 72);
        let list = [];
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++){
                let l1 = l-1 + i;
                let c1 = c-1 + j;
                
                if ((l1 >= 0 && l1 < 24) && (c1 >= 0 && c1 < 13)){
                    
                    if(this.blocks[l1][c1] !== null) {
                        list.push(this.blocks[l1][c1]);
                    }
                }
            }
        }
        if (y > 800)
            list.push(this.ship);
        return list;
    }
    update(timestamp){
        if (timestamp === undefined)
            return;
        let delta = (timestamp - this.lastUpdate) / 1000;
        for(let obj of this.objects[1]){
            obj.update(delta);
        }
        
        for(let obj of this.objects[2]){
            obj.update(delta);
        }
        this.lastUpdate = timestamp;
        this.processInput();
    }
    hitBlock(block){
        let index = this.objects[1].indexOf(block);
        if (index >= 0){
            this.objects[1].splice(index, 1);
            let l = (block.y - 80) / 32;
            let c = (block.x - 108) / 72;
            this.blocks[l][c] = null;
        }
        this.updateScore(100);
        this.blocksChanged = true;
    }
    updateScore(amount){
        this.score += amount;
        let s = "000000000000" + this.score;
    
        this.scoreText.content = s.substr(s.length-10);
    }
    setShip(object){
        this.ship = object;
    }
    setupKeys(){
        this.leftKey = keyboard(37);
        this.rightKey = keyboard(39);
        this.pauseKey = keyboard(80);
        this.triggerKey = keyboard(32);
        this.enterKey = keyboard(13);

        this.pauseKey.release = this.togglePause.bind(this);
        this.triggerKey.release = this.trigger.bind(this);
        this.enterKey.release = this.startGame.bind(this);
    }    
    togglePause(){
        if (!this.stopped) {
            if (this.engine.paused)
                this.engine.resume();
            else
                this.engine.pause();
        }
    }
    startGame(){        
        if (this.stopped) {
            this.loadStage();
            this.createShip();
            this.engine.resume();
            this.stopped = false;
            this.startText1.visible = false;
            this.startText2.visible = false;
            this.updateLives();
            this.gameOverText.visible = false;
        }
    }
    updateLives(){
        this.livesText.content = `Vidas: ${this.lives}`;
    }
    trigger(){
        for(let b of this.objects[2]){
            if (b.hold) {
                b.release(170,-210);
            }
        }
    }
    processInput(){
        if (!this.stopped && !this.engine.paused && this.ship !== null){
            if(this.leftKey.isDown) {
                if (this.ship.x > 72 + this.ship.centerX)
                    this.ship.vx = -this.shipSpeed; 
                else {
                    this.ship.vx = 0;
                    this.ship.x = 72 + this.ship.centerX;    
                }
            }
            else if(this.rightKey.isDown) {
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
    destroyBall(ball){
        let index = this.objects[2].indexOf(ball);
        if (index >= 0){
            this.objects[2].splice(index, 1);
            if (this.objects[2].find(x => x.type === ObjectTypes.Ball) === undefined)
                this.die();
        }        
    }
    die(){
        
        if (this.lives > 0){
            this.lives--;
            this.respawn();
        }
        else {
            this.engine.pause();
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
    respawn(){
        let ball = this.createBall();
        this.ship.x = 540;
        ball.stick(this.ship);        
    }
    createBall(x = 560, y = 1000){
        let ball = new Ball(x,y,16,16);
        ball.setGame(this);
        ball.setAsset(this.assets["img/bola.png"]);
        ball.setScale(1);
        ball.layer= 2;
        ball.shadow = true;
        this.addObject(ball.layer, ball);
        return ball;
    }
    createShip(x = 540, y = 1024){
        let ship = new GameObject(x,y,128,32);
        let ball = this.createBall();
        ball.stick(ship);
        ship.setAsset(this.assets["img/nave.png"]);
        ship.setScale(1);
        ship.layer= 2;
        ship.shadow = true;
        ship.type = ObjectTypes.Ship;
        this.addObject(ship.layer, ship); 
        this.setShip(ship);
    }
    setAssets(assets){
        this.assets = assets;
    }
    resize(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        let ratio = window.innerWidth / window.innerHeight;
        if (ratio > 810 / 880){
            this.globalScale = window.innerHeight / 1173;           
        }
        else {
            this.globalScale = window.innerWidth / 1080;
        }
        this.backgroundChanged = true;
        this.blocksChanged = true;
    }
    loadStage(){
        this.blocks = [];
        for(let l = 0; l < 24; l++){
            this.blocks[l] = [];
            for(let c = 0; c < 13; c++){
                this.blocks[l][c] = null;
            }
        }
        let assetsBlocks = [ this.assets["img/blocoazl.png"], this.assets["img/blocorox.png"], this.assets["img/blocovrd.png"], this.assets["img/blocovrm.png"]];
        for(let j = 4; j < 12; j++)
            for(let i = 0; i < 13; i++){
                let block = new GameObject(108 + (72 * i),80 + (32*j),72,32);
                block.setAsset(assetsBlocks[j%4]);
                block.setScale(1);
                block.layer= 1;
                block.shadow = true;
                block.type = ObjectTypes.Block;
                this.addObject(block.layer, block); 
            }
        this.blocksChanged = true;
    }
}

assets.load([
    "img/blocoazl.png",
    "img/blocorox.png",
    "img/blocovrd.png",
    "img/blocovrm.png",
    "img/bola.png",
    "img/nave.png",
    "img/fundo.png",
    "img/tubolateral.png",
    "img/topo.png",
    "img/topo-longo.png",
]).then(()=> loaded());

function loaded() {
    let canvas = document.getElementById("mainCanvas");;
    let game = new Game(canvas);
    game.setAssets(assets);
    let engine = new Engine(game.canvas, game);
    game.engine = engine;
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            let fundo = new GameObject(198 + (256 * i) + (i === 3 ? - 88: 0),192 + (256 * j),256,256);
            fundo.setAsset(assets["img/fundo.png"]);
            fundo.setScale(1);
            fundo.layer= 0;
            fundo.rotation = 90 * (i + j % 4);
            game.addObject(fundo.layer, fundo); 
        } 
    }

    for(let i = 0; i < 8; i++) {
        let lateral = new GameObject(64,128 + (128 * i),16,128);
        lateral.setAsset(assets["img/tubolateral.png"]);
        lateral.setScale(1);
        lateral.layer= 0;
        game.addObject(lateral.layer, lateral); 
        lateral = new GameObject(1016,128 + (128 * i),16,128);
        lateral.setAsset(assets["img/tubolateral.png"]);
        lateral.setScale(1);
        lateral.layer= 0;
        game.addObject(lateral.layer, lateral); 
    }
    for(let i = 0; i < 13; i++) {
        let topo = new GameObject(108 + (i * 72),56,72,16);
        topo.setAsset(assets["img/topo-longo.png"]);
        topo.setScale(1);
        topo.layer= 0;
        game.addObject(topo.layer, topo); 
    }
    let topo = new GameObject(64,56,16,16);
    topo.setAsset(assets["img/topo.png"]);
    topo.setScale(1);
    topo.layer= 0;
    game.addObject(topo.layer, topo);
    topo = new GameObject(1016,56,16,16);
    topo.setAsset(assets["img/topo.png"]);
    topo.setScale(1);
    topo.layer= 0;
    game.addObject(topo.layer, topo);    
    
    game.setupKeys();
    engine.start();
    engine.pause();
}

