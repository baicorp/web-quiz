const startBtn = document.querySelector('#start-btn')
const sectionQuizSpecification = document.querySelector('.section-quiz-specification')
const sectionCardQna = document.querySelector('.section-card-question-answer')
const length = document.querySelector('.length-question')
const body = document.querySelector('body')

const htmlEntities = [
    {
        id: `&auml;`,
        replace: `å`
    },
    {
        id: `&ouml;`,
        replace: `ö`
    },
    {
        id: `&shy;`,
        replace: `-`
    },
    {
        id: `&oacute;`,
        replace: `ó`
    },
    {
        id: `&quot;`,
        replace: `"`
    },
    {
        id: `&amp;`,
        replace: `&`
    },
    {
        id: `&alt;`,
        replace: `<`
    },
    {
        id: `&#039;`,
        replace: `'`
    },
    {
        id: `&ldquo;`,
        replace: `“`
    },
    {
        id: `&rdquo;`,
        replace: `”`
    },
    {
        id: `&gt;`,
        replace: `>`
    }
]

startBtn.addEventListener('click', () => {
    const radioCategory = document.querySelector(`input[name="category"]:checked`)
    const radioDifficulty = document.querySelector(`input[name="difficulty"]:checked`)
    const radioNumberOfQuestion = document.querySelector(`input[name="numberOfQuestion"]:checked`)
    try {
        const category = radioCategory.value
        const difficulty = radioDifficulty.value
        const numberOfQuestion = radioNumberOfQuestion.value
        body.removeChild(sectionQuizSpecification)
        getTrivia(category, difficulty, numberOfQuestion)
    } catch (e) {
        const error = document.querySelector('.error')
        setTimeout(() => {
            error.style.top = '-100px'
        }, 2500);
        error.style.top = '20px'
    }
})

async function getTrivia(category, difficulty, numberOfQuestion) {
    const loading = document.createElement('span')
    loading.className = 'spinner'
    const loadingdiv = document.createElement('div')
    loadingdiv.style.position = 'relative'
    loadingdiv.style.height = '100vh'
    loadingdiv.appendChild(loading)
    body.prepend(loadingdiv)
    const endPoint = `https://opentdb.com/api.php?amount=${numberOfQuestion}&category=${category}&difficulty=${difficulty}`
    try {
        const response = await fetch(endPoint);
        const trivia = await response.json();
        data = trivia.results
        body.removeChild(loadingdiv)
        const quiz = document.querySelector('.quiz')
        if (data.length === 0) {
            const error = errorPage(`Sorry, we don't have enough question for your choice. We always try to increase the number of questions.`)
            quiz.remove()
            body.appendChild(error)
            return
        }
        quiz.style.display = 'block'
        start(data)
    } catch (err) {
        body.removeChild(loadingdiv)
        const errorFetch = errorPage(`Sorry, there was an error processing your request. Please try again.`)
        body.appendChild(errorFetch)
    }
}

function start(data) {
    const database = data
    let index = 0
    let scoreCorrectAnswer = 0;
    createQna(database[index])

    function createQna(object) {
        let number = index;
        number += 1
        const answer = shuffle([object.correct_answer, ...object.incorrect_answers])
        const questionElement = document.createElement('p')
        questionElement.className = 'qna-question'
        questionElement.innerText = removeEntities(object.question)

        const trackQuestion = document.querySelector('.question-track')
        trackQuestion.innerText = `Question ${number} / ${database.length}`

        const progressBar = document.querySelector('.inner-bar')
        progressBar.style.width = `${Math.floor(number / database.length * 100)}%`

        const answerGrupBtnElement = document.createElement('div')
        answerGrupBtnElement.className = 'qna-answer'

        answer.forEach(data => {
            const answerBtnElement = document.createElement('button')
            answerBtnElement.className = 'qna-answer-btn'

            const answerElement = document.createElement('p')
            answerElement.innerText = removeEntities(data)
            answerBtnElement.append(answerElement)

            const markElement = document.createElement('div')
            markElement.className = 'qna-answer-btn-mark'
            answerBtnElement.append(markElement)
            const icon = document.createElement('img')
            const icon2 = document.createElement('img')

            answerBtnElement.addEventListener('click', () => {
                if (object.correct_answer === answerBtnElement.innerText) {
                    startConfetti()
                    answerBtnElement.classList.add('correct-answer');
                    icon.setAttribute('src', './assets/image/check-mark-icon.svg')
                    markElement.appendChild(icon)
                    scoreCorrectAnswer++
                } else {
                    answerBtnElement.classList.add('incorrect-answer');
                    icon2.setAttribute('src', './assets/image/x-mark-icon.svg')
                    markElement.appendChild(icon2)
                }
                markElement.classList.add('select-answer');
                const allAnswerBtn = document.querySelectorAll('.qna-answer-btn')
                allAnswerBtn.forEach(data => {
                    data.setAttribute('disabled', true)
                })
                const nextBtn = document.createElement('button')
                nextBtn.classList.add('primary-btn')
                nextBtn.setAttribute('id', 'next-btn')
                nextBtn.innerText = 'NEXT'
                nextBtn.addEventListener('click', () => {
                    const lengthDatabase = database.length
                    if (lengthDatabase - 1 === index) {
                        const summary = {
                            correctAnswer: scoreCorrectAnswer,
                            databaseLength: lengthDatabase
                        }
                        localStorage.setItem('summary', JSON.stringify(summary))
                        location.replace("summary.html")
                    } else {
                        removeConfetti()
                        removeQna()
                        createQna(database[++index])
                    }
                })
                sectionCardQna.append(nextBtn)
            })
            answerGrupBtnElement.append(answerBtnElement)
        })
        sectionCardQna.append(questionElement)
        sectionCardQna.append(answerGrupBtnElement)
    }
}

function removeQna() {
    const question = document.querySelector('.qna-question')
    const answer = document.querySelector('.qna-answer')
    const nextBtn = document.querySelector('#next-btn')
    sectionCardQna.removeChild(question)
    sectionCardQna.removeChild(answer)
    sectionCardQna.removeChild(nextBtn)
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function removeEntities(text) {
    htmlEntities.map(entitie => {
        text = text.replaceAll(entitie.id, entitie.replace)
    })
    return text
}

function errorPage(errorMsg) {
    const errorFetch = document.createElement('div')
    errorFetch.className = 'error-page'
    const errorMessage = document.createElement('p')
    errorMessage.innerText = errorMsg
    const homeBtn = document.createElement('button')
    homeBtn.classList.add('primary-btn', 'wide')
    homeBtn.setAttribute('id', 'home-btn')
    homeBtn.innerText = 'HOME'
    homeBtn.addEventListener('click', () => {
        location.replace('./index.html')
    })
    errorFetch.appendChild(errorMessage)
    errorFetch.appendChild(homeBtn)
    return errorFetch
}

var maxParticleCount = 150; //set max confetti count
var particleSpeed = 2; //set the particle animation speed
var startConfetti; //call to start confetti animation
var stopConfetti; //call to stop adding confetti
var toggleConfetti; //call to start or stop the confetti animation depending on whether it's already running
var removeConfetti; //call to stop the confetti animation and remove all confetti immediately

(function () {
    startConfetti = startConfettiInner;
    stopConfetti = stopConfettiInner;
    toggleConfetti = toggleConfettiInner;
    removeConfetti = removeConfettiInner;
    var colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"]
    var streamingConfetti = false;
    var animationTimer = null;
    var particles = [];
    var waveAngle = 0;

    function resetParticle(particle, width, height) {
        particle.color = colors[(Math.random() * colors.length) | 0];
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 10 + 5;
        particle.tilt = Math.random() * 10 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = 0;
        return particle;
    }

    function startConfettiInner() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 16.6666667);
                };
        })();
        var canvas = document.getElementById("confetti-canvas");
        if (canvas === null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("id", "confetti-canvas");
            canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none");
            document.body.appendChild(canvas);
            canvas.width = width;
            canvas.height = height;
            window.addEventListener("resize", function () {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }, true);
        }
        var context = canvas.getContext("2d");
        while (particles.length < maxParticleCount)
            particles.push(resetParticle({}, width, height));
        streamingConfetti = true;
        if (animationTimer === null) {
            (function runAnimation() {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                if (particles.length === 0)
                    animationTimer = null;
                else {
                    updateParticles();
                    drawParticles(context);
                    animationTimer = requestAnimFrame(runAnimation);
                }
            })();
        }
    }

    function stopConfettiInner() {
        streamingConfetti = false;
    }

    function removeConfettiInner() {
        stopConfetti();
        particles = [];
    }

    function toggleConfettiInner() {
        if (streamingConfetti)
            stopConfettiInner();
        else
            startConfettiInner();
    }

    function drawParticles(context) {
        var particle;
        var x;
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            context.beginPath();
            context.lineWidth = particle.diameter;
            context.strokeStyle = particle.color;
            x = particle.x + particle.tilt;
            context.moveTo(x + particle.diameter / 2, particle.y);
            context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
            context.stroke();
        }
    }

    function updateParticles() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var particle;
        waveAngle += 0.01;
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            if (!streamingConfetti && particle.y < -15)
                particle.y = height + 100;
            else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(waveAngle);
                particle.y += (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }
            if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                if (streamingConfetti && particles.length <= maxParticleCount)
                    resetParticle(particle, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
})()