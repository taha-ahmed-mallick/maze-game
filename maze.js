let maze = document.getElementsByTagName('canvas')[0];
let ctx = maze.getContext('2d');

maze.width = window.innerWidth;
maze.height = window.innerHeight;

let size = window.innerWidth - 50;

let selectStartingCell;
let selectEndingCell;

if (window.innerWidth > window.innerHeight) size = window.innerHeight - 100;

class Maze {
      constructor(size, rows, columns) {
            this.size = size;
            this.rows = rows;
            this.columns = columns;
            this.grid = [];
            this.stack = [];
      }

      setup() {
            for (let r = 0; r < this.rows; r++) {
                  let row = [];
                  for (let c = 0; c < this.columns; c++) {
                        let cell = new Cell(r, c);
                        row.push(cell);
                  }
                  this.grid.push(row);
            }
            console.table(this.grid);
            for (let r = 0; r < this.rows; r++) {
                  for (let c = 0; c < this.columns; c++) {
                        this.grid[r][c].neighbours = this.checkNeighbours(this.grid[r][c]);
                  }
            }
      }

      drawGrid() {
            maze.width = this.size;
            maze.height = this.size;

            for (let r = 0; r < this.rows; r++) {
                  for (let c = 0; c < this.columns; c++) {
                        let grid = this.grid;
                        grid[r][c].show(this.size, this.rows, this.columns);
                  }
            }
      }

      backTrack() {

            for (let i = this.stack.length - 1; i > -1; i--) {
                  if (this.stack[i].neighbours.length > 0) {
                        for (let j = 0; j < this.stack[i].neighbours.length; j++) {
                              if (this.stack[i].neighbours[j].visited == true) {
                                    this.stack[i].neighbours.splice(j, 1);
                              } else {
                                    return [this.stack[i].neighbours[j], this.stack[i]];
                              }
                        }
                  }
            }
      }

      checkNeighbours(currentBox) {

            let neighbours = [];

            neighbours.push(this.grid[currentBox.rowNum][currentBox.colNum + 1]);
            neighbours.push(this.grid[currentBox.rowNum][currentBox.colNum - 1]);
            try {
                  neighbours.push(this.grid[currentBox.rowNum - 1][currentBox.colNum]);
            } catch (e) { }
            try {
                  neighbours.push(this.grid[currentBox.rowNum + 1][currentBox.colNum]);
            } catch (e) { }

            for (let i = 0; i < neighbours.length; i++) {
                  if (neighbours[i] == null) {
                        neighbours.splice(i, 1);
                  }
            }

            return neighbours;
      }

      drawPath() {
            let startingCell = [];
            let currentCell;
            let saveBacktrack = [];

            for (let i = 0; i < this.grid[0].length; i++) {
                  startingCell.push(this.grid[0][i]);
                  startingCell.push(this.grid[i][0]);
            }
            for (let i = 0; i < 2; i++) {
                  startingCell.pop();
            }

            selectStartingCell = startingCell[Math.floor(Math.random() * startingCell.length)];
            selectEndingCell = this.grid[this.grid.length - selectStartingCell.rowNum - 1][this.grid[0].length - selectStartingCell.colNum - 1];

            selectStartingCell.start = true;
            selectEndingCell.end = true;

            if (selectStartingCell.rowNum == selectStartingCell.colNum) {
                  let rowCol = Math.random();

                  if (rowCol < 0.5) {
                        selectStartingCell.wall.topWall = false;
                        selectEndingCell.wall.bottomWall = false;
                  } else {
                        selectStartingCell.wall.leftWall = false;
                        selectEndingCell.wall.rightWall = false;
                  }
            } else {
                  if (selectStartingCell.rowNum == 0) {
                        selectStartingCell.wall.topWall = false;
                  } else {
                        selectStartingCell.wall.leftWall = false;
                  }
                  if (selectEndingCell.rowNum == this.grid.length - 1) {
                        selectEndingCell.wall.bottomWall = false;
                  } else {
                        selectEndingCell.wall.rightWall = false;
                  }
            }

            currentCell = selectStartingCell;
            currentCell.visited = true;
            this.stack.push(currentCell);


            while (this.stack.length != this.grid.length * this.grid[0].length) {
                  let lastCell = currentCell;
                  currentCell = currentCell.neighbours[Math.floor(Math.random() * currentCell.neighbours.length)];


                  if (currentCell == undefined) {
                        saveBacktrack = this.backTrack();
                        while (saveBacktrack == undefined) {
                              saveBacktrack = this.backTrack();
                        }
                        currentCell = saveBacktrack[0];
                        lastCell = saveBacktrack[1];
                  }

                  if (lastCell.rowNum - currentCell.rowNum == -1 && lastCell.colNum - currentCell.colNum == 0) {
                        lastCell.wall.bottomWall = false;
                        currentCell.wall.topWall = false;
                  } else if (lastCell.rowNum - currentCell.rowNum == 1 && lastCell.colNum - currentCell.colNum == 0) {
                        lastCell.wall.topWall = false;
                        currentCell.wall.bottomWall = false;
                  } else if (lastCell.rowNum - currentCell.rowNum == 0 && lastCell.colNum - currentCell.colNum == -1) {
                        lastCell.wall.rightWall = false;
                        currentCell.wall.leftWall = false;
                  } else if (lastCell.rowNum - currentCell.rowNum == 0 && lastCell.colNum - currentCell.colNum == 1) {
                        lastCell.wall.leftWall = false;
                        currentCell.wall.rightWall = false;
                  }
                  for (let i = 0; i < currentCell.neighbours.length; i++) {
                        let rowNo = currentCell.neighbours[i].rowNum;
                        let colNo = currentCell.neighbours[i].colNum;
                        for (let r = 0; r < this.grid[rowNo][colNo].neighbours.length; r++) {
                              if ((this.grid[rowNo][colNo].neighbours[r].rowNum == currentCell.rowNum && this.grid[rowNo][colNo].neighbours[r].colNum == currentCell.colNum) || this.grid[rowNo][colNo].neighbours[r].visited == true) this.grid[rowNo][colNo].neighbours.splice(r, 1);
                        }
                  }
                  currentCell.visited = true;
                  this.stack.push(currentCell);
            }

            ctx.clearRect(0, 0, size, size);
            for (let r = 0; r < this.rows; r++) {
                  for (let c = 0; c < this.columns; c++) {
                        this.grid[r][c].show(this.size, this.rows, this.columns);
                  }
            }
      }
}

class Cell {
      constructor(rowNum, colNum) {
            this.rowNum = rowNum;
            this.colNum = colNum;
            this.visited = false;
            this.wall = {
                  topWall: true,
                  rightWall: true,
                  bottomWall: true,
                  leftWall: true
            };
            this.neighbours = [];
            this.start = false;
            this.end = false;
      }

      drawTopWall(x, y, size, columns, rows) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size / columns, y);
            ctx.stroke();
      }

      drawRightWall(x, y, size, columns, rows) {
            ctx.beginPath();
            ctx.moveTo(x + size / columns, y);
            ctx.lineTo(x + size / columns, y + size / rows);
            ctx.stroke();
      }

      drawBottomWall(x, y, size, columns, rows) {
            ctx.beginPath();
            ctx.moveTo(x, y + size / rows);
            ctx.lineTo(x + size / columns, y + size / rows);
            ctx.stroke();
      }

      drawLeftWall(x, y, size, columns, rows) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + size / rows);
            ctx.stroke();
      }

      show(size, rows, columns) {
            let x = this.colNum * size / columns;
            let y = this.rowNum * size / rows;

            ctx.strokeStyle = "white";
            ctx.fillStyle = "#ffffff00";
            ctx.lineWidth = 2;

            if (this.wall.topWall) this.drawTopWall(x, y, size, columns, rows);
            if (this.wall.rightWall) this.drawRightWall(x, y, size, columns, rows);
            if (this.wall.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
            if (this.wall.leftWall) this.drawLeftWall(x, y, size, columns, rows);
      }
}

let newMaze = new Maze(size, 15, 15);
newMaze.setup();
newMaze.drawGrid();
newMaze.drawPath();