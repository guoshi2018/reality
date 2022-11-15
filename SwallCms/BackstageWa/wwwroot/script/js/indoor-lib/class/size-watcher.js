"use strict";
function areaFromBody(ele) {
    let left = 0;
    let top = 0;
    let e = ele;
    const w = e.offsetWidth;
    const h = e.offsetHeight;
    while (e && e.tagName != "BODY") {
        left += e.offsetLeft;
        top += e.offsetTop;
        e = e.offsetParent;
    }
    return {
        leftFromBody: left,
        topFromBody: top,
        offsetWidth: w,
        offsetHeight: h,
    };
}
class InfoBoard {
    constructor(target, wrapper, desc) {
        this.target = target;
        this._entity = document.createElement('div');
        this._origArea = areaFromBody(this.target);
        this._desc = desc;
        wrapper.append(this._entity);
        Object.assign(this._entity.style, {
            position: "absolute",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "0.8em",
            lineHeight: "1.1",
            textAlign: "center",
            letterSpacing: "0.8px",
            opacity: '1.0',
        });
        this.target.addEventListener('mouseenter', (evt) => {
            if (evt.target != document.body) {
                this._entity.style.opacity = '0.2';
            }
        });
        this.target.addEventListener('mouseleave', (evt) => {
            if (evt.target != document.body) {
                this._entity.style.opacity = '1';
            }
        });
    }
    refresh() {
        const area = areaFromBody(this.target);
        Object.assign(this._entity.style, {
            left: area.leftFromBody + "px",
            top: area.topFromBody + "px",
        });
        this._entity.innerHTML = '';
        ['w', 'h'].forEach(flag => {
            if (this._desc.indexOf(flag) != -1) {
                this._entity.innerHTML += this._htmlInfo(this._origArea, area, flag);
            }
        });
    }
    _htmlInfo(orig_area, curr_area, desc) {
        const orig = Math.floor(desc == 'w' ? orig_area.offsetWidth : orig_area.offsetHeight);
        const curr = Math.floor(desc == 'w' ? curr_area.offsetWidth : curr_area.offsetHeight);
        const percent = Math.floor(curr * 100 / orig);
        return `<p>${desc}:${percent}%</p><p>${curr}/${orig}</p>`;
    }
}
class SizeWatcher {
    constructor(containerSelectors, desc = 'w') {
        this._wrapper = document.createElement('div');
        document.body.append(this._wrapper);
        this._containers = document.querySelectorAll(containerSelectors);
        this._ibs = [];
        this._rizeObserver = new ResizeObserver(entries => {
            this._ibs.forEach(ib => {
                ib.refresh();
            });
        });
        this._containers.forEach(container => {
            const eles = container.children;
            console.log('length:', eles.length);
            for (let i = 0; i < eles.length; i++) {
                const e = eles.item(i);
                if (null != e) {
                    this._rizeObserver.observe(e);
                    this._ibs.push(new InfoBoard(e, this._wrapper, desc));
                }
            }
        });
        this._ibs.push(new InfoBoard(document.body, this._wrapper, desc));
        window.addEventListener('resize', (evt) => {
            this._ibs.forEach(ib => {
                ib.refresh();
            });
        });
    }
}
//# sourceMappingURL=size-watcher.js.map