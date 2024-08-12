class SvgScheme {
    zoom_layer = document.querySelector('.js--zoom_zone');
    social = document.querySelector('.js--social');
    scheme = document.querySelector('.js--scheme');

    current_layer = null;

    is_landscape = true;

    width = 0;
    current_width = 0;
    height = 0;
    current_height = 0;
    additional_height = 0;

    max_x_shift = 0;
    max_y_shift = 0;

    move_mode = false;

    svg_ration = 0.615384;
    scale = 1;
    min_scale = 1;
    current_pos = {
        x: 0, y: 0,
    };

    constructor() {
        this.is_landscape = document.documentElement.clientWidth > document.documentElement.clientHeight;

        if (this.is_landscape) {
            this.width = document.documentElement.clientWidth;
            this.height = this.width * this.svg_ration;
            this.additional_height = document.documentElement.clientWidth * 0.135 + 120;

            this.current_pos.y = (document.documentElement.clientWidth * 0.09 + 80) * -1;
        } else {
            // считаем ширину свг, получая из высоты
            // высота = 100% высоты - высота парнеров(20 ширины) - отсуп партнером(30 пикселей)
            this.height = document.documentElement.clientHeight;
            this.width = this.height * (1 / this.svg_ration);
            this.additional_height = this.width * 0.19 + 30;
            this.current_pos.y = (this.width * 0.095 + 20) * -1;
            console.log(this.current_pos.y);
        }

        this.current_width = this.width * this.scale;
        this.current_height = (this.scale === 1) ? this.height * this.scale : (this.height * this.scale) + (document.documentElement.clientWidth * 0.05);
        this.max_y_shift = document.documentElement.clientHeight - this.current_height - this.additional_height;
        this.max_x_shift = document.documentElement.clientWidth - this.current_width;

        this.setSize();
        this.initEvents();
        this.loadImg();
    }

    setSize() {
        const current_shift_x = (this.max_x_shift === 0 || this.scale === 1) ? 0.5 : this.current_pos.x / this.max_x_shift;
        const current_shift_y = (this.max_y_shift === 0) ? 0 : this.current_pos.y / this.max_y_shift;

        this.current_width = this.width * this.scale;
        this.current_height = (this.scale === 1) ? this.height * this.scale : (this.height * this.scale) + (document.documentElement.clientWidth * 0.05);

        // console.log(this.scale, 'current_height', this.current_height, 'this.additional_height', this.additional_height, this.current_height + this.additional_height - document.documentElement.clientHeight);

        this.scheme.style.width = this.current_width + 'px';
        this.scheme.style.height = this.current_height + 'px';

        if (!this.is_landscape) {
            this.additional_height = this.current_width * 0.19 + 30;
            this.social.style.width = this.scheme.style.width;
            this.social.style.setProperty('--size', ((this.current_width * 0.095) + 'px'));
            this.scheme.style.top = (this.current_width * 0.095 + 20) + 'px';
        }

        if (this.current_width > 3000) {
            this.scheme.querySelector('.js--scheme_bg').style.backgroundImage = 'url(/img/svg_bg_hr.png)';
        }

        this.social.style.height = (this.current_height + this.additional_height) + 'px';


        console.log(document.documentElement.clientHeight, this.current_height, this.additional_height);

        console.log(
            'current_shift_x:', current_shift_x,
            ' max_x_shift:', this.max_x_shift,
            ' current_pos.x', this.current_pos.x);


        this.current_pos.x = (document.documentElement.clientWidth - this.current_width) * current_shift_x;
        this.current_pos.y = (document.documentElement.clientHeight - this.current_height - this.additional_height) * current_shift_y;

        this.max_x_shift = document.documentElement.clientWidth - this.current_width;
        this.max_y_shift = document.documentElement.clientHeight - this.current_height - this.additional_height;

        console.log(document.documentElement.clientHeight, this.current_height, this.additional_height);

        console.log(
            'current_shift_y:', current_shift_y,
            ' max_y_shift:', this.max_y_shift,
            ' current_pos.y', this.current_pos.y);


        this.current_pos.x = (this.current_pos.x < this.max_x_shift) ? this.max_x_shift : this.current_pos.x;
        this.current_pos.y = (this.current_pos.y < this.max_y_shift) ? this.max_y_shift : this.current_pos.y;

        this.scheme.style.transform = `translate3d(${this.current_pos.x}px, ${this.current_pos.y}px, 0)`;
        this.social.style.transform = this.is_landscape ?
            `translate3d(0px, ${this.current_pos.y}px, 0)` :
            `translate3d(${this.current_pos.x}px, ${this.current_pos.y}px, 0)`;
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
            x = (x < this.max_x_shift) ? this.max_x_shift : x;
            y = (y > 0) ? 0 : y;
            y = (y < this.max_y_shift) ? this.max_y_shift : y;

            return {
                x: x,
                y: y,
            };
        };

        const scale = (e) => {
            console.log(e.deltaY);
            if (e.deltaY < 0) this.scaleUp();
            if (e.deltaY > 0) this.scaleDown();
        };

        const setPos = (e) => {
            if (!trembl) return;
            trembl = false;
            setTimeout(() => trembl = true, 40);
            const current_pos = getPos(e);
            console.log('MOVE', current_pos, this.current_pos.x, this.max_x_shift);
            this.scheme.style.transform = `translate3d(${current_pos.x}px, ${current_pos.y}px, 0)`;
            this.social.style.transform = this.is_landscape ?
                `translate3d(0px, ${current_pos.y}px, 0)` :
                `translate3d(${current_pos.x}px, ${current_pos.y}px, 0)`;
        };

        const endMove = (e) => {
            this.move_mode = false;
            this.zoom_layer.classList.remove('js--zoom_mode');
            this.current_pos = getPos(e);
            console.log('UP');

            this.zoom_layer.removeEventListener('pointercancel', endMove);
            this.zoom_layer.removeEventListener('pointerup', endMove);
            this.zoom_layer.removeEventListener('pointermove', setPos);
        };

        this.zoom_layer.addEventListener('dblclick', (e) => this.scaleUp());
        window.addEventListener('wheel', scale);
        window.addEventListener('touchmove', (e) => {
            console.log('TOUCH MOVE');
            e.preventDefault();
        }, {passive: false});

        this.zoom_layer.addEventListener('pointerdown', (e) => {
           // if (!e.isPrimary) return;
            console.log('DOWN');
            document.querySelector('.js--log').textContent = `DOWN`;

            this.move_mode = true;
            this.zoom_layer.classList.add('js--zoom_mode');

            init_coord = {x: e.clientX, y: e.clientY};

            this.zoom_layer.addEventListener('pointercancel', endMove, {passive: true});
            this.zoom_layer.addEventListener('pointerup', endMove, {passive: true});
            this.zoom_layer.addEventListener('pointermove', setPos, {passive: true});
        });

        this.zoom_layer.addEventListener('touchstart', (e) => {
            console.log('DOWN TOUCH');
            document.querySelector('.js--log').textContent = `DOWN TOUCH`;

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

    loadImg() {
        const src = `/img/svg_bg_hr.png`;
        const temp_img = new Image();
        temp_img.src = src;
    }
}


