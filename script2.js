let heroHP = parseInt(localStorage.getItem("heroHP")) || 100;
let heroLevel = parseInt(localStorage.getItem("heroLevel")) || 1;
let hero = { name: "勇者", hp: heroHP, attackPower: 50, level: heroLevel };
let correctAnswer;
let correctCount = 0;
let totalQuestions = 0;
let experiencePoints = 0; // 毎回リセットされるよう変更

// 選択された階級を取得
const selectedLevel = localStorage.getItem('selectedLevel') || 'beginner';

// モンスターを定義
const monsters = {
    beginner: [
        { name: "スライム", hp: 180, attackPower: 35, image: "beginner_1.jpg" },
        { name: "ドラキー", hp: 160, attackPower: 40, image: "beginner_2.jpg" }
    ],
    intermediate: [
        { name: "さまようよろい", hp: 150, attackPower: 50, image: "middle_1.jpg" },
        { name: "ゴーレム", hp: 200, attackPower: 42, image: "middle_2.jpg" }
    ],
    advanced: [
        { name: "キラーマシン", hp: 100, attackPower: 80, image: "advanced_1.jpg" },
        { name: "グレイトドラゴン", hp: 140, attackPower: 70, image: "advanced_2.jpg" }
    ]
};

window.onload = function () {
    const screen = document.getElementById("screen");
    const game = document.getElementById("game");
    const heroHPLabel = document.getElementById("heroHP");
    const monsterHPLabel = document.getElementById("monsterHP");
    const battleLog = document.getElementById("battleLog");
    const answersDiv = document.getElementById("answers");
    const monsterImage = document.getElementById("monsterImage");
    const accuracyLabel = document.getElementById("accuracy");
    const returnButton = document.getElementById("returnButton");
    const monsterNameLabel = document.getElementById("monsterName");
    
    // レベルに応じたモンスターを選択
    const levelMonsters = monsters[selectedLevel];
    const monsterData = { ...levelMonsters[Math.floor(Math.random() * levelMonsters.length)] };

    // monsterを初期化（グローバル変数に代入）
    monster = { ...monsterData };

    monsterNameLabel.textContent = monster.name;

    // モンスターの画像を設定
    monsterImage.src = `images/${monster.image}`;
console.log('Image source set to:', monsterImage.src);

monsterImage.onerror = function() {
    console.error('Failed to load image:', monsterImage.src);
};
    // 戦闘終了後の選択画面ボタン処理
    returnButton.onclick = () => {
        localStorage.setItem("currentExperience", "0"); // 一時的な経験値をリセット
        window.location.href = "index.html"; // index.html にリダイレクト
    };

    // ダメージ計算
    function calculateDamage(attacker, defender) {
        const randomAdjustment = Math.floor(Math.random() * 7) - 3; // -3から3のランダム値
        const damage = Math.max(
            0,
            Math.floor(attacker.attackPower - defender.attackPower / 4 + randomAdjustment)
        );
        return damage;
    }

    // 問題生成
    function generateQuestion() {
        const variables = ['x', 'y'];
        const operators = ['+', '-'];
        const numTerms = Math.floor(Math.random() * 2) + 3; // 3または4

        let expression = '';
        let terms = [];
        let operatorsUsed = [];

        for (let i = 0; i < numTerms; i++) {
            let coeff = Math.floor(Math.random() * 11) - 5; // -5から5
            if (coeff === 0) coeff = 1; // 係数が0にならないように
            let variable = variables[Math.floor(Math.random() * variables.length)];

            let term = formatTerm(coeff, variable);
            terms.push({ coeff: coeff, variable: variable });

            if (i === 0) {
                expression += term;
            } else {
                let operator = operators[Math.floor(Math.random() * operators.length)];
                operatorsUsed.push(operator);
                expression += ` ${operator} ${term}`;
            }
        }

        correctAnswer = simplifyExpression(terms, operatorsUsed);

        battleLog.innerHTML += `次の式を簡単にしてください：<br>${expression}<br>`;
        const correctIndex = Math.floor(Math.random() * 4);
        answersDiv.innerHTML = '';

        // 選択肢を2行2列で表示するためのコンテナを作成
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexWrap = 'wrap';
        optionsContainer.style.justifyContent = 'center';

        let answers = [];

        for (let i = 0; i < 4; i++) {
            const button = document.createElement("button");
            button.style.margin = '5px'; // ボタン間の間隔を設定

            if (i === correctIndex) {
                button.textContent = correctAnswer;
            } else {
                let wrongAnswer;
                do {
                    wrongAnswer = generateWrongAnswer(correctAnswer);
                } while (wrongAnswer === correctAnswer || answers.includes(wrongAnswer));
                button.textContent = wrongAnswer;
            }
            button.onclick = () => checkAnswer(button.textContent);
            optionsContainer.appendChild(button);
            answers.push(button.textContent);
        }

        answersDiv.appendChild(optionsContainer);
    }

    function formatTerm(coeff, variable) {
        if (coeff === 1) return variable;
        if (coeff === -1) return '-' + variable;
        return coeff + variable;
    }

    function simplifyExpression(terms, operatorsUsed) {
        let combinedTerms = { 'x': 0, 'y': 0 };

        // 最初の項を追加
        combinedTerms[terms[0].variable] += terms[0].coeff;

        // 残りの項を処理
        for (let i = 0; i < operatorsUsed.length; i++) {
            let operator = operatorsUsed[i];
            let term = terms[i + 1];

            if (operator === '+') {
                combinedTerms[term.variable] += term.coeff;
            } else if (operator === '-') {
                combinedTerms[term.variable] -= term.coeff;
            }
        }

        // 簡単化された式を構築
        let resultParts = [];

        for (let varName of ['x', 'y']) {
            let coeff = combinedTerms[varName];
            if (coeff === 0) continue;

            let termStr = '';

            if (resultParts.length > 0) {
                if (coeff > 0) {
                    termStr += ' + ';
                } else {
                    termStr += ' - ';
                    coeff = -coeff;
                }
            } else {
                if (coeff < 0) {
                    termStr += '-';
                    coeff = -coeff;
                }
            }

            if (coeff !== 1) {
                termStr += coeff;
            }

            termStr += varName;

            resultParts.push(termStr);
        }

        if (resultParts.length === 0) {
            return '0';
        } else {
            return resultParts.join('');
        }
    }

    function generateWrongAnswer(correctAnswer) {
        // 正解の係数を取得
        let variables = ['x', 'y'];
        let wrongCoefficients = {};

        let coeffs = { 'x': 0, 'y': 0 };
        let tokens = correctAnswer.match(/[+-]?[^+-]+/g); // 項に分割

        for (let token of tokens) {
            token = token.trim();
            let match = token.match(/^([+-]?)(\d*)([xy])$/);
            if (match) {
                let sign = match[1];
                let coeffStr = match[2];
                let varName = match[3];
                let coeff = coeffStr ? parseInt(coeffStr) : 1;
                if (sign === '-') coeff = -coeff;
                coeffs[varName] = coeff;
            }
        }

        // 間違った係数を生成
        for (let varName of variables) {
            let coeff = coeffs[varName];
            let delta = Math.floor(Math.random() * 5) - 2; // -2から2
            if (delta === 0) delta = 1; // 0を避ける
            wrongCoefficients[varName] = coeff + delta;
        }

        // 間違った答えを構築
        let resultParts = [];

        for (let varName of variables) {
            let coeff = wrongCoefficients[varName];
            if (coeff === 0) continue;

            let termStr = '';

            if (resultParts.length > 0) {
                if (coeff > 0) {
                    termStr += ' + ';
                } else {
                    termStr += ' - ';
                    coeff = -coeff;
                }
            } else {
                if (coeff < 0) {
                    termStr += '-';
                    coeff = -coeff;
                }
            }

            if (coeff !== 1) {
                termStr += coeff;
            }

            termStr += varName;

            resultParts.push(termStr);
        }

        if (resultParts.length === 0) {
            return '0';
        } else {
            return resultParts.join('');
        }
    }

    // 解答チェック
    function checkAnswer(selectedAnswer) {
        battleLog.innerHTML = ""; // ログをクリア
        answersDiv.innerHTML = ""; // 答えの選択肢をクリア

        if (selectedAnswer === correctAnswer) {
            const damageToMonster = calculateDamage(hero, monster);
            battleLog.innerHTML += `正解！ ${monster.name} に ${damageToMonster} のダメージ！<br>`;
            monster.hp -= damageToMonster;
            correctCount++; // 正解数をカウント
        } else {
            const damageToHero = calculateDamage(monster, hero);
            battleLog.innerHTML += `ミス！ ${hero.name} は ${damageToHero} のダメージを受けた！<br>`;
            hero.hp -= damageToHero;
        }
        totalQuestions++;
        updateHPLabels();
        checkGameOver();
    }

    // HPラベル更新
    function updateHPLabels() {
        heroHPLabel.textContent = `HP: ${Math.max(hero.hp, 0)}`; // 0以下にならないように修正
        monsterHPLabel.textContent = `HP: ${Math.max(monster.hp, 0)}`; // 0以下にならないように修正
    }

    // ゲーム終了判定
    function checkGameOver() {
        if (hero.hp <= 0) {
            battleLog.innerHTML += `${hero.name} は ${monster.name} にやられてしまった！<br>`;
            disableButtons();
            updateHPLabels();
            showResult(false);
        } else if (monster.hp <= 0) {
            battleLog.innerHTML += `${hero.name} は ${monster.name} を倒した！<br>`;
            monsterImage.style.display = "none";
            disableButtons();
            updateHPLabels();
            showResult(true);
            playBGM("endBGM");
        } else {
            generateQuestion();
        }
    }

    // 結果を表示
    function showResult(isVictory) {
        const accuracy = ((correctCount / totalQuestions) * 100).toFixed(2);
        const currentExperience = correctCount * 12; // 現在の経験値

        // トータル経験値を更新
        const totalExperiencePoints = parseInt(localStorage.getItem("totalExperiencePoints")) || 0;
        const updatedTotalExperience = totalExperiencePoints + currentExperience;

        console.log(`現在の経験値: ${currentExperience}`);
        console.log(`以前のトータル経験値: ${totalExperiencePoints}`);
        console.log(`更新後のトータル経験値: ${updatedTotalExperience}`);

        localStorage.setItem("totalExperiencePoints", updatedTotalExperience); // トータル経験値を保存

        accuracyLabel.textContent = `問題数: ${totalQuestions} 正答率: ${accuracy}% 獲得経験値: ${currentExperience}`;

        // 戦闘後に経験値を初期化
        correctCount = 0; // 正解数をリセット
        totalQuestions = 0; // 問題数をリセット
        experiencePoints = 0; // 現在の経験値を初期化

        returnButton.style.display = "inline-block"; // ボタンを表示
        disableButtons();
    }

    // ボタン無効化
    function disableButtons() {
        const buttons = answersDiv.getElementsByTagName("button");
        for (let button of buttons) {
            button.disabled = true;
        }
    }

    // BGM再生
    function playBGM(bgmId) {
        const bgmElements = document.querySelectorAll("audio");
        bgmElements.forEach((audio) => audio.pause()); // 全てのBGMを停止
        const bgm = document.getElementById(bgmId);
        if (bgm) {
            bgm.currentTime = 0; // 再生位置を先頭に戻す
            bgm.play();
        }
    }

    // 戦闘開始
    function startBattle() {
        playBGM("battleBGM"); // 戦闘用BGM再生
    }

    // ゲーム開始処理
    screen.style.transition = "opacity 1s ease-in-out";
    screen.style.opacity = "0";
    setTimeout(() => {
        screen.style.display = "none";
    }, 1000);

    startBattle(); // 戦闘開始
    updateHPLabels();
    isFirstRun();
    generateQuestion();
};

// 初回ログ
function isFirstRun() {
    const battleLog = document.getElementById("battleLog");
    battleLog.innerHTML += `${monster.name} が現れた！<br>`;
}
