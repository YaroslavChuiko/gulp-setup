let parallax = document.getElementById("intro");

window.addEventListener("scroll", function() {
    let offset = window.pageYOffset;
    parallax.style.backgroundPositionY = offset * 0.5 + "px";
});
