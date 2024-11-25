let heroHP = parseInt(localStorage.getItem("heroHP")) || 100;
let heroLevel = parseInt(localStorage.getItem("heroLevel")) || 1;
let hero = { name: "勇者", hp: heroHP, attackPower: 50, level: heroLevel };
let correctAnswer;
let correctCount = 0;
let totalQuestions = 0;
let experiencePoints = 0; // 毎回リセットされるよう変更

// 選択された階級を取得
const selectedLevel = localStorage.getItem('selectedLevel') || 'middle';

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
        const functions = [
            { question: '∫ x dx', answer: '1/2 x^2 + C' },
            { question: '∫ x^2 dx', answer: '1/3 x^3 + C' },
            { question: '∫ sin(x) dx', answer: '-cos(x) + C' },
            { question: '∫ cos(x) dx', answer: 'sin(x) + C' },
            { question: '∫ e^x dx', answer: 'e^x + C' },
            { question: '∫ 1/x dx', answer: 'log|x| + C' },
            { question: '∫ 2x dx', answer: 'x^2 + C' },
            { question: '∫ sec^2(x) dx', answer: 'tan(x) + C' },
            { question: '∫ csc^2(x) dx', answer: '-cot(x) + C' },
            { question: '∫ 0 dx', answer: 'C' }
        ];

        // ランダムに問題を選択
        const index = Math.floor(Math.random() * functions.length);
        const selectedFunction = functions[index];
        correctAnswer = selectedFunction.answer;

        battleLog.innerHTML += `次の不定積分の答えは？：<br>${selectedFunction.question}<br>`;
        const correctIndex = Math.floor(Math.random() * 4);
        answersDiv.innerHTML = '';

        // 選択肢を2行2列で表示するためのコンテナを作成
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexWrap = 'wrap';
        optionsContainer.style.justifyContent = 'center';
        optionsContainer.style.width = '100%';

        let answers = [];

        for (let i = 0; i < 4; i++) {
            const button = document.createElement("button");
            button.style.margin = '5px';
            button.style.padding = '20px';
            button.style.fontSize = '24px';
            button.style.width = '45%';
            button.style.boxSizing = 'border-box';

            if (i === correctIndex) {
                button.textContent = correctAnswer;
            } else {
                let wrongAnswer;
                do {
                    wrongAnswer = generateWrongAnswer();
                } while (wrongAnswer === correctAnswer || answers.includes(wrongAnswer));
                button.textContent = wrongAnswer;
            }
            button.onclick = () => checkAnswer(button.textContent);
            optionsContainer.appendChild(button);
            answers.push(button.textContent);
        }

        answersDiv.innerHTML = '';
        answersDiv.appendChild(optionsContainer);
    }

    function generateWrongAnswer() {
        const wrongAnswers = [
            'x + C',
            '-x + C',
            '1/x + C',
            'log(x) + C',
            '-log|x| + C',
            '-1/2 x^2 + C',
            'e^{-x} + C',
            '-e^x + C',
            'cos(x) + C',
            'sin(x) + C',
            'tan(x) + C',
            '-cot(x) + C',
            'C',
            '1/2 x + C',
            'x^2 + C',
            'x^3 + C'
        ];
        const index = Math.floor(Math.random() * wrongAnswers.length);
        return wrongAnswers[index];
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
        const currentExperience = correctCount * 14; // 現在の経験値

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
