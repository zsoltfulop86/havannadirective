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
