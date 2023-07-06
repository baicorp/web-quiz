const summary = JSON.parse(localStorage.getItem("summary"));
const persenNumber = (summary.correctAnswer / summary.databaseLength) * 100;
document.querySelector(".precentage-number").innerText = `${formatNumber(
  persenNumber
)}%`;
document.querySelector(".score-number").innerText = `${Math.round(
  persenNumber
)}`;
document.querySelector(
  ".correct-number-stats"
).innerText = `${summary.correctAnswer}`;
document.querySelector(".incorrect-number-stats").innerText = `${
  summary.databaseLength - summary.correctAnswer
}`;
document.querySelector(".inner-accuracy-bar").style.width = `${persenNumber}%`;
const persen = document.querySelector(".accuracy-bar-precentage");
persen.style.right = `${-persen.getBoundingClientRect().width / 2}px`;
document.querySelector("#home-btn").addEventListener("click", () => {
  localStorage.setItem(
    "summary",
    JSON.stringify({
      correctAnswer: 0,
      databaseLength: 0,
    })
  );
  location.replace("./index.html");
});

function formatNumber(number) {
  const data = number % 1;
  if (data !== 0) {
    return number.toFixed(1);
  }
  return number.toFixed(0);
}
