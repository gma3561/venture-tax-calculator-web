// Constants - 고정값
const INVEST_AMT = 30000000;  // 3천만원 투자
const CASH_BACK_AMT = 25000000;  // 2천5백만원 현금리턴

// 세율 테이블
const TAX_TABLE = [
    [14000000, 0.06, 0],
    [50000000, 0.15, 1400000],
    [88000000, 0.24, 7640000],
    [150000000, 0.35, 19640000],
    [300000000, 0.38, 25640000],
    [500000000, 0.40, 47640000],
    [1000000000, 0.42, 83640000],
    [Infinity, 0.45, 183640000]
];

// 벤처투자 소득공제 구간
const VENTURE_BRACKETS = [
    [30000000, 1.0],     // 3천만원 이하 100%
    [50000000, 0.7],     // 5천만원 이하 70%
    [Infinity, 0.3]      // 5천만원 초과 30%
];

// Format number with comma separators
function formatNumber(number) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(number)) + '원';
}

// 근로소득공제 계산
function calcEarnedIncomeDeduction(salary) {
    if (salary <= 5000000) {
        return Math.floor(salary * 0.7);
    } else if (salary <= 15000000) {
        return Math.floor(3500000 + (salary - 5000000) * 0.4);
    } else if (salary <= 45000000) {
        return Math.floor(7500000 + (salary - 15000000) * 0.15);
    } else if (salary <= 100000000) {
        return Math.floor(12000000 + (salary - 45000000) * 0.05);
    } else {
        return Math.floor(14750000 + (salary - 100000000) * 0.02);
    }
}

// 벤처투자 소득공제 계산
function calcVentureDeduction(amount) {
    let remaining = amount;
    let deduction = 0;
    let lower = 0;
    
    for (const [upper, rate] of VENTURE_BRACKETS) {
        const span = Math.min(remaining, upper - lower);
        if (span <= 0) break;
        
        deduction += span * rate;
        remaining -= span;
        lower = upper;
    }
    
    return Math.floor(deduction);
}

// 세율 구간 정보 가져오기
function getTaxBracketInfo(taxableIncome) {
    let bracketDesc = "";
    let bracketRate = 0;
    
    for (let i = 0; i < TAX_TABLE.length; i++) {
        const [limit, rate] = TAX_TABLE[i];
        if (taxableIncome <= limit) {
            bracketRate = rate * 100;
            if (i === 0) {
                bracketDesc = "1,400만원 이하 (6%)";
            } else if (i === 1) {
                bracketDesc = "1,400만원 초과 5,000만원 이하 (15%)";
            } else if (i === 2) {
                bracketDesc = "5,000만원 초과 8,800만원 이하 (24%)";
            } else if (i === 3) {
                bracketDesc = "8,800만원 초과 1억5,000만원 이하 (35%)";
            } else if (i === 4) {
                bracketDesc = "1억5,000만원 초과 3억원 이하 (38%)";
            } else if (i === 5) {
                bracketDesc = "3억원 초과 5억원 이하 (40%)";
            } else if (i === 6) {
                bracketDesc = "5억원 초과 10억원 이하 (42%)";
            } else {
                bracketDesc = "10억원 초과 (45%)";
            }
            break;
        }
    }
    
    return { desc: bracketDesc, rate: bracketRate };
}

// 세금 계산
function calcTax(base) {
    for (const [up, rate, deduction] of TAX_TABLE) {
        if (base <= up) {
            return Math.max(0, Math.floor(base * rate - deduction));
        }
    }
    return 0;
}

// 신용카드 공제 계산
function calcCreditCardDeduction(salary, creditCardSpending) {
    const minSpending = salary * 0.25;
    if (creditCardSpending <= minSpending) {
        return 0;
    }
    
    const deductibleAmount = creditCardSpending - minSpending;
    const deduction = Math.floor(deductibleAmount * 0.15);
    
    // 최대 공제한도
    let maxDeduction;
    if (salary <= 70000000) {
        maxDeduction = 3000000;
    } else if (salary <= 120000000) {
        maxDeduction = 2500000;
    } else {
        maxDeduction = 2000000;
    }
    
    return Math.min(deduction, maxDeduction);
}

// 기본 공제 계산
function calculateDefaultDeductions(salary, dependentCount, elderlyCount) {
    // 1. 기본공제 (본인)
    const personalDeduction = 1500000;
    
    // 2. 부양가족 공제
    const dependentDeduction = dependentCount * 1500000;
    
    // 3. 경로우대 추가공제
    const elderlyDeduction = elderlyCount * 1000000;
    
    // 4. 국민연금 (4.5%)
    const nationalPension = Math.floor(salary * 0.045);
    
    // 5. 건강보험 (3.545%)
    const healthInsurance = Math.floor(salary * 0.03545);
    
    // 6. 고용보험 (0.8%)
    const employmentInsurance = Math.floor(salary * 0.008);
    
    // 7. 장기요양보험 (건강보험의 12.81%)
    const longTermCare = Math.floor(healthInsurance * 0.1281);
    
    const insuranceTotal = nationalPension + healthInsurance + employmentInsurance + longTermCare;
    
    return {
        personal: personalDeduction,
        dependent: dependentDeduction,
        elderly: elderlyDeduction,
        nationalPension: nationalPension,
        healthInsurance: healthInsurance,
        employmentInsurance: employmentInsurance,
        longTermCare: longTermCare,
        insuranceTotal: insuranceTotal
    };
}

// 입력값 업데이트
document.getElementById('income').addEventListener('input', function() {
    const value = parseFloat(this.value) || 0;
    document.getElementById('currentIncome').textContent = formatNumber(value);
});

document.getElementById('creditCard').addEventListener('input', function() {
    const value = parseFloat(this.value) || 0;
    document.getElementById('currentCreditCard').textContent = formatNumber(value);
});

// 탭 전환
function showTab(tabName) {
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 선택된 탭 표시
    document.getElementById(tabName).style.display = 'block';
    
    // 선택된 탭 버튼 활성화
    event.target.classList.add('active');
}

// 계산 함수
function calculate() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const creditCard = parseFloat(document.getElementById('creditCard').value) || 0;
    const dependentCount = parseInt(document.getElementById('dependent').value) || 0;
    const elderlyCount = parseInt(document.getElementById('elderly').value) || 0;
    
    if (income === 0) {
        alert('총급여액을 입력해주세요.');
        return;
    }
    
    // 근로소득공제
    const earnedIncomeDeduction = calcEarnedIncomeDeduction(income);
    
    // 기본 공제들
    const autoDeductions = calculateDefaultDeductions(income, dependentCount, elderlyCount);
    
    // 신용카드 공제
    const creditCardDeduction = calcCreditCardDeduction(income, creditCard);
    
    // 공제 합계 (벤처투자 제외)
    const baseDeductions = earnedIncomeDeduction + 
                          autoDeductions.personal + 
                          autoDeductions.dependent + 
                          autoDeductions.elderly + 
                          autoDeductions.insuranceTotal + 
                          creditCardDeduction;
    
    // 벤처투자 소득공제
    const ventureDeduction = calcVentureDeduction(INVEST_AMT);
    const maxDeductionByIncome = Math.max(0, income - baseDeductions);
    const actualVentureDeduction = Math.min(ventureDeduction, maxDeductionByIncome);
    
    // 과세표준 계산
    const preVentureTaxable = Math.max(0, income - baseDeductions);
    const postVentureTaxable = Math.max(0, preVentureTaxable - actualVentureDeduction);
    
    // 세금 계산
    const taxPreRaw = calcTax(preVentureTaxable);
    const taxPostRaw = calcTax(postVentureTaxable);
    
    // 근로소득세액공제
    let taxCredit;
    if (taxPreRaw <= 1300000) {
        taxCredit = Math.floor(taxPreRaw * 0.55);
    } else {
        taxCredit = Math.floor(1300000 * 0.55 + (taxPreRaw - 1300000) * 0.30);
    }
    
    // 세액공제 한도
    if (income <= 33000000) {
        taxCredit = Math.min(taxCredit, 740000);
    } else if (income <= 70000000) {
        taxCredit = Math.min(taxCredit, 740000 - ((income - 33000000) * 0.008));
    } else {
        taxCredit = Math.min(taxCredit, 660000);
    }
    
    const taxPreAfter = Math.max(0, taxPreRaw - taxCredit);
    const taxPostAfter = Math.max(0, taxPostRaw - taxCredit);
    
    // 지방소득세 (10%)
    const localPre = Math.floor(taxPreAfter * 0.10);
    const localPost = Math.floor(taxPostAfter * 0.10);
    
    const totalTaxPre = taxPreAfter + localPre;
    const totalTaxPost = taxPostAfter + localPost;
    
    const refund = totalTaxPre - totalTaxPost; // 절세액
    
    // 투자 수익률 계산
    const netCost = INVEST_AMT - CASH_BACK_AMT; // 실제 투자비용
    const taxBenefit = refund; // 세금 절감 효과
    const roi = (taxBenefit / netCost) * 100;
    const netProfit = -netCost + taxBenefit;
    
    // 결과 표시
    document.getElementById('actualCost').textContent = formatNumber(netCost);
    document.getElementById('taxSaving').textContent = '+' + formatNumber(taxBenefit);
    document.getElementById('roi').textContent = roi.toFixed(1) + '%';
    document.getElementById('netProfit').textContent = '실 순수익: ' + formatNumber(netProfit);
    
    // 투자 전후 비교 테이블
    const comparisonData = [
        {
            label: '과세표준',
            pre: preVentureTaxable,
            post: postVentureTaxable,
            diff: preVentureTaxable - postVentureTaxable
        },
        {
            label: '산출세액',
            pre: taxPreRaw,
            post: taxPostRaw,
            diff: taxPreRaw - taxPostRaw
        },
        {
            label: '근로소득세액공제',
            pre: Math.min(taxCredit, taxPreRaw),
            post: Math.min(taxCredit, taxPostRaw),
            diff: 0
        },
        {
            label: '결정세액 (소득세)',
            pre: taxPreAfter,
            post: taxPostAfter,
            diff: taxPreAfter - taxPostAfter
        },
        {
            label: '지방소득세',
            pre: localPre,
            post: localPost,
            diff: localPre - localPost
        }
    ];
    
    let comparisonHTML = '';
    comparisonData.forEach(item => {
        comparisonHTML += `
            <tr>
                <td>${item.label}</td>
                <td>${formatNumber(item.pre)}</td>
                <td>${formatNumber(item.post)}</td>
                <td>${item.diff > 0 ? '-' + formatNumber(item.diff) : formatNumber(Math.abs(item.diff))}</td>
            </tr>
        `;
    });
    
    // 총합 행 추가
    comparisonHTML += `
        <tr class="total-row">
            <td>총 납부세액</td>
            <td>${formatNumber(totalTaxPre)}</td>
            <td>${formatNumber(totalTaxPost)}</td>
            <td>-${formatNumber(refund)}</td>
        </tr>
    `;
    
    document.getElementById('comparisonTable').innerHTML = comparisonHTML;
    document.getElementById('expectedRefund').innerHTML = `벤처투자로 인한 예상 환급액: <strong>${formatNumber(refund)}</strong>`;
    
    // 세율 구간 분석
    const preBracket = getTaxBracketInfo(preVentureTaxable);
    const postBracket = getTaxBracketInfo(postVentureTaxable);
    
    document.getElementById('taxBracketTable').innerHTML = `
        <tr>
            <td>벤처투자 소득공제 전</td>
            <td>${formatNumber(preVentureTaxable)}</td>
            <td>${preBracket.desc}</td>
            <td>${preBracket.rate.toFixed(1)}%</td>
        </tr>
        <tr>
            <td>벤처투자 소득공제 후</td>
            <td>${formatNumber(postVentureTaxable)}</td>
            <td>${postBracket.desc}</td>
            <td>${postBracket.rate.toFixed(1)}%</td>
        </tr>
    `;
    
    document.getElementById('taxBracketEffect').innerHTML = 
        `벤처기업 투자로 인한 소득공제(${formatNumber(actualVentureDeduction)})를 통해 과세표준이 
        <strong>${formatNumber(preVentureTaxable)}</strong>에서 
        <strong>${formatNumber(postVentureTaxable)}</strong>로 감소했습니다.
        이로 인해 한계세율이 <strong>${preBracket.rate.toFixed(1)}%</strong>에서 
        <strong>${postBracket.rate.toFixed(1)}%</strong>로 변동되었습니다.`;
    
    // 공제 항목 상세
    const deductionItems = {
        '근로소득공제': earnedIncomeDeduction,
        '기본공제 (본인)': autoDeductions.personal,
        '부양가족공제': autoDeductions.dependent,
        '경로우대공제': autoDeductions.elderly,
        '국민연금': autoDeductions.nationalPension,
        '건강보험': autoDeductions.healthInsurance,
        '고용보험': autoDeductions.employmentInsurance,
        '장기요양보험': autoDeductions.longTermCare,
        '신용카드 공제': creditCardDeduction,
        '벤처투자공제': actualVentureDeduction
    };
    
    const totalDeduction = Object.values(deductionItems).reduce((a, b) => a + b, 0);
    
    let deductionCardsHTML = '';
    for (const [item, amount] of Object.entries(deductionItems)) {
        if (amount > 0) {
            const percentage = (amount / totalDeduction) * 100;
            deductionCardsHTML += `
                <div class="deduction-card">
                    <div class="item-info">
                        <p>${item}</p>
                        <p>${formatNumber(amount)}</p>
                    </div>
                    <div class="percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        }
    }
    
    document.getElementById('deductionCards').innerHTML = deductionCardsHTML;
    document.getElementById('totalDeduction').textContent = formatNumber(totalDeduction);
    
    // 투자 효율성 평가
    document.getElementById('investActualCost').textContent = formatNumber(netCost);
    document.getElementById('investTaxBenefit').textContent = '+ ' + formatNumber(taxBenefit);
    document.getElementById('investROI').textContent = roi.toFixed(1) + '%';
    document.getElementById('investNetProfit').textContent = '실 순수익: ' + formatNumber(netProfit);
    
    // 결과 섹션 표시
    document.getElementById('results').style.display = 'block';
    
    // 결과 섹션으로 스크롤
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// 다시 계산하기
function reset() {
    document.getElementById('results').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}