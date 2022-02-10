const menu = document.querySelector(".menu");
const menuAbrir = document.querySelector("#menu-responsivo-click-abrir");
const menuFechar = document.querySelector("#menu-responsivo-click-fechar");

window.onresize = function () {
    if (window.innerWidth >= 992) {
        menu.classList.remove("menu-responsivo");
    } else {
        menu.classList.add("menu-responsivo");
    }
}

function abrirMenuResponsivo() {
    menu.classList.remove("oculto-g", "oculto-m", "oculto-p");
    menu.classList.add("menu-responsivo");
    menuAbrir.classList.add("oculto");
    menuFechar.classList.remove("oculto");
}

function fecharMenuResponsivo() {
    menu.classList.add("oculto-g", "oculto-m", "oculto-p");
    menu.classList.remove("menu-responsivo");
    menuAbrir.classList.remove("oculto");
    menuFechar.classList.add("oculto");
}