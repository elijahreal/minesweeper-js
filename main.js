let rows = 8;
let columns = 8;
let mines;

let tilesClicked = 0;
let firstClick = true;
let isGameOver = false;
let isVictorious = false;

let boardElement;
let board = [];

window.onload = function() { init(); }

function clamp(value, min, max) { return Math.min(max, Math.max(value, min)); }

function showMines()
{
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < columns; j++)
        {
            if (board[i][j] == "B")
            {
                document.getElementById(j + "-" + i).innerText = "B";
                document.getElementById(j + "-" + i).classList.add("x4");
            }
        }
    }
}

function addMine(eX, eY)
{
    let x = Math.floor(Math.random() * columns);
    let y = Math.floor(Math.random() * rows);

    while (board[y][x] == "B" || (x == eX && y == eY))
    {
        x = Math.floor(Math.random() * columns);
        y = Math.floor(Math.random() * rows);
    }

    board[y][x] = "B";
}

function clear()
{
    board = [];
    tilesClicked = 0;
    isGameOver = false;
    isVictorious = false;
    firstClick = true;
    boardElement.innerHTML = "";
}

function calcMines()
{
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < columns; j++)
        {
            let el = document.getElementById(j + "-" + i);
            if (board[i][j] != "B")
                board[i][j] = countMines(j, i);
        }
    }
}

function init()
{
    boardElement = document.getElementById("board");
    mines = Math.floor(Math.random() * 15) + 5;

    rows = Math.min(mines, 12);
    columns = Math.min(mines, 12);

    clear();

    boardElement.style.width = columns * 45 + columns * 4 + "px";
    boardElement.style.height = rows * 45 + rows * 4 + "px";

    if (mines >= columns * rows)
        mines = columns * rows - 1;

    for (let i = 0; i < rows; i++)
    {
        let row = [];

        for (let j = 0; j < columns; j++)
        {
            let cell = document.createElement("div");
            cell.style.borderRadius = "2px";
    
            if (i == 0 && j == 0) { cell.style.borderRadius = "4px 2px 2px 2px"; }
            else if (i == columns - 1 && j == 0) { cell.style.borderRadius = "2px 2px 2px 4px"; }
            else if (i == 0 && j == columns - 1) { cell.style.borderRadius = "2px 4px 2px 2px"; }
            else if (i == rows - 1 && j == columns - 1) { cell.style.borderRadius = "2px 2px 4px 2px"; }
    
            cell.id = j + "-" + i;
            cell.addEventListener("click", ()=>{ reveal(false, cell); })
            cell.addEventListener("contextmenu", ()=>{ reveal(true, cell); })

            boardElement.appendChild(cell);
            row.push("C");
        }

        board.push(row);
    }

    if (mines < 10) { document.getElementById("mineCount").innerText = "000" + mines; }
    else if (mines < 100) { document.getElementById("mineCount").innerText = "00" + mines; }
    else if (mines < 1000) { document.getElementById("mineCount").innerText = "0" + mines; }
    else { document.getElementById("mineCount").innerText = mines;}
}

function countMines(x, y)
{
    let count = 0;

    for (let i = y - 1; i < y + 2; i++)
    {
        for (let j = x - 1; j < x + 2; j++)
        {
            if (document.getElementById(j + "-" + i) != null)
            {
                let el = board[i][j];

                if (el == "B")
                    count++;
            }
        }
    }

    return count;
}

function gameOver()
{
    if (isVictorious)
        return;

    isGameOver = true;

    showMines();
}

function victory()
{
    if (isGameOver)
        return;

    isVictorious = true;

    clear();
    let el = document.createElement("div");
    el.style.width = columns * 45 + columns * 4 - 4 + "px";
    el.style.height = rows * 45 + rows * 4 - 4 + "px";
    el.style.borderRadius = "4px";
    el.style.fontSize = "30px";
    el.style.fontFamily = "Martian Mono";
    el.style.fontWeight = "600";
    el.innerText = "Victory!";
    el.classList.add("clicked");

    boardElement.appendChild(el);
}

function search(x, y)
{
    if (board[y][x] == 0)
    {
        for (let i = y - 1; i < y + 2; i++)
        {
            for (let j = x - 1; j < x + 2; j++)
                if (document.getElementById(j + "-" + i) != null)
                    if (!document.getElementById(j + "-" + i).classList.contains("clicked") && y != i && x != y)
                        search(j, i);
        }

        document.getElementById(x + "-" + y).classList.add("clicked");
        tilesClicked++;
    }
}

function reveal(right, cell)
{
    if (isVictorious || isGameOver || cell == null || cell.classList.contains("clicked"))
        return;

    let split = cell.id.split("-");
    let x = parseInt(split[0]);
    let y = parseInt(split[1]);

    if (firstClick && !right)
    {
        for (let i = 0; i < mines; i++) { addMine(x, y); }
        calcMines();

        firstClick = false;
        reveal(false, cell);
        return;
    }

    if (right)
    {
        if (cell.innerText == "F")
        {
            cell.innerText = "";
            cell.classList.remove("x3");
        }
        else
        {
            cell.innerText = "F";
            cell.classList.add("x3");
        }
    }
    else if (cell.innerText != "F" && !cell.classList.contains("clicked"))
    {
        cell.classList.add("clicked");

        if (board[y][x] == "B")
        {
            gameOver();
            cell.classList.remove("clicked");
            return;
        }
        else if (board[y][x] > 0)
        {
            cell.innerText = board[y][x];
            cell.classList.add("x" + board[y][x]);
        }
        else if (board[y][x] == 0)
        {
            reveal(false, document.getElementById(x - 1 + "-" + parseInt(y - 1)));
            reveal(false, document.getElementById(x + "-" + parseInt(y - 1)));
            reveal(false, document.getElementById(x + 1 + "-" + parseInt(y - 1)));
            reveal(false, document.getElementById(x - 1 + "-" + y));
            reveal(false, document.getElementById(x + 1 + "-" + y));
            reveal(false, document.getElementById(x - 1 + "-" + parseInt(y + 1)));
            reveal(false, document.getElementById(x + "-" + parseInt(y + 1)));
            reveal(false, document.getElementById(x + 1 + "-" + parseInt(y + 1)));
        }

        tilesClicked++;

        if (tilesClicked + mines == rows * columns)
            victory();
    }
}
