//what to scrape

export interface propertyData {
    price: number;          // billion VND
    location: string;       // hanoi or hcm
    area: number;           // m2
    time: string;           // might not be available for some post
    type: string;           // house, villa, shophouse, apartment
}