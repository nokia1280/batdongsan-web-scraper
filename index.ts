import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as readline from 'readline';
import { propertyData } from './propertyData';

// stuff to get user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function scrapeData(url: string, type: string): Promise<propertyData[]> {
    const browser = await puppeteer.launch({ headless: false, timeout: 120000 });        // only works with headless: false
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate((type) => {
        const results: propertyData[] = [];
        const items = document.querySelectorAll('.js__card');

        //get data
        items.forEach((item) => {
            const priceElement = item.querySelector('.re__card-config-price');
            const locationElement = item.querySelector('.re__card-location');
            const areaElement = item.querySelector('.re__card-config-area');
            const timeElement = item.querySelector('span.re__card-published-info-published-at')?.getAttribute('aria-label') || '';

            //data cleanup and returning result
            if (priceElement && locationElement && areaElement) {
                const priceValue = priceElement.textContent?.trim().replace(',', '.') || '';
                const price = parseFloat(priceValue);

                const locationValue = locationElement.textContent?.trim() || '';
                const location = locationValue.split(',').pop()?.trim() || '';

                const areaValue = areaElement.textContent?.trim() || '';
                const area = parseFloat(areaValue.replace(/[^\d.]/g, ''));

                results.push({ price, location, area, time: timeElement, type });
            }
        });

        return results;
    }, type);

    await browser.close();

    return data;
}

async function scrapeMultiplePages(baseURL: string, type: string, totalPages: number): Promise<propertyData[]> {
    let allData: propertyData[] = [];

    for (let i = 1; i <= totalPages; i++) {
        const url = `${baseURL}/p${i}`;
        console.log(`Scraping data from page ${url}`);
        const pageData = await scrapeData(url, type);
        allData = allData.concat(pageData);
    }

    return allData;
}

async function countByTypeAndDay(scrapedData: propertyData[]): Promise<{ [date: string]: { [type: string]: number } }> {
    const counts: { [date: string]: { [type: string]: number } } = {};

    scrapedData.forEach(property => {
        const date = property.time.split(' ')[0]; // Extracting date from time
        if (!counts[date]) {
            counts[date] = {};
        }
        if (!counts[date][property.type]) {
            counts[date][property.type] = 0;
        }
        counts[date][property.type]++;
    });

    return counts;
}

async function main() {
    const base_URL_Hanoi_House = 'https://batdongsan.com.vn/nha-dat-ban-ha-noi';
    const base_URL_HCM_House = 'https://batdongsan.com.vn/nha-dat-ban-tp-hcm';
    const base_URL_Hanoi_Villa = 'https://batdongsan.com.vn/ban-nha-biet-thu-lien-ke-ha-noi';
    const base_URL_HCM_Villa = 'https://batdongsan.com.vn/ban-nha-biet-thu-lien-ke-tp-hcm';
    const base_URL_Hanoi_Apartment = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-ha-noi';
    const base_URL_HCM_Apartment = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-tp-hcm';
    const base_URL_Hanoi_Shophouse = 'https://batdongsan.com.vn/ban-shophouse-nha-pho-thuong-mai-ha-noi';
    const base_URL_HCM_Shophouse = 'https://batdongsan.com.vn/ban-shophouse-nha-pho-thuong-mai-tp-hcm';

    console.log('===================')
    console.log('=== WEB SCRAPER ===')
    console.log('===================\n')
    function getTotalPages(callback: (totalPages: number) => void) {
        rl.question('Please enter the total number of pages to scrape (Fewer pages = faster scraping time): ', (input) => {
            const totalPages = parseInt(input);

            if (isNaN(totalPages) || totalPages <= 0) {
                console.log('Please enter a valid value.');
                getTotalPages(callback);
            } else {
                callback(totalPages);
            }
        });
    }

    getTotalPages(async (totalPages) => {
        const scraped_Data_Hanoi_House = await scrapeMultiplePages(base_URL_Hanoi_House, 'House', totalPages);
        const scraped_Data_HCM_House = await scrapeMultiplePages(base_URL_HCM_House, 'House', totalPages);
        const scraped_Data_Hanoi_Villa = await scrapeMultiplePages(base_URL_Hanoi_Villa, 'Villa', totalPages);
        const scraped_Data_HCM_Villa = await scrapeMultiplePages(base_URL_HCM_Villa, 'Villa', totalPages);
        const scraped_Data_Hanoi_Apartment = await scrapeMultiplePages(base_URL_Hanoi_Apartment, 'Apartment', totalPages);
        const scraped_Data_HCM_Apartment = await scrapeMultiplePages(base_URL_HCM_Apartment, 'Apartment', totalPages);
        const scraped_Data_Hanoi_Shophouse = await scrapeMultiplePages(base_URL_Hanoi_Shophouse, 'Shophouse', totalPages);
        const scraped_Data_HCM_Shophouse = await scrapeMultiplePages(base_URL_HCM_Shophouse, 'Shophouse', totalPages);

        const allScrapedData = [
            scraped_Data_Hanoi_House,
            scraped_Data_HCM_House,
            scraped_Data_Hanoi_Villa,
            scraped_Data_HCM_Villa,
            scraped_Data_Hanoi_Apartment,
            scraped_Data_HCM_Apartment,
            scraped_Data_Hanoi_Shophouse,
            scraped_Data_HCM_Shophouse
        ].flat();

        // export data to JSON
        fs.writeFile('scraped_data.json', JSON.stringify(allScrapedData, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Scraped data saved to scraped_data.json');
            }
            rl.close();
        });

        // Get the amount of post of each type of property per day
        const counts = await countByTypeAndDay(allScrapedData);

        fs.writeFile('counts.json', JSON.stringify(counts, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Counts saved to counts.json');
            }
            rl.close();
        });
    });
}

// pray and let it cook
main().catch((error) => console.error('Error during scraping:', error));