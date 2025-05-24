// Constants
const TAX_BRACKETS = [
    [0, 12000000, 0.06],
    [12000000, 46000000, 0.15],
    [46000000, 88000000, 0.24],
    [88000000, 150000000, 0.35],
    [150000000, 300000000, 0.38],
    [300000000, 500000000, 0.40],
    [500000000, Infinity, 0.42]
];

const BASIC_DEDUCTION = 1500000;
const EARNED_INCOME_SPECIAL_DEDUCTION = 0.02;
const CREDIT_CARD_DEDUCTION_RATE = 0.15;
const CREDIT_CARD_THRESHOLD_RATE = 0.25;

// Format number with comma separators
function formatNumber(number) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(number)) + '원';
}

// Calculate basic deduction
function calcBasicDeduction() {
    return BASIC_DEDUCTION;
}

// Calculate earned income special deduction
function calcEarnedIncomeSpecialDeduction(income) {
    return income * EARNED_INCOME_SPECIAL_DEDUCTION;
}

// Calculate credit card deduction
function calcCreditCardDeduction(creditCardUsage, income) {
    const threshold = income * CREDIT_CARD_THRESHOLD_RATE;
    if (creditCardUsage <= threshold) {
        return 0;
    }
    const deductibleAmount = creditCardUsage - threshold;
    return deductibleAmount * CREDIT_CARD_DEDUCTION_RATE;
}

// Get tax rate for given taxable income
function getTaxRate(taxableIncome) {
    for (const [start, end, rate] of TAX_BRACKETS) {
        if (taxableIncome >= start && taxableIncome < end) {
            return rate;
        }
    }
    return TAX_BRACKETS[TAX_BRACKETS.length - 1][2];
}

// Calculate tax
function calcTax(taxableIncome) {
    const taxRate = getTaxRate(taxableIncome);
    return taxableIncome * taxRate;
}

// Main calculation function
function calculate() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const creditCardUsage = parseFloat(document.getElementById('creditCard').value) || 0;
    
    // Calculate deductions
    const basic = calcBasicDeduction();
    const earnedSpecial = calcEarnedIncomeSpecialDeduction(income);
    const creditCard = calcCreditCardDeduction(creditCardUsage, income);
    const totalDeductions = basic + earnedSpecial + creditCard;
    
    // Calculate taxable income and tax
    const taxableIncome = Math.max(0, income - totalDeductions);
    const tax = calcTax(taxableIncome);
    
    // Update UI
    document.getElementById('totalDeductions').textContent = formatNumber(totalDeductions);
    document.getElementById('calculatedTax').textContent = formatNumber(tax);
    
    // Update deduction details
    const details = {
        '기본공제': basic,
        '근로소득 특별공제': earnedSpecial,
        '신용카드 등 소득공제': creditCard
    };
    
    const detailsContainer = document.getElementById('deductionDetails');
    detailsContainer.innerHTML = '';
    
    for (const [label, amount] of Object.entries(details)) {
        const detailCard = document.createElement('div');
        detailCard.className = 'detail-card';
        detailCard.innerHTML = `
            <span class="detail-label">${label}</span>
            <span class="detail-amount">${formatNumber(amount)}</span>
        `;
        detailsContainer.appendChild(detailCard);
    }
    
    // Show results
    document.querySelector('.results').classList.add('show');
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Calculate on page load
    calculate();
    
    // Add input event listeners
    document.getElementById('income').addEventListener('input', calculate);
    document.getElementById('creditCard').addEventListener('input', calculate);
});