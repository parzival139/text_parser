const fs = require('fs');

function parseQuestions(text) {
    const questionBlocks = text.split(/\n\\section\*{Question ID:|\nQuestion ID:/);
    const questions = [];

    questionBlocks.forEach((block, index) => {
        // Skip the first block as it does not contain a question
        if (index === 0 || block.trim() === '') return; // Skip empty blocks
        
        const questionNumber = index; // Adjust index to start from 1
        
        const questionIdRegex = /\s*(\d+)/;
        const questionTextRegex = /(?<=\n+)([\s\S]*?)(?=\n\s*\([A-Z]+\))/s; // Adjusted regex to capture all characters including new lines
        const optionsRegex = /\(([A-D])\) (.+?)(?=\n\s*\([A-Z]\)|\n\n|\n\s*\\section\*{Answer|Answer)/gs; // Updated options regex
        const solutionRegex = /Sol\.\s*([\s\S]*?)(?=\n\s*\\section\*{Question ID|\\section\*{Question ID|$)/s; // Adjusted regex to capture solution text
        const correctAnswerRegex = /(?:\\section\*{Answer|Answer)[\s\r\n]+(?:\(([A-D])\))/s; // Regex to extract correct answer from the answer section

        const questionIdMatch = block.match(questionIdRegex);
        const questionId = questionIdMatch ? parseInt(questionIdMatch[1]) : null;

        const questionTextMatch = block.match(questionTextRegex);
        const questionText = questionTextMatch ? questionTextMatch[1].trim().replace(/\r/g, '').replace(/\n\n/g, '\n') : null; // Replace \r globally and convert double newlines to single newline
        
        const optionsMatches = [...block.matchAll(optionsRegex)];
        const options = optionsMatches.slice(0, 4).map((optionMatch, optionIndex) => ({
            optionNumber: optionIndex + 1,
            optionText: optionMatch[2].trim(),
            isCorrect: false // Initially mark all options as incorrect
        }));

        // Extracting correct answer from the answer section
        const answerMatch = block.match(correctAnswerRegex);
        if (answerMatch) {
            const correctAnswerLetter = answerMatch[1];
            // Marking the corresponding option as correct
            const correctOptionIndex = correctAnswerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
            if (correctOptionIndex >= 0 && correctOptionIndex < options.length) {
                options[correctOptionIndex].isCorrect = true;
            }
        }

        const solutionMatch = block.match(solutionRegex);
        const solutionText = solutionMatch ? solutionMatch[1].trim().replace(/\r/g, '').replace(/\n\n/g, '\n') : null; // Replace \r globally and convert double newlines to single newline

        questions.push({
            questionNumber,
            questionId,
            questionText,
            options,
            solutionText
        });
    });

    return questions;
}

fs.readFile('Task.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const questions = parseQuestions(data);

    // Convert questions array to JSON string
    const jsonData = JSON.stringify(questions, null, 2);
    console.log(jsonData)

    // Specify the file path where you want to save the JSON file
    const filePath = 'parsed_questions.json';

    // Write JSON data to file
    fs.writeFile(filePath, jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('JSON data has been saved to', filePath);
    });
});
