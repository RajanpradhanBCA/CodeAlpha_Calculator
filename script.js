class Calculator {
            constructor() {
                this.previousOperandElement = document.querySelector('.previous-operand');
                this.currentOperandElement = document.querySelector('.current-operand');
                this.themeToggle = document.getElementById('themeToggle');
                this.body = document.body;
                this.clear();
                this.setupEventListeners();
                this.loadThemePreference();
            }

            clear() {
                this.currentOperand = '0';
                this.previousOperand = '';
                this.operation = undefined;
                this.shouldResetScreen = false;
            }

            delete() {
                if (this.currentOperand === '0') return;
                if (this.currentOperand.length === 1) {
                    this.currentOperand = '0';
                } else {
                    this.currentOperand = this.currentOperand.slice(0, -1);
                }
            }

            appendNumber(number) {
                if (this.shouldResetScreen) {
                    this.currentOperand = '';
                    this.shouldResetScreen = false;
                }
                
                // Prevent multiple decimal points
                if (number === '.' && this.currentOperand.includes('.')) return;
                
                // Replace initial 0 with number unless it's a decimal
                if (this.currentOperand === '0' && number !== '.') {
                    this.currentOperand = number;
                } else {
                    this.currentOperand += number;
                }
            }

            chooseOperation(operation) {
                if (this.currentOperand === '') return;
                
                if (this.previousOperand !== '') {
                    this.calculate();
                }
                
                this.operation = operation;
                this.previousOperand = this.currentOperand;
                this.shouldResetScreen = true;
            }

            calculate() {
                let computation;
                const prev = parseFloat(this.previousOperand);
                const current = parseFloat(this.currentOperand);
                
                if (isNaN(prev) || isNaN(current)) return;
                
                switch (this.operation) {
                    case '+':
                        computation = prev + current;
                        break;
                    case '-':
                        computation = prev - current;
                        break;
                    case '×':
                        computation = prev * current;
                        break;
                    case '÷':
                        if (current === 0) {
                            this.currentOperand = 'Error: Division by zero';
                            this.previousOperand = '';
                            this.operation = undefined;
                            return;
                        }
                        computation = prev / current;
                        break;
                    case '%':
                        computation = prev % current;
                        break;
                    case '√':
                        if (prev < 0) {
                            this.currentOperand = 'Error: Imaginary number';
                            this.previousOperand = '';
                            this.operation = undefined;
                            return;
                        }
                        computation = Math.sqrt(prev);
                        break;
                    default:
                        return;
                }
                
                // Handle very large or very small numbers with scientific notation
                if (computation > 1e12 || (computation < 1e-6 && computation > 0)) {
                    this.currentOperand = computation.toExponential(5);
                } else {
                    // Round to avoid floating point precision issues
                    this.currentOperand = Math.round(computation * 100000000) / 100000000;
                    this.currentOperand = this.currentOperand.toString();
                }
                
                this.operation = undefined;
                this.previousOperand = '';
                this.shouldResetScreen = true;
            }

            toggleSign() {
                if (this.currentOperand === '0') return;
                this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
            }

            calculateSquareRoot() {
                if (this.currentOperand === '') return;
                
                const current = parseFloat(this.currentOperand);
                if (current < 0) {
                    this.currentOperand = 'Error: Imaginary number';
                    return;
                }
                
                this.currentOperand = Math.sqrt(current).toString();
                this.shouldResetScreen = true;
            }

            calculatePercentage() {
                if (this.currentOperand === '') return;
                this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
            }

            getDisplayNumber(number) {
                if (number === 'Error: Division by zero' || number === 'Error: Imaginary number') return number;
                
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                
                let integerDisplay;
                
                if (isNaN(integerDigits)) {
                    integerDisplay = '0';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', {
                        maximumFractionDigits: 0
                    });
                }
                
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            }

            updateDisplay() {
                this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
                
                if (this.operation != null) {
                    this.previousOperandElement.innerText = 
                        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
                } else {
                    this.previousOperandElement.innerText = '';
                }
            }

            toggleTheme() {
                if (this.body.classList.contains('dark-theme')) {
                    this.body.classList.remove('dark-theme');
                    this.body.classList.add('light-theme');
                    this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    localStorage.setItem('calculatorTheme', 'light');
                } else {
                    this.body.classList.remove('light-theme');
                    this.body.classList.add('dark-theme');
                    this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                    localStorage.setItem('calculatorTheme', 'dark');
                }
            }

            loadThemePreference() {
                const savedTheme = localStorage.getItem('calculatorTheme');
                if (savedTheme === 'light') {
                    this.body.classList.remove('dark-theme');
                    this.body.classList.add('light-theme');
                    this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    this.body.classList.remove('light-theme');
                    this.body.classList.add('dark-theme');
                    this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }

            setupEventListeners() {
                // Number buttons
                document.querySelectorAll('[data-number]').forEach(button => {
                    button.addEventListener('click', () => {
                        this.appendNumber(button.getAttribute('data-number'));
                        this.updateDisplay();
                    });
                });

                // Operation buttons
                document.querySelectorAll('[data-operation]').forEach(button => {
                    button.addEventListener('click', () => {
                        const operation = button.getAttribute('data-operation');
                        
                        if (operation === '√') {
                            this.calculateSquareRoot();
                            this.updateDisplay();
                        } else if (operation === '±') {
                            this.toggleSign();
                            this.updateDisplay();
                        } else if (operation === '%') {
                            this.calculatePercentage();
                            this.updateDisplay();
                        } else {
                            this.chooseOperation(operation);
                            this.updateDisplay();
                        }
                    });
                });

                // Equals button
                document.querySelector('[data-action="calculate"]').addEventListener('click', () => {
                    this.calculate();
                    this.updateDisplay();
                });

                // Clear button
                document.querySelector('[data-action="clear"]').addEventListener('click', () => {
                    this.clear();
                    this.updateDisplay();
                });

                // Delete button
                document.querySelector('[data-action="delete"]').addEventListener('click', () => {
                    this.delete();
                    this.updateDisplay();
                });

                // Theme toggle button
                this.themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });

                // Keyboard support
                document.addEventListener('keydown', (event) => {
                    if (/[0-9]/.test(event.key)) {
                        this.appendNumber(event.key);
                        this.updateDisplay();
                    } else if (event.key === '.') {
                        this.appendNumber('.');
                        this.updateDisplay();
                    } else if (event.key === '+' || event.key === '-' || event.key === '*') {
                        let operation = event.key;
                        if (operation === '*') operation = '×';
                        this.chooseOperation(operation);
                        this.updateDisplay();
                    } else if (event.key === '/') {
                        event.preventDefault(); // Prevent browser quick search
                        this.chooseOperation('÷');
                        this.updateDisplay();
                    } else if (event.key === 'Enter' || event.key === '=') {
                        event.preventDefault();
                        this.calculate();
                        this.updateDisplay();
                    } else if (event.key === 'Backspace') {
                        this.delete();
                        this.updateDisplay();
                    } else if (event.key === 'Escape') {
                        this.clear();
                        this.updateDisplay();
                    } else if (event.key === '%') {
                        this.calculatePercentage();
                        this.updateDisplay();
                    } else if (event.key === 'r' || event.key === 'R') {
                        this.calculateSquareRoot();
                        this.updateDisplay();
                    }
                });
            }
        }

        // Initialize the calculator
        const calculator = new Calculator();