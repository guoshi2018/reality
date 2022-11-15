console.log('test.js run');

window.addEventListener("load", evt => {
    console.log('document ready.');
    console.log(document.getElementById('app').innerHTML);
});