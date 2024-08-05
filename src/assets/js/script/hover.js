class SvgScheme {
    svg = document.querySelector('.js--scheme');
    current_layer = null;

    width;
    max_x_shift;
    height;
    max_y_shift;

    move_mode = false;

    svg_ration = 0.615384;
    scale = 1;
    current_pos = {
        x: 0, y: 0,
    };

    constructor() {
        this.width = document.documentElement.clientWidth - 80;
        this.height = this.width * this.svg_ration;

        console.log(document.documentElement.clientWidth );
        setTimeout(()=> {
            console.log(document.documentElement.clientWidth);
        }, 1000);
        this.svg.parentElement.style.width = this.width + 'px';
        this.svg.parentElement.style.height = this.height + 'px';

        this.setSize();
        this.initEvents();
    }

    setSize() {
        const w = this.width * this.scale;
        const h = this.height * this.scale;

        this.svg.style.width = w + 'px';
        this.svg.style.height = h + 'px';
        this.max_x_shift = (w - this.width) * -1;
        this.max_y_shift = (h - this.height) * -1;

        if (this.scale === 1) return;
        const pos_x = this.width * 0.075;
        const pos_y = this.height * 0.075;
        this.current_pos.x = this.current_pos.x - pos_x;
        this.current_pos.y = this.current_pos.y - pos_y;

        this.svg.style.transform = `translate3d(${this.current_pos.x}px, ${this.current_pos.y}px, 0)`;
    }


    defaultScale() {
        this.scale = 1;
        this.setSize();
    }

    scaleUp() {
        console.log('SCALE UP');
        this.scale += 0.15;
        this.setSize();
    }

    initEvents() {
        this.scaleUp = this.scaleUp.bind(this);
        let init_coord = {x: 0, y: 0};

        const getPos = (e) => {
            let x = this.current_pos.x + (e.clientX - init_coord.x);
            let y = this.current_pos.y + (e.clientY - init_coord.y);

            x = (x > 0) ? 0 : x;
            x = (x < this.max_x_shift) ? this.max_x_shift: x;
            y = (y > 0) ? 0 : y;
            y = (y < this.max_y_shift) ? this.max_y_shift : y;

            return {
                x: x,
                y: y,
            };
        };

        const endMove = (e) => {
            this.move_mode = false;
            this.svg.classList.remove('js--zoom_mode');
            this.current_pos = getPos(e);
            console.log('UP');

            this.svg.removeEventListener('mouseup', endMove);
            this.svg.removeEventListener('mousemove', setPos);
        };

        const setPos = (e) => {
            const current_pos= getPos(e);
            console.log('MOVE', current_pos, this.current_pos.x, this.max_x_shift);
            this.svg.style.transform = `translate3d(${current_pos.x}px, ${current_pos.y}px, 0)`;
        };

        this.svg.addEventListener('dblclick', this.scaleUp);

        this.svg.addEventListener('mousedown', (e)=> {
            console.log('DOWN');
            this.move_mode = true;
            setTimeout(() => {
                this.svg.classList.add('js--zoom_mode');
            }, 100);


            init_coord = {x: e.clientX, y: e.clientY};

            this.svg.addEventListener('mouseup', endMove);
            this.svg.addEventListener('mousemove', setPos);
        });

        this.svg.addEventListener('mousemove', (e) => {
            if (this.move_mode) return;
            if (this.current_layer !== null && e.target === this.current_layer.target) return;

            this.removeFocus();
            this.current_layer = this.getLayer(e.target);
            this.addFocus();

            e.target.addEventListener('mouseout', (e) => {
                this.removeFocus();
            }, {once: true});
        });
    }

    removeFocus() {
        if (this.current_layer === null) return;
        if (this.current_layer.type === 'company') {
            this.current_layer.el.classList.remove('active');
            this.current_layer.el.closest('.svg_content').classList.remove('active_company');
        }
        if (this.current_layer.type === 'root') {
            this.current_layer.el.classList.remove('active_section');
        }
        this.current_layer = null;
    }

    addFocus() {
        if (this.current_layer === null) return;
        if (this.current_layer.type === 'company') {
            this.current_layer.el.classList.add('active');
            this.current_layer.el.closest('.svg_content').classList.add('active_company');
        }
        if (this.current_layer.type === 'root') {
            this.current_layer.el.classList.add('active_section');
        }
    }

    getLayer(current_target) {
        if (current_target.parentElement.classList.contains('js--company') || current_target.classList.contains('js--company')) {
            return {
                type: 'company',
                target: current_target,
                el: current_target.closest('.company'),
            };
        }

        if (current_target.parentElement.classList.contains('js--root') || current_target.classList.contains('js--root')) {
            return {
                type: 'root',
                target: current_target,
                el: current_target.closest('.svg_content'),
            };
        }

        return null;
    }
}


