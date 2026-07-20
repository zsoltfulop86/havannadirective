const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

menuButton.addEventListener("click", function () {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(function (element) {
  observer.observe(element);
});

document.querySelector("#year").textContent = String(new Date().getFullYear());

const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");

document.querySelectorAll("[data-lightbox]").forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const image = link.querySelector("img");
    lightboxImage.src = link.href;
    lightboxImage.alt = image.alt;
    lightbox.showModal();
  });
});

lightboxClose.addEventListener("click", function () {
  lightbox.close();
});

lightbox.addEventListener("click", function (event) {
  if (event.target === lightbox) {
    lightbox.close();
  }
});