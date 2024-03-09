"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer = require("puppeteer");
var fs = require("fs");
var readline = require("readline");
// stuff to get user input
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function scrapeData(url, type) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch({ headless: false, timeout: 120000 })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto(url)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function (type) {
                            var results = [];
                            var items = document.querySelectorAll('.js__card');
                            //get data
                            items.forEach(function (item) {
                                var _a, _b, _c, _d, _e;
                                var priceElement = item.querySelector('.re__card-config-price');
                                var locationElement = item.querySelector('.re__card-location');
                                var areaElement = item.querySelector('.re__card-config-area');
                                var timeElement = ((_a = item.querySelector('span.re__card-published-info-published-at')) === null || _a === void 0 ? void 0 : _a.getAttribute('aria-label')) || '';
                                //data cleanup and returning result
                                if (priceElement && locationElement && areaElement) {
                                    var priceValue = ((_b = priceElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                                    var price = parseFloat(priceValue.replace(/[^\d.]/g, ''));
                                    var locationValue = ((_c = locationElement.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
                                    var location_1 = ((_d = locationValue.split(',').pop()) === null || _d === void 0 ? void 0 : _d.trim()) || '';
                                    var areaValue = ((_e = areaElement.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
                                    var area = parseFloat(areaValue.replace(/[^\d.]/g, ''));
                                    results.push({ price: price, location: location_1, area: area, time: timeElement, type: type });
                                }
                            });
                            return results;
                        }, type)];
                case 4:
                    data = _a.sent();
                    return [4 /*yield*/, browser.close()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
function scrapeMultiplePages(baseURL, type, totalPages) {
    return __awaiter(this, void 0, void 0, function () {
        var allData, i, url, pageData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allData = [];
                    i = 1;
                    _a.label = 1;
                case 1:
                    if (!(i <= totalPages)) return [3 /*break*/, 4];
                    url = "".concat(baseURL, "/p").concat(i);
                    console.log("Scraping data from page ".concat(url));
                    return [4 /*yield*/, scrapeData(url, type)];
                case 2:
                    pageData = _a.sent();
                    allData = allData.concat(pageData);
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, allData];
            }
        });
    });
}
function countByTypeAndDay(scrapedData) {
    return __awaiter(this, void 0, void 0, function () {
        var counts;
        return __generator(this, function (_a) {
            counts = {};
            scrapedData.forEach(function (property) {
                var date = property.time.split(' ')[0]; // Extracting date from time
                if (!counts[date]) {
                    counts[date] = {};
                }
                if (!counts[date][property.type]) {
                    counts[date][property.type] = 0;
                }
                counts[date][property.type]++;
            });
            return [2 /*return*/, counts];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function getTotalPages(callback) {
            rl.question('Please enter the total number of pages to scrape (Fewer pages = faster scraping time): ', function (input) {
                var totalPages = parseInt(input);
                if (isNaN(totalPages) || totalPages <= 0) {
                    console.log('Please enter a valid value.');
                    getTotalPages(callback);
                }
                else {
                    callback(totalPages);
                }
            });
        }
        var base_URL_Hanoi_House, base_URL_HCM_House, base_URL_Hanoi_Villa, base_URL_HCM_Villa, base_URL_Hanoi_Apartment, base_URL_HCM_Apartment, base_URL_Hanoi_Shophouse, base_URL_HCM_Shophouse;
        var _this = this;
        return __generator(this, function (_a) {
            base_URL_Hanoi_House = 'https://batdongsan.com.vn/nha-dat-ban-ha-noi';
            base_URL_HCM_House = 'https://batdongsan.com.vn/nha-dat-ban-tp-hcm';
            base_URL_Hanoi_Villa = 'https://batdongsan.com.vn/ban-nha-biet-thu-lien-ke-ha-noi';
            base_URL_HCM_Villa = 'https://batdongsan.com.vn/ban-nha-biet-thu-lien-ke-tp-hcm';
            base_URL_Hanoi_Apartment = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-ha-noi';
            base_URL_HCM_Apartment = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-tp-hcm';
            base_URL_Hanoi_Shophouse = 'https://batdongsan.com.vn/ban-shophouse-nha-pho-thuong-mai-ha-noi';
            base_URL_HCM_Shophouse = 'https://batdongsan.com.vn/ban-shophouse-nha-pho-thuong-mai-tp-hcm';
            getTotalPages(function (totalPages) { return __awaiter(_this, void 0, void 0, function () {
                var scraped_Data_Hanoi_House, scraped_Data_HCM_House, scraped_Data_Hanoi_Villa, scraped_Data_HCM_Villa, scraped_Data_Hanoi_Apartment, scraped_Data_HCM_Apartment, scraped_Data_Hanoi_Shophouse, scraped_Data_HCM_Shophouse, allScrapedData, counts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, scrapeMultiplePages(base_URL_Hanoi_House, 'House', totalPages)];
                        case 1:
                            scraped_Data_Hanoi_House = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_HCM_House, 'House', totalPages)];
                        case 2:
                            scraped_Data_HCM_House = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_Hanoi_Villa, 'Villa', totalPages)];
                        case 3:
                            scraped_Data_Hanoi_Villa = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_HCM_Villa, 'Villa', totalPages)];
                        case 4:
                            scraped_Data_HCM_Villa = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_Hanoi_Apartment, 'Apartment', totalPages)];
                        case 5:
                            scraped_Data_Hanoi_Apartment = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_HCM_Apartment, 'Apartment', totalPages)];
                        case 6:
                            scraped_Data_HCM_Apartment = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_Hanoi_Shophouse, 'Shophouse', totalPages)];
                        case 7:
                            scraped_Data_Hanoi_Shophouse = _a.sent();
                            return [4 /*yield*/, scrapeMultiplePages(base_URL_HCM_Shophouse, 'Shophouse', totalPages)];
                        case 8:
                            scraped_Data_HCM_Shophouse = _a.sent();
                            allScrapedData = [
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
                            fs.writeFile('scraped_data.json', JSON.stringify(allScrapedData, null, 2), function (err) {
                                if (err) {
                                    console.error('Error writing to file:', err);
                                }
                                else {
                                    console.log('Scraped data saved to scraped_data.json');
                                }
                                rl.close();
                            });
                            return [4 /*yield*/, countByTypeAndDay(allScrapedData)];
                        case 9:
                            counts = _a.sent();
                            fs.writeFile('counts.json', JSON.stringify(counts, null, 2), function (err) {
                                if (err) {
                                    console.error('Error writing to file:', err);
                                }
                                else {
                                    console.log('Counts saved to counts.json');
                                }
                                rl.close();
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
// pray and let it cook
main().catch(function (error) { return console.error('Error during scraping:', error); });
