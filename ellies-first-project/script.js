let clicks = 0;

document.getElementById("hello").addEventListener("click", () => {
  clicks += 1;
  document.getElementById("message").textContent =
    `Hello! You've clicked ${clicks} time${clicks === 1 ? "" : "s"} 🎉`;
});
