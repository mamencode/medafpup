const { Cluster } = require("puppeteer-cluster");
const fs = require('fs/promises');

/*
 "https://www.gsmarena.com/apple-phones-48.php",
    "https://www.gsmarena.com/huawei-phones-58.php",
    "https://www.gsmarena.com/lg-phones-f-20-10.php",


"https://www.gsmarena.com/htc-phones-f-45-10.php",
    "https://www.gsmarena.com/motorola-phones-f-4-10.php",
    "https://www.gsmarena.com/lenovo-phones-73.php",
"https://www.gsmarena.com/samsung-phones-f-9-10.php"

    "https://www.gsmarena.com/xiaomi-phones-80.php",
    "https://www.gsmarena.com/honor-phones-121.php",
    "https://www.gsmarena.com/oppo-phones-82.php",

    "https://www.gsmarena.com/oneplus-phones-95.php",
    "https://www.gsmarena.com/vivo-phones-98.php",
    "https://www.gsmarena.com/meizu-phones-74.php",

    "https://www.gsmarena.com/zte-phones-62.php",
    "https://www.gsmarena.com/infinix-phones-119.php",
    "https://www.gsmarena.com/tecno-phones-120.php"

*/


const urls = [
    "https://www.gsmarena.com/lg-phones-f-20-10.php",
    
   

]
let lisPhone = []
let listPhoneDetails = []



async function testExample(content) {
    try {
        console.log(content)
        await fs.writeFile('../bd/samsung/lgphone.json', content);

    } catch (error) {
        console.log(error)
    }
}

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 100,
        monitor: true,
        puppeteerOptions: {
            headless: true,
            defaultViewport: false,
            args: [ // Disable Chromium's unnecessary SUID sandbox.
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        },
    });



    cluster.on("taskerror", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });
    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url, {timeout:0})

        let btnDisabled = false

        while (!btnDisabled) {


            const phones = await page.evaluate(() => {
                const phoneItems = document.querySelectorAll(".makers li")
                const phoneLinkItems = Array.from(phoneItems).map((phone) => {
                    const phonelink = phone.querySelector(".makers li a").getAttribute('href')
                    const baseUrl = "https://www.gsmarena.com/"
                    return baseUrl + phonelink
                })
                return phoneLinkItems
            })

            lisPhone.push(...phones)
            const isnextDisabled = (await page.$(".disabled.pages-next")) !== null;
            btnDisabled = isnextDisabled
            if (!isnextDisabled) {

                await page.click(".pages-next")
            }

        }
        for (const phone of lisPhone) {
            await page.goto(phone, {
                waitUntil: "load",
                timeout: 0
            })

            const newData = await page.evaluate(() => {
                const bodies = document.querySelectorAll("#specs-list >table > tbody")

                const items = Array.from(bodies).map((ph) => {
                    const infoSec = ph.querySelector('td.nfo').textContent

                    return infoSec
                })

                const name = document.querySelector(".specs-phone-name-title ").textContent
                const mainpic = document.querySelector(".specs-photo-main img").getAttribute("src")

                let timestampRealsed = Math.floor(new Date(items[1]).getTime() / 1000)
                const toPix = "3.7795275591"
                const pixBodyDim = {
                    width: Math.floor((items[2].split("x")[1] * toPix)),
                    height: Math.floor((items[2].split("x")[0] * toPix))
                }

                return {

                    name: name,
                    year: items[1],
                    bodySpec: items[2],
                    mainpic: mainpic,
                    realeaseDate: timestampRealsed,
                    phoneBodyInPx: pixBodyDim
                }
            })
            listPhoneDetails.push(newData)

        }

    })

    for (const url of urls) {
        await cluster.queue(url);
    }

    await cluster.idle();
    testExample(JSON.stringify(listPhoneDetails))
    //appendExample(listPhoneDetails)
    await cluster.close();

})()