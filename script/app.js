import { startConfetti, removeConfetti, stopConfetti } from "./confetti.js";

const startBtn = document.querySelector("#start-btn");
const sectionQuizSpecification = document.querySelector(
  ".section-quiz-specification"
);
const sectionCardQna = document.querySelector(".section-card-question-answer");
const length = document.querySelector(".length-question");
const body = document.querySelector("body");

const htmlEntities = [
  {
    id: `&auml;`,
    replace: `å`,
  },
  {
    id: `&ouml;`,
    replace: `ö`,
  },
  {
    id: `&shy;`,
    replace: `-`,
  },
  {
    id: `&oacute;`,
    replace: `ó`,
  },
  {
    id: `&quot;`,
    replace: `"`,
  },
  {
    id: `&amp;`,
    replace: `&`,
  },
  {
    id: `&alt;`,
    replace: `<`,
  },
  {
    id: `&#039;`,
    replace: `'`,
  },
  {
    id: `&ldquo;`,
    replace: `“`,
  },
  {
    id: `&rdquo;`,
    replace: `”`,
  },
  {
    id: `&gt;`,
    replace: `>`,
  },
];

startBtn.addEventListener("click", () => {
  const radioCategory = document.querySelector(
    `input[name="category"]:checked`
  );
  const radioDifficulty = document.querySelector(
    `input[name="difficulty"]:checked`
  );
  const radioNumberOfQuestion = document.querySelector(
    `input[name="numberOfQuestion"]:checked`
  );
  try {
    const category = radioCategory.value;
    const difficulty = radioDifficulty.value;
    const numberOfQuestion = radioNumberOfQuestion.value;
    body.removeChild(sectionQuizSpecification);
    getTrivia(category, difficulty, numberOfQuestion);
  } catch (e) {
    const error = document.querySelector(".error");
    setTimeout(() => {
      error.style.top = "-100px";
    }, 2500);
    error.style.top = "20px";
  }
});

async function getTrivia(category, difficulty, numberOfQuestion) {
  const loading = document.createElement("span");
  loading.className = "spinner";
  const loadingdiv = document.createElement("div");
  loadingdiv.style.position = "relative";
  loadingdiv.style.height = "100vh";
  loadingdiv.appendChild(loading);
  body.prepend(loadingdiv);
  const endPoint = `https://opentdb.com/api.php?amount=${numberOfQuestion}&category=${category}&difficulty=${difficulty}`;
  try {
    const response = await fetch(endPoint);
    const trivia = await response.json();
    let data = trivia.results;
    console.log(data);
    body.removeChild(loadingdiv);
    const quiz = document.querySelector(".quiz");
    if (data.length === 0) {
      const error = errorPage(
        `Sorry, we don't have enough question for your choice. We always try to increase the number of questions.`
      );
      quiz.remove();
      body.appendChild(error);
      return;
    }
    quiz.style.display = "block";
    start(data);
  } catch (err) {
    console.log(err);
    body.removeChild(loadingdiv);
    const errorFetch = errorPage(
      `Sorry, there was an error processing your request. Please try again.`
    );
    body.appendChild(errorFetch);
  }
}

function start(data) {
  const database = data;
  let index = 0;
  let scoreCorrectAnswer = 0;
  createQna(database[index]);

  function createQna(object) {
    let number = index;
    number += 1;
    const answer = shuffle([
      object.correct_answer,
      ...object.incorrect_answers,
    ]);
    const questionElement = document.createElement("p");
    questionElement.className = "qna-question";
    questionElement.innerText = removeEntities(object.question);

    const trackQuestion = document.querySelector(".question-track");
    trackQuestion.innerText = `Question ${number} / ${database.length}`;

    const progressBar = document.querySelector(".inner-bar");
    progressBar.style.width = `${Math.floor(
      (number / database.length) * 100
    )}%`;

    const answerGrupBtnElement = document.createElement("div");
    answerGrupBtnElement.className = "qna-answer";

    answer.forEach((data) => {
      const answerBtnElement = document.createElement("button");
      answerBtnElement.className = "qna-answer-btn";

      const answerElement = document.createElement("p");
      answerElement.innerText = removeEntities(data);
      answerBtnElement.append(answerElement);

      const markElement = document.createElement("div");
      markElement.className = "qna-answer-btn-mark";
      answerBtnElement.append(markElement);
      const icon = document.createElement("img");
      const icon2 = document.createElement("img");

      answerBtnElement.addEventListener("click", () => {
        if (object.correct_answer === answerBtnElement.innerText) {
          startConfetti();
          setTimeout(stopConfetti, 1500);
          answerBtnElement.classList.add("correct-answer");
          icon.setAttribute("src", "./assets/image/check-mark-icon.svg");
          markElement.appendChild(icon);
          scoreCorrectAnswer++;
        } else {
          answerBtnElement.classList.add("incorrect-answer");
          icon2.setAttribute("src", "./assets/image/x-mark-icon.svg");
          markElement.appendChild(icon2);
        }
        markElement.classList.add("select-answer");
        const allAnswerBtn = document.querySelectorAll(".qna-answer-btn");
        allAnswerBtn.forEach((data) => {
          data.setAttribute("disabled", true);
        });
        const nextBtn = document.createElement("button");
        nextBtn.classList.add("primary-btn");
        nextBtn.setAttribute("id", "next-btn");
        nextBtn.innerText = "NEXT";
        nextBtn.addEventListener("click", () => {
          const lengthDatabase = database.length;
          if (lengthDatabase - 1 === index) {
            const summary = {
              correctAnswer: scoreCorrectAnswer,
              databaseLength: lengthDatabase,
            };
            localStorage.setItem("summary", JSON.stringify(summary));
            location.replace("summary.html");
          } else {
            removeQna();
            createQna(database[++index]);
          }
        });
        sectionCardQna.append(nextBtn);
      });
      answerGrupBtnElement.append(answerBtnElement);
    });
    sectionCardQna.append(questionElement);
    sectionCardQna.append(answerGrupBtnElement);
  }
}

function removeQna() {
  const question = document.querySelector(".qna-question");
  const answer = document.querySelector(".qna-answer");
  const nextBtn = document.querySelector("#next-btn");
  sectionCardQna.removeChild(question);
  sectionCardQna.removeChild(answer);
  sectionCardQna.removeChild(nextBtn);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function removeEntities(text) {
  htmlEntities.map((entitie) => {
    text = text.replaceAll(entitie.id, entitie.replace);
  });
  return text;
}

function errorPage(errorMsg) {
  const errorFetch = document.createElement("div");
  errorFetch.className = "error-page";
  const errorMessage = document.createElement("p");
  errorMessage.innerText = errorMsg;
  const homeBtn = document.createElement("button");
  homeBtn.classList.add("primary-btn", "wide");
  homeBtn.setAttribute("id", "home-btn");
  homeBtn.innerText = "HOME";
  homeBtn.addEventListener("click", () => {
    location.replace("./index.html");
  });
  errorFetch.appendChild(errorMessage);
  errorFetch.appendChild(homeBtn);
  return errorFetch;
}
