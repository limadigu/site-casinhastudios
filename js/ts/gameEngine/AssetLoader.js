class Dictionary {
}
export class AssetLoader {
    constructor() {
        this.images = new Dictionary();
        //Properties to help track the assets being loaded
        this.toLoad = 0;
        this.loaded = 0;
        //File extensions for different types of assets
        this.imageExtensions = ["png", "jpg", "gif"];
        this.fontExtensions = ["ttf", "otf", "ttc", "woff"];
        this.jsonExtensions = ["json"];
        this.audioExtensions = ["mp3", "ogg", "wav", "webm"];
    }
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
                if (extension != undefined)
                    if (this.imageExtensions.indexOf(extension) !== -1) {
                        this.loadImage(source, loadHandler);
                    }
                    //Load fonts 
                    else if (this.fontExtensions.indexOf(extension) !== -1) {
                        this.loadFont(source, loadHandler);
                    }
                    //Display a message if a file type isn't recognized
                    else {
                        console.log("File type not recognized: " + source);
                    }
            });
        });
    }
    ;
    loadImage(source, loadHandler) {
        //Create a new image and call the `loadHandler` when the image
        //file has loaded
        let image = new Image();
        image.addEventListener("load", loadHandler, false);
        //Assign the image as a property of the `assets` object so
        //you can access it like this: `assets["path/imageName.png"]`
        this.images[source] = image;
        //Alternatively, if you only want the file name without the full
        //path, you can get it like this:
        //image.name = source.split("/").pop();
        //this[image.name] = image; 
        //This will allow you to access the image like this:
        //assets["imageName.png"];
        //Set the image's `src` property to start loading the image
        image.src = source;
    }
    ;
    loadFont(source, loadHandler) {
        //Use the font's file name as the `fontFamily` name
        let fontFamily = source.split("/").pop()?.split(".")[0];
        //Append an `@afont-face` style rule to the head of the HTML
        //document. It's kind of a hack, but until HTML5 has a
        //proper font loading API, it will do for now
        let newStyle = document.createElement("style");
        let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);
        //Tell the `loadHandler` we're loading a font
        loadHandler();
    }
    ;
}
;
