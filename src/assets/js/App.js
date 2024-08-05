/** app init class **/
class App {
    /** create app **/
    constructor() {
        this.init();
    }

    /** init other modules **/
    init() {
        window.addEventListener('load', () => {
            new SvgScheme();
        });
    }
}

new App();


