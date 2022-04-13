import { AssetLoader } from '../@types/AssetLoader.js';
import { Engine } from '../@types/Engine.js';
import { Game } from '../@types/Game.js';
import { GameObject, ObjectTypes } from '../@types/GameObjects.js';

let assets = new AssetLoader();

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
    let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
    let game = new Game(canvas);
    game.setAssets(assets);
    let engine = new Engine(game.canvas, game);
    game.engine = engine;
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            let fundo = new GameObject(198 + (256 * i) + (i === 3 ? - 88: 0),192 + (256 * j),256,256);
            fundo.setAsset(assets.images["img/fundo.png"]);
            fundo.setScale(1);
            fundo.layer= 0;
            fundo.rotation = 90 * (i + j % 4);
            game.addObject(fundo.layer, fundo); 
        } 
    }

    for(let i = 0; i < 8; i++) {
        let lateral = new GameObject(64,128 + (128 * i),16,128);
        lateral.setAsset(assets.images["img/tubolateral.png"]);
        lateral.setScale(1);
        lateral.layer= 0;
        game.addObject(lateral.layer, lateral); 
        lateral = new GameObject(1016,128 + (128 * i),16,128);
        lateral.setAsset(assets.images["img/tubolateral.png"]);
        lateral.setScale(1);
        lateral.layer= 0;
        game.addObject(lateral.layer, lateral); 
    }
    for(let i = 0; i < 13; i++) {
        let topo = new GameObject(108 + (i * 72),56,72,16);
        topo.setAsset(assets.images["img/topo-longo.png"]);
        topo.setScale(1);
        topo.layer= 0;
        game.addObject(topo.layer, topo); 
    }
    let topo = new GameObject(64,56,16,16);
    topo.setAsset(assets.images["img/topo.png"]);
    topo.setScale(1);
    topo.layer= 0;
    game.addObject(topo.layer, topo);
    topo = new GameObject(1016,56,16,16);
    topo.setAsset(assets.images["img/topo.png"]);
    topo.setScale(1);
    topo.layer= 0;
    game.addObject(topo.layer, topo);    
    
    game.setupKeys();
    engine.start();
    engine.pause();
}

