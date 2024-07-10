const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to fetch and parse web pages
async function fetchWebPage(url) {
    try {
        const { data } = await axios.get(url);
        return cheerio.load(data);
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        return null;
    }
}

// Function to extract data from the homepage
async function extractData() {
    const url = 'https://technoindiauniversity.ac.in/';
    const $ = await fetchWebPage(url);
    if (!$) return [];

    // Adjust CSS selectors based on the website's structure
    let results = [];
    $('a').each((index, element) => {
        const link = $(element).attr('href');
        const title = $(element).text().trim();
        const date = $(element).find('time').text().trim(); // Assuming date is within a <time> tag

        if (link) {
            results.push({
                url: link.startsWith('http') ? link : `https://technoindiauniversity.ac.in/${link}`,
                title,
                date
            });
        }
    });

    return results;
}

// Function to write data to CSV file
async function writeDataToCSV(data, filePath) {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'url', title: 'URL' },
            { id: 'title', title: 'Title' },
            { id: 'date', title: 'Date' }
        ]
    });

    try {
        await csvWriter.writeRecords(data);
        console.log('CSV file written successfully');
    } catch (error) {
        console.error('Error writing CSV file:', error);
    }
}

// Main function to run the web crawler
async function main() {
    const results = await extractData();
    await writeDataToCSV(results, 'output.csv');
}

main();
