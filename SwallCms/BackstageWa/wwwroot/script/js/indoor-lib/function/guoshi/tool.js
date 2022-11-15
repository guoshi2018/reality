"use strict";
function correctAllVerticalFlexOffset() {
    document.querySelectorAll('.vrow,.vrowr').forEach(row => {
        Array.from(row.children).forEach(col => {
            fixFlexGridColMargin(col);
        });
    });
}
function fixFlexGridColMargin(col) {
    const ele_classname = col.className;
    const par = col.parentElement;
    let ok = false;
    if (par) {
        const par_cptStyle = getComputedStyle(par, null);
        if (par_cptStyle.display == "flex") {
            const par_classname = par.className;
            col.style.marginLeft = col.style.marginRight =
                col.style.marginTop = col.style.marginBottom = "";
            if (ele_classname.indexOf("offset-") != -1 &&
                (ele_classname.indexOf("col") != -1 || par_classname.indexOf("row-cols-") != -1)) {
                switch (par_cptStyle.flexDirection) {
                    case "column":
                        fixMarginY(col, "marginTop");
                        col.style.marginLeft = col.style.marginRight = col.style.marginBottom = "0px";
                        break;
                    case "column-reverse":
                        fixMarginY(col, "marginBottom");
                        col.style.marginLeft = col.style.marginRight = col.style.marginTop = "0px";
                        break;
                    case "row-reverse":
                        col.style.marginRight = getComputedStyle(col, null).marginRight;
                        col.style.marginLeft = col.style.marginTop = col.style.marginBottom = "0px";
                        break;
                    default:
                        col.style.marginLeft = getComputedStyle(col, null).marginLeft;
                        col.style.marginTop = col.style.marginRight = col.style.marginBottom = "0px";
                        break;
                }
            }
            ok = true;
        }
    }
    return ok;
}
function fixMarginY(ele, mg) {
    const parent = ele.parentElement;
    const pW = parent.clientWidth;
    const pH = parent.clientHeight;
    const cptStyle = getComputedStyle(ele, null);
    ele.style[mg] = '';
    const orig_value = parseFloat(cptStyle[mg]);
    const fixed_value = orig_value * pH / pW;
    ele.style[mg] = `${fixed_value}px`;
}
function openLastDetails() {
    let ds = document.querySelectorAll("details");
    let ele = ds[ds.length - 1];
    ds.forEach(dt => {
        dt.removeAttribute("open");
    });
    while (ele) {
        if (ele instanceof HTMLDetailsElement) {
            ele.setAttribute("open", "");
        }
        ele = ele.parentElement;
    }
}
function guidString() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return "s" + v.toString(16);
    });
}
;
function cloneWithId(root = document.documentElement || document.body, tag = "ele-clone", ref_id = "ref-id") {
    Array.from(root.children).forEach(ele => {
        if (ele.tagName.toLowerCase() == tag.toLowerCase()) {
            const source_id = ele.getAttribute(ref_id);
            if (source_id) {
                const source = document.getElementById(source_id);
                if (source) {
                    const source_copy = source.cloneNode(true);
                    const id = ele.id?.trim();
                    source_copy.id = id || guidString();
                    ele.replaceWith(source_copy);
                    cloneWithId(ele, tag, ref_id);
                }
            }
        }
        else {
            cloneWithId(ele, tag, ref_id);
        }
    });
}
function fixDuplicateIDs() {
    const arr_id = [];
    handle(document.body);
    function handle(root) {
        Array.from(root.children).forEach(ele => {
            if (arr_id.indexOf(ele.id) != -1) {
                ele.id = guidString();
            }
            else {
                arr_id.push(ele.id);
            }
            handle(ele);
        });
    }
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`${ms} million seconds timeout!`), ms);
    });
}
;
//# sourceMappingURL=tool.js.map