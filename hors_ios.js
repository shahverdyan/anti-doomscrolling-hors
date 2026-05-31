// ==UserScript==
// @name         horse ios
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       shahverdyan
// @match        https://x.com/*
// @match        https://*.x.com/*
// @match        https://twitter.com/*
// @match        https://*.twitter.com/*
// @match        http://x.com/*
// @match        http://*.x.com/*
// @include      *x.com*
// @include      *twitter.com*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- COOKIES ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
    }

    // --- TIEMPOS FINALES (En milisegundos reales) ---
    const FASE_1_LIBRE = 5 * 60 * 1000;       // 5 min free doomscrolling
    const FASE_2_FADE = 1 * 60 * 1000;        // 1 min trasnparency
    const FASE_3_BLOQUEO = 30 * 60 * 1000;    // 30 min block

    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for(let i=0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    const INTEGRAL_BASE64 = "data:image/webp;base64,UklGRqYEAABXRUJQVlA4IJoEAACQKACdASq4ALgAPx2AtFUtJ7AxrDIL8jAjiWctlrJe3MpDfmZr5mbZEGvmFlYzPwsqtlrpWrYmxCREt0Z32pTr5VoqJsfZMWovL7fbb/1QPYV+n1yPIYVPmhFrk10Xk4hhnklTQph/tbHe3wOjNPDaRwNHjuDNCx8J4/odMB15eW8x0ikImx7GBWoRhfPnTvU1zfgB1VeuaJVh5cgH4plvC2DibTXvz56bXEvs3KLMN6vAzngG2V4ZzdMxSzhv34gy9J2XDoZidRAKOgD9Y7Tnr0d5yqdTBA8dEJuYvliFH1AVgse2IWpwszEjxreAqV+0k4H8sBeAhnf6oO4K5/Prn9kxHcq76slaOW9VsIk8E/X2fThB9C54cnDmBbenEHsATtjL+4hb2OxFrdmoJehALGTQgyz55xdrmt9quVP05/VMR7KZo8/Y6qUCQAAA/syv+2Uf8usT4jDReenXZ/UUWPFpiO7cIB0A+Aq3orhZdXf7+CD3CaUa7Q6FZFNGx+v8E4kMGekjUPwISCKCaPE6SHN0YjVwrB5L9gN5fNuml9qSzbUosjeXYNoMwZuA6OlmIeHBzKzM8MS9gzecUJ/NiUdvbvAkwvkRGJWU0pdH+tcuwIh1ZKKd2LJTC38VY+hlLXoHQRJJnxNodShjutJiGUpURCXBivJYfRJOtq49nSVuQAfom4gzO3iXiKE8MqOrQKqIAIYRTOfE9OVyJpwrqmZOfgcMBPp7pJwL2/PpR2aKMs/1q/HilMXeC96dkp2Kp4bo7uFhGDkG/XUo1j4kc06SnAhZUYGgsuDNGMjxlcqQZsAmOz7yPdcvjv+WDybE/G+jMdYlc9DoARuqKw51rcG5QeK0Vfh1Iad/s57nr5dm6Dxvom2PW/V4aUPYE0H06MJZ9qmVHhA2Snmfv8z9SFc+EekQIkIQ+ErJUJopb6IrE3DAyX0MpcNfwhGq7jf1/cgxGaNm31wJaprCIbWCc8W66ZzHHhjfwyTyoQQzrtplgYE9XI3jXRmIeK50KNSPHHz4b0l8/ufuTfGGP/MoEhsGQouja6TIdlTHRNBm+HJ0MxZifNXndxiiU09dYYkSt0SNeerol3bMZacIWZxG62LtqBHCrIF8dq8alWXhLPfqg6wNVrwNruoRhfm2d3uqURfdMsPdiMMigbRzLGZxbuEg07LVBbO2nxobcsKhWyd+Bhr52qKvFOPPEMECswjzvOAZGRPyL78j1xi5ZVOYLw4NgS8byTLhCOPD/7qbG3443tcYpnTxCQgF7dN0Ewaqc3605T3I+UAKus6WVz3O+Zzihvx56yAttswBNkwc8snmTJ/ay5kUVPjZtUtyhRZbG6+TeOFzIRIk5ghHmnF1y5k8p3GEBmaZ/XWnKPYEIwOHMmW4UY+ZBFr1vFha0ywuaBNzlyZuVZLOOMA9OrFwg47JwSmJj0Hriiqunk/6mbXX31EJznrKwqyfQMn2qySFavugYPm0gAJUQevrUM4ueMZcy6Ay0XS9dwhnzjD76X2QqbOsPm0/YYKgn86FZP5Z049llgIrXi35Y5kJq+KfWaoa4pi7AAAAAA==";

    const FIN_FASE_1 = FASE_1_LIBRE;
    const FIN_FASE_2 = FIN_FASE_1 + FASE_2_FADE;
    const FIN_FASE_3 = FIN_FASE_2 + FASE_3_BLOQUEO;

    // Estructura visual
    const horseContainer = document.createElement("div");
    horseContainer.id = "the-horse-final-shield";
    horseContainer.style.cssText =
        `position:fixed !important;` +
        `top:0 !important;` +
        `left:0 !important;` +
        `right:0 !important;` +
        `bottom:0 !important;` +
        `width:100vw !important;` +
        `height:100vh !important;` +
        `z-index:2147483647 !important;` +
        `pointer-events:none;` +
        `background-color: rgba(0,0,0,0);` +
        `-webkit-user-select:none;` + 
        `user-select:none;`;

    const horseImage = document.createElement("img");
    horseImage.style.cssText =
        `width:100% !important;` +
        `height:100% !important;` +
        `object-fit:cover !important;` + 
        `opacity:0;`;
    horseImage.src = INTEGRAL_BASE64;
    horseContainer.appendChild(horseImage);

    function asegurarInyeccion() {
        if (!document.getElementById("the-horse-final-shield")) {
            (document.documentElement || document.body).appendChild(horseContainer);
        }
    }

    let startTime = getCookie('the_horse_final_lock');
    const now = Date.now();

    if (!startTime) {
        startTime = now;
        setCookie('the_horse_final_lock', startTime.toString(), 1);
    } else {
        startTime = parseInt(startTime, 10);
    }

    function horseDo() {
        asegurarInyeccion();
        const transcurrido = Date.now() - startTime;

        // PHASE 1: free navigation (5 min)
        if (transcurrido < FIN_FASE_1) {
            horseImage.style.opacity = "0";
            horseContainer.style.backgroundColor = "rgba(0,0,0,0)";
            horseContainer.style.pointerEvents = "none";
        } 
        // PHASE 2: transparency of the hors (1 min)
        else if (transcurrido >= FIN_FASE_1 && transcurrido < FIN_FASE_2) {
            const progresoFade = (transcurrido - FIN_FASE_1) / FASE_2_FADE;
            horseImage.style.opacity = progresoFade.toString();
            horseContainer.style.backgroundColor = `rgba(0,0,0,${progresoFade * 0.8})`;
            horseContainer.style.pointerEvents = "auto"; 
        } 
        // PHASE 3: block
        else if (transcurrido >= FIN_FASE_2 && transcurrido < FIN_FASE_3) {
            horseImage.style.opacity = "1";
            horseContainer.style.backgroundColor = "rgba(0,0,0,1)";
            horseContainer.style.pointerEvents = "auto";
        } 
        // FINAL RESET 
        else {
            startTime = Date.now();
            setCookie('the_horse_final_lock', startTime.toString(), 1);
            horseImage.style.opacity = "0";
            horseContainer.style.backgroundColor = "rgba(0,0,0,0)";
            horseContainer.style.pointerEvents = "none";
        }

        requestAnimationFrame(horseDo);
    }
    
    horseDo();
})();
