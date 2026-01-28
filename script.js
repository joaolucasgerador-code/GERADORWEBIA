const themeToggle = document.querySelector(".theme-loggle");

const toggletheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  themeToggle.querySelector("i").className = isDarkTheme ? "bx bxs-moon" : "bx bxs-sun";
}

themeToggle.addEventListener("click", toggletheme);