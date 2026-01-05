const display = document.getElementById("display");
const historyList = document.getElementById("historyList");

let expression = "";

/* ================= INPUT ================= */
function addValue(val) {
    expression += val;
    display.value = expression;
}

function clearAll() {
    expression = "";
    display.value = "";
}

function deleteOne() {
    expression = expression.slice(0, -1);
    display.value = expression;
}

/* ================= PRIORITY ================= */
const precedence = { "+":1, "-":1, "*":2, "/":2, "^":3 };

/* ================= INFIX → POSTFIX ================= */
function toPostfix(exp) {
    let output = [];
    let stack = [];
    let tokens = exp.match(/(\d+(\.\d+)?|sin|cos|tan|[()+\-*/^])/g);

    tokens.forEach(token => {
        if (!isNaN(token)) output.push(token);
        else if (["sin","cos","tan"].includes(token)) stack.push(token);
        else if (token === "(") stack.push(token);
        else if (token === ")") {
            while (stack.at(-1) !== "(") output.push(stack.pop());
            stack.pop();
            if (["sin","cos","tan"].includes(stack.at(-1)))
                output.push(stack.pop());
        } else {
            while (stack.length && precedence[stack.at(-1)] >= precedence[token])
                output.push(stack.pop());
            stack.push(token);
        }
    });

    return output.concat(stack.reverse());
}

/* ================= HITUNG ================= */
function evalPostfix(postfix) {
    let stack = [];
    postfix.forEach(token => {
        if (!isNaN(token)) stack.push(parseFloat(token));
        else if (token === "sin") stack.push(Math.sin(stack.pop()));
        else if (token === "cos") stack.push(Math.cos(stack.pop()));
        else if (token === "tan") stack.push(Math.tan(stack.pop()));
        else {
            let b = stack.pop();
            let a = stack.pop();
            stack.push(
                token === "+" ? a + b :
                token === "-" ? a - b :
                token === "*" ? a * b :
                token === "/" ? a / b :
                Math.pow(a, b)
            );
        }
    });
    return stack[0];
}

function calculate() {
    try {
        let postfix = toPostfix(expression);
        let result = evalPostfix(postfix);
        addHistory(expression, result);
        expression = result.toString();
        display.value = expression;
    } catch {
        display.value = "Error";
        expression = "";
    }
}

/* ================= HISTORY (DIPERBAIKI) ================= */
function addHistory(exp, result) {
    const li = document.createElement("li");

    li.innerHTML = `
        <div class="expr">${exp}</div>
        <div class="result">= ${result}</div>
        <div class="time">${new Date().toLocaleTimeString()}</div>
    `;

    li.onclick = () => {
        expression = result.toString();
        display.value = expression;
    };

    historyList.prepend(li);
}

function clearHistory() {
    historyList.innerHTML = "";
}

/* ================= KEYBOARD ================= */
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") addValue(e.key);
    if ("+-*/^().".includes(e.key)) addValue(e.key);

    if (e.key === "Enter") {
        e.preventDefault();
        calculate();
    }
    if (e.key === "Backspace") deleteOne();
    if (e.key === "Escape") clearAll();
});