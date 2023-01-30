"use strict";
const menu = document.querySelector(".menu");
const menuAbrir = document.querySelector("#menu-responsivo-click-abrir");
const menuFechar = document.querySelector("#menu-responsivo-click-fechar");
window.onresize = function () {
    if (menu != null)
        if (window.innerWidth >= 992) {
            menu.classList.remove("menu-responsivo");
        }
        else {
            menu.classList.add("menu-responsivo");
        }
};
function abrirMenuResponsivo() {
    if (menu != null) {
        menu.classList.remove("oculto-g", "oculto-m", "oculto-p");
        menu.classList.add("menu-responsivo");
    }
    if (menuAbrir != null)
        menuAbrir.classList.add("oculto");
    if (menuFechar != null)
        menuFechar.classList.remove("oculto");
}
function fecharMenuResponsivo() {
    if (menu != null) {
        menu.classList.add("oculto-g", "oculto-m", "oculto-p");
        menu.classList.remove("menu-responsivo");
    }
    if (menuAbrir != null)
        menuAbrir.classList.remove("oculto");
    if (menuFechar != null)
        menuFechar.classList.add("oculto");
}
