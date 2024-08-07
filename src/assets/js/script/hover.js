class SvgScheme {
    zoom_layer = document.querySelector('.js--zoom_zone');
    social = document.querySelector('.js--social');
    scheme = document.querySelector('.js--scheme');
    current_layer = null;

    width = 0;
    current_width = 0;
    height = 0;
    current_height = 0;
    additional_height_mod = 0.135; // 1.5 size
    additional_height = 0;

    max_x_shift = 0;
    max_y_shift = 0;

    move_mode = false;

    svg_ration = 0.615384;
    scale = 1;
    current_pos = {
        x: 0, y: 0,
    };

    constructor() {
        this.width = document.documentElement.clientWidth;
        this.height = this.width * this.svg_ration;

        const screen_h = document.documentElement.clientHeight;

        this.additional_height = ((this.height - screen_h) + this.width * this.additional_height_mod + 120);

        this.setSize();
        this.initEvents();
    }

    setSize() {
        const current_shift_x = (this.current_pos.x === 0 && this.max_x_shift === 0) ? 0.5 : this.current_pos.x / this.max_x_shift;
        const current_shift_y = (this.current_pos.y === 0 && this.max_y_shift === 0) ? 0 : this.current_pos.y / this.max_y_shift;

        this.current_width = this.width * this.scale;
        this.current_height = (this.scale === 1) ? this.height * this.scale : (this.height * this.scale) + (this.width * 0.05);

        const page_height = (this.current_height + 120 + (this.width * this.additional_height_mod));

        this.scheme.style.width = this.current_width + 'px';
        this.scheme.style.height = this.current_height + 'px';
        this.social.style.height = page_height + 'px';

        this.current_pos.x = (this.current_width - this.width) * current_shift_x * -1;
        this.current_pos.y = (this.current_height + this.additional_height - this.height) * current_shift_y * -1;
        if (this.current_pos.y === 0 && this.max_y_shift === 0) this.current_pos.y = (80 + this.current_width * 0.09) * -1;

        this.max_x_shift = (this.current_width - this.width) * -1;
        this.max_y_shift = (this.current_height + this.additional_height - this.height) * -1;


        console.log(
            'current_shift_y:', current_shift_y,
            ' max_y_shift:', this.max_y_shift,
            ' current_pos.y', this.current_pos.y);


        this.current_pos.x = (this.current_pos.x < this.max_x_shift) ? this.max_x_shift: this.current_pos.x;
        this.current_pos.y = (this.current_pos.y < this.max_y_shift) ? this.max_y_shift : this.current_pos.y;


        this.scheme.style.transform = `translate3d(${this.current_pos.x}px, ${this.current_pos.y}px, 0)`;
        this.social.style.transform = `translate3d(0px, ${this.current_pos.y}px, 0)`;
    }

    scaleUp() {
        console.log('SCALE UP');
        this.scale *= 1.15;
        this.setSize();
    }

    scaleDown() {
        console.log('SCALE Down');
        this.scale /= 1.15;
        if (this.scale <= 1) this.scale = 1;

        this.setSize();
    }

    initEvents() {
        this.scaleUp = this.scaleUp.bind(this);
        let init_coord = {x: 0, y: 0};

        let trembl = true; // fix

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
            this.zoom_layer.classList.remove('js--zoom_mode');
            this.current_pos = getPos(e);
            console.log('UP');

            this.zoom_layer.removeEventListener('mouseup', endMove);
            this.zoom_layer.removeEventListener('mousemove', setPos);
        };

        const setPos = (e) => {
            if (!trembl) return;
            trembl = false;
            setTimeout(() => trembl = true, 30);

            const current_pos= getPos(e);
            console.log('MOVE', current_pos, this.current_pos.x, this.max_x_shift);
            this.scheme.style.transform = `translate3d(${current_pos.x}px, ${current_pos.y}px, 0)`;
            this.social.style.transform = `translate3d(0px, ${current_pos.y}px, 0)`;
        };

        const scale = (e) => {
            console.log(e.deltaY);
            if (e.deltaY < 0) this.scaleUp();
            if (e.deltaY > 0) this.scaleDown();
        };

        window.addEventListener('wheel', scale);

        this.zoom_layer.addEventListener('mousedown', (e)=> {
            console.log('DOWN');
            this.move_mode = true;
            this.zoom_layer.classList.add('js--zoom_mode');
            setTimeout(() => {

            }, 100);

            init_coord = {x: e.clientX, y: e.clientY};

            this.zoom_layer.addEventListener('mouseup', endMove);
            this.zoom_layer.addEventListener('mousemove', setPos);
        });

        this.scheme.addEventListener('mousemove', (e) => {
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


