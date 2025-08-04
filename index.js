"use strict";
const wordsLength = 5;
const maxGuesses = 6;
const chosenWord = 
// @ts-ignore from another file
validWords[Math.round(Math.random() * (validWords.length - 1))];
var LetterResult;
(function (LetterResult) {
    LetterResult[LetterResult["BLACK"] = 0] = "BLACK";
    LetterResult[LetterResult["GREY"] = 1] = "GREY";
    LetterResult[LetterResult["YELLOW"] = 2] = "YELLOW";
    LetterResult[LetterResult["GREEN"] = 3] = "GREEN";
})(LetterResult || (LetterResult = {}));
function getEmptyWord() {
    const emptyWord = {
        characters: [],
        results: [],
    };
    for (let j = 0; j < wordsLength; j++) {
        emptyWord.characters.push("");
        emptyWord.results.push(LetterResult.BLACK);
    }
    return emptyWord;
}
function addLetter(state, letter) {
    const wordIndex = state.numberOfWordsSolidified;
    for (let i = 0; i < state.words[wordIndex].characters.length; i++) {
        if (state.words[wordIndex].characters[i] == "") {
            state.words[wordIndex].characters[i] = letter;
            break;
        }
    }
    return state;
}
function removeLetter(state) {
    const wordIndex = state.numberOfWordsSolidified;
    for (let i = state.words[wordIndex].characters.length - 1; i >= 0; i--) {
        if (state.words[wordIndex].characters[i] != "") {
            state.words[wordIndex].characters[i] = "";
            break;
        }
    }
    return state;
}
function solidifyWord(state) {
    const wordAttempt = state.words[state.numberOfWordsSolidified].characters.join("");
    let wordAccepted = false;
    if (state.words[state.numberOfWordsSolidified].characters[wordsLength - 1] !=
        "" &&
        // @ts-ignore
        validWords.includes(wordAttempt)) {
        let wordSoFar = ""; // i know not the best solution but oh well lol
        wordAccepted = true;
        state.words[state.numberOfWordsSolidified].characters.forEach((character, index) => {
            wordSoFar += character;
            if ([...chosenWord].includes(character)) {
                if (chosenWord[index] == wordAttempt[index]) {
                    state.words[state.numberOfWordsSolidified].results[index] =
                        LetterResult.GREEN;
                }
                else {
                    // Word contains this letter, not at this location.
                    // cases:
                    //  the actual word contains the letter the same amount of times as our guesses.
                    //   yellow!
                    //  the actual word contains the letter more than the amount of times it appears in our guesses.
                    //   yellow!
                    //  the actual word contains the letter less than the amount of times it appears in our guesses
                    //    let:
                    //     a = the number of times it appears in the actual word, and
                    //     i = the number of times it has already appeared up to this index
                    //     g = the correct number of times this letter appears in the word
                    //    in principle, we should only yellow the first a - g appearances
                    //    so:
                    //     a - g >= i --> yellow!
                    //     a - g < i --> grey!
                    const letterAppearancesInActualWord = chosenWord.split(character).length - 1;
                    const letterAppearancesInOurWord = wordAttempt.split(character).length - 1;
                    const letterAppearancesInOurWordSoFar = wordSoFar.split(character).length - 1;
                    const correctLetterAppearances = [...wordAttempt].filter((letter, i) => letter == chosenWord[i] && letter == character).length;
                    if (letterAppearancesInActualWord >= letterAppearancesInOurWord) {
                        state.words[state.numberOfWordsSolidified].results[index] =
                            LetterResult.YELLOW;
                    }
                    else {
                        if (letterAppearancesInActualWord - correctLetterAppearances >=
                            letterAppearancesInOurWordSoFar) {
                            state.words[state.numberOfWordsSolidified].results[index] =
                                LetterResult.YELLOW;
                        }
                        else {
                            state.words[state.numberOfWordsSolidified].results[index] =
                                LetterResult.GREY;
                        }
                    }
                }
            }
            else {
                state.words[state.numberOfWordsSolidified].results[index] =
                    LetterResult.GREY;
            }
        });
        state.numberOfWordsSolidified++;
    }
    return [state, wordAccepted];
}
function renderState(state, dom) {
    function getRowDomFromWord(word) {
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");
        word.characters.forEach((character, index) => {
            const letterElement = document.createElement("div");
            letterElement.classList.add("letter");
            letterElement.classList.add(`letter-${LetterResult[word.results[index]].toLowerCase()}`);
            const letterTextElement = document.createElement("span");
            letterTextElement.innerText = character.toUpperCase();
            letterElement.appendChild(letterTextElement);
            rowElement.appendChild(letterElement);
        });
        return rowElement;
    }
    const rowsElement = document.createElement("div");
    rowsElement.setAttribute("id", "rows");
    state.words.forEach((word) => {
        rowsElement.appendChild(getRowDomFromWord(word));
    });
    for (let i = 0; i < maxGuesses - state.words.length; i++) {
        rowsElement.appendChild(getRowDomFromWord(getEmptyWord()));
    }
    dom.replaceChildren(rowsElement);
    if (state.gameOver) {
        const gameOverInfo = document.createElement("p");
        gameOverInfo.innerText = "Game Over! ";
        gameOverInfo.innerText +=
            state.words[state.words.length - 1].characters.join("") == chosenWord
                ? "You won! :dofblush:"
                : `You lost! :garfsob: Word was ${chosenWord}.`;
        gameOverInfo.innerText += " Press `r` to reset.";
        dom.appendChild(gameOverInfo);
    }
}
function createKeyboard() {
    const keyboardElement = document.querySelector("#keyboard");
    const keys = [];
    const keyboardLayout = ["vmlcpxfouj", "strdy.naei", "!kqgwzbh@"];
    function createKeyDom(text) {
        const keyDom = document.createElement("div");
        keyDom.classList.add("key");
        const textDom = document.createElement("span");
        textDom.innerText = text;
        keyDom.appendChild(textDom);
        if (text.length > 1)
            keyDom.style.fontSize = "10px";
        if (text == "ENTER") {
            keys.push({ domTarget: keyDom, keyPressSimulated: "Enter" });
        }
        else if (text == "BACK") {
            keys.push({ domTarget: keyDom, keyPressSimulated: "Backspace" });
        }
        else {
            keys.push({ domTarget: keyDom, keyPressSimulated: text });
        }
        return keyDom;
    }
    function createKeyRowDom(row) {
        const keyRowDom = document.createElement("div");
        keyRowDom.classList.add("key-row");
        for (let i = 0; i < row.length; i++) {
            let keyText = row[i];
            if (keyText == "@")
                keyText = "ENTER";
            if (keyText == "!")
                keyText = "BACK";
            keyRowDom.appendChild(createKeyDom(keyText));
        }
        return keyRowDom;
    }
    keyboardLayout.forEach((row) => {
        keyboardElement.appendChild(createKeyRowDom(row));
    });
    return keys;
}
function handleInput(state, e) {
    if (state.gameOver) {
        if (e.key.toLowerCase() == "r") {
            window.location.href = window.location.href;
        }
        else
            return state;
    }
    if (e.key == "Enter") {
        let wordAccepted;
        [state, wordAccepted] = solidifyWord({ ...state });
        // now check if the game is over
        if (state.words.length == maxGuesses ||
            state.words[state.words.length - 1].characters.join("") == chosenWord) {
            state.gameOver = true;
        }
        else if (wordAccepted) {
            state.words.push(getEmptyWord());
        }
    }
    else if (e.key == "Backspace") {
        if (e.metaKey || e.altKey) {
            for (let i = 0; i < wordsLength; i++)
                state = removeLetter({ ...state });
        }
        state = removeLetter({ ...state });
    }
    else if ("abcdefghijklmnopqrstuvwxyz".includes(e.key.toLowerCase())) {
        state = addLetter({ ...state }, e.key.toLowerCase());
    }
    return state;
}
document.addEventListener("DOMContentLoaded", function main() {
    let state = {
        gameOver: false,
        numberOfWordsSolidified: 0,
        words: [getEmptyWord()],
    };
    const dom = document.getElementById("app");
    if (dom == undefined) {
        console.log("app element not found.");
        return;
    }
    createKeyboard().forEach((key) => {
        function keyPress(_) {
            // @ts-ignore :akl:
            state = handleInput({ ...state }, { key: key.keyPressSimulated });
            renderState({ ...state }, dom);
        }
        key.domTarget.addEventListener("click", keyPress);
        key.domTarget.addEventListener("touchstart", keyPress);
    });
    document.addEventListener("keydown", (e) => {
        state = handleInput({ ...state }, e);
        renderState({ ...state }, dom);
    });
    renderState({ ...state }, dom);
});
