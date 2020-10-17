// Список квадратиков
const list = document.querySelector(".square-list");

// Уровень
let level = Number(sessionStorage.getItem("level") || 0);

// Таймер
let timerId = null;
let timer = document.querySelector('header .timer');
let curSecond =  sessionStorage.getItem("curSecond") || 10;
timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';

// Ширина секции под квадратики
let width = getComputedStyle(document.querySelector(".playing-field")).getPropertyValue('--width-playing-field');
width = width.substr(0, width.length-2) - 20;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextLevel () {
    // Очищаем лист
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    // Ширина одного квадратика
    let w = width / (level + 1) - 6;

    // Цвет квадратика
    let r = getRandomInt(0, 180);
    let g = getRandomInt(0, 180);
    let b = getRandomInt(0, 180);

    // Количество квадратиков
    const n = (level + 1) ** 2;

    // Уникальный квадратик
    let goodCell = getRandomInt(0, n - 1);

    const styles = `flex: 0 0 auto;
                    width: ${w}px;
                    height: ${w}px;
                    border: 1px solid grey;
                    cursor: pointer;
                    border-radius: 5px;
                    margin: 3px;`;

    for (let i = 0; i < n; i++) {
        let squareElem = document.createElement('li');
        let levelElem = document.querySelector('header .level');
        levelElem.innerHTML = 'Уровень ' + level;

        if (i === goodCell) {
            squareElem.style = `background-color: rgb( ${r + 75 / level}, ${g + 75 / level}, ${b + 75 / level}); ` + styles;
            squareElem.onclick = function () {
                level++;
                sessionStorage.setItem('level', level.toString());
                    if (timerId == null) {
                        timerId = setInterval(() => {
                            curSecond--;
                            sessionStorage.setItem('curSecond', curSecond.toString());
                            timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';
                            if (curSecond === 0) {
                                clearInterval(timerId);
                                alert("Время вышло!\nВаш результат: " + level + " уровней за 10 секунд.\nВы лучший!");
                                sessionStorage.clear();
                                level = 0;
                                curSecond = 10;
                                timerId = null;
                                nextLevel();
                            }
                        }, 1000);
                    }
                nextLevel();
            };
        } else {
            squareElem.style = `background-color: rgb(${r}, ${g}, ${b});` + styles;
        }

        if (level === 0) {
            squareElem.innerHTML = '<div style="font-size: 30px; display: flex; justify-content: center; color: aqua">Кликните для начала игры</div>';
            timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';
        }

        list.append(squareElem);
    }
}

nextLevel();
