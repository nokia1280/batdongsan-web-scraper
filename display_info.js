d3.json("scraped_data.json").then(function (data) {
    displayTotalNumberOfItems(data);
    displayLastCrawlDate();
});

function displayTotalNumberOfItems(data) {
    const totalItems = data.length;
    document.getElementById('total-posts').innerHTML = `<p>Total Number of Items: ${totalItems}</p>`;
}

function displayLastCrawlDate() {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", "scraped_data.json", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var lastModified = new Date(xhr.getResponseHeader("Last-Modified"));

                const day = String(lastModified.getDate())
                const month = String(lastModified.getMonth() + 1)
                const year = String(lastModified.getFullYear())

                const hours = String(lastModified.getHours()).padStart(2, '0');
                const minutes = String(lastModified.getMinutes()).padStart(2, '0');
                const seconds = String(lastModified.getSeconds()).padStart(2, '0');

                const formattedDate = `${day}/${month}/${year}`;
                const formattedTime = `${hours}:${minutes}:${seconds}`;

                document.getElementById('last-crawl-date').innerHTML = `<p>Last Crawl Date: ${formattedDate} ${formattedTime}</p>`;
            } else {
                console.error("Failed to fetch last modified date");
            }
        }
    };

    xhr.send();
}