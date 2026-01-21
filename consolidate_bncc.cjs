
const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\heber bringel\\Documents\\projetos\\hackathon-2\\aula-criativa-ai';
const files = [
    'bncc-matematica.json',
    'bncc-natureza.json',
    'bncc-humanas.json',
    'bncc-linguagens.json'
];

let allData = [];

try {
    files.forEach(file => {
        const filePath = path.join(rootDir, file);
        console.log(`Reading ${filePath}...`);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
            const data = JSON.parse(content);
            console.log(`Loaded ${data.length} items from ${file}`);
            allData = allData.concat(data);
        } catch (e) {
            console.error(`Error parsing JSON in ${file}:`, e.message);
            process.exit(1);
        }
    });

    const outputPath = path.join(rootDir, 'src', 'infra', 'data', 'bncc_complete.json');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        console.log(`Creating directory ${outputDir}...`);
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');
    console.log(`Successfully merged ${allData.length} items into ${outputPath}`);

} catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
}
