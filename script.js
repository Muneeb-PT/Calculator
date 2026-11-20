const screen = document.getElementById("screen");
const screen2 = document.getElementById("screen2");
const backspace = document.getElementById("cancell");

let calculation = "0";
let finished = false;

function updateScreen() {
    screen.textContent = calculation;
}

function showValue(button) {
    const value = button.value || button.textContent.trim();

    if (finished || calculation === "Error") {
        calculation = "0";
        screen2.textContent = "";
        finished = false;
    }

    if (value === ".") {
        const currentNumber = calculation.split(/[+*/()-]/).pop();
        if (currentNumber.includes(".")) return;
        calculation += currentNumber === "" ? "0." : ".";
    } else if (calculation === "0") {
        calculation = value;
    } else {
        calculation += value;
    }

    updateScreen();
}

function showSing(button) {
    const value = button.value || button.textContent.trim();

    if (value === "C") {
        calculation = "0";
        screen2.textContent = "";
        finished = false;
        updateScreen();
        return;
    }

    if (value === "=") {
        calculate();
        return;
    }

    if (value === "+/-") {
        const match = calculation.match(/(-?\d*\.?\d+)$/);
        if (!match) return;
        const start = match.index;
        const number = Number(match[0]);
        calculation = calculation.slice(0, start) + String(number * -1);
        updateScreen();
        return;
    }

    if (value === "%") {
        const match = calculation.match(/(-?\d*\.?\d+)$/);
        if (!match) return;
        const start = match.index;
        calculation = calculation.slice(0, start) + String(Number(match[0]) / 100);
        updateScreen();
        return;
    }

    if (value === "()") {
        const opens = (calculation.match(/\(/g) || []).length;
        const closes = (calculation.match(/\)/g) || []).length;
        const last = calculation.slice(-1);
        if (calculation === "0" || /[+\-*/(]/.test(last)) {
            calculation = calculation === "0" ? "(" : calculation + "(";
        } else if (opens > closes) {
            calculation += ")";
        } else {
            calculation += "*(";
        }
        updateScreen();
        return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
        if (finished) finished = false;
        if (calculation === "Error") calculation = "0";
        if (/[+*/.-]$/.test(calculation)) {
            calculation = calculation.slice(0, -1) + value;
        } else {
            calculation += value;
        }
        updateScreen();
    }
}

function calculate() {
    const expression = calculation;
    if (!expression || expression === "Error") return;

    // Only allow numbers, arithmetic operators, decimal points and parentheses.
    if (!/^[0-9+*/().\s-]+$/.test(expression)) {
        calculation = "Error";
        screen2.textContent = "That expression looks confused 😅";
        updateScreen();
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expression + ')')();
        if (!Number.isFinite(result)) throw new Error("Invalid result");
        const rounded = Number.parseFloat(result.toPrecision(12));
        screen2.textContent = "= " + rounded;
        calculation = String(rounded);
        finished = true;
        updateScreen();
    } catch (error) {
        calculation = "Error";
        screen2.textContent = "Oops! Check that calculation 🤔";
        finished = true;
        updateScreen();
    }
}

backspace.addEventListener("click", function () {
    if (finished || calculation === "Error") {
        calculation = "0";
        screen2.textContent = "";
        finished = false;
    } else {
        calculation = calculation.slice(0, -1) || "0";
    }
    updateScreen();
});

// The original random-colour buttons stay because they are part of the fun.
function showColor() {
    const colors = ["#f8a384", "#c8fd8b", "#bcfbfb", "#fac5fa", "#fcf7af"];
    document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
}

function showColorShell() {
    const shellColors = ["#000000", "#335d02", "#010858", "#faf6fa", "#f9e901"];
    const keyColors = ["#ffffff", "#88ffeb", "#000000", "#fdc6fd", "#fffeeb"];
    const clearColors = ["#a40000", "#b70000", "#b53c00", "#ffae00", "#ff0000"];
    const equalColors = ["#15ff00", "#00ffd5", "#0d6d00", "#2cb222", "#00ff9d"];

    const random = (items) => items[Math.floor(Math.random() * items.length)];
    document.getElementById("body").style.backgroundColor = random(shellColors);
    document.querySelectorAll("#number button").forEach((button) => {
        button.style.backgroundColor = random(keyColors);
    });
    document.getElementById("c").style.backgroundColor = random(clearColors);
    document.getElementById("eq").style.backgroundColor = random(equalColors);
}

document.addEventListener("keydown", function (event) {
    if (/^[0-9.]$/.test(event.key)) {
        showValue({ value: event.key });
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        showSing({ value: event.key });
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        backspace.click();
    } else if (event.key === "Escape") {
        showSing({ value: "C" });
    }
});
