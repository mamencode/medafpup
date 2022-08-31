const puppeteer = require('puppeteer-extra')
const fs = require('fs/promises');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function testExample(content) {
    try {
        console.log(content)
        await fs.writeFile('../bd/samsung/fulllg2.json', content);

    } catch (error) {
        console.log(error)
    }
}

(async()=> {
    const browser = await puppeteer.launch({
        headless: true,
        args: [ // Disable Chromium's unnecessary SUID sandbox.
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    await page.goto(' https://www.gsmarena.com/lg-phones-f-20-10.php')
    
    let lisPhone = []
    let listPhoneDetails = []
    let btnDisabled = false

    while (!btnDisabled) {
        const title = await page.title()

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

    //console.log(lisPhone.length)
    for (const phone of lisPhone) {
        await page.goto(phone, { waitUntil: "load",
        timeout: 0 })

     

        //phoneBodySelector   document.querySelectorAll("#specs-list >table >tbody")[2]
        const newData = await page.evaluate(() => {
            const bodies = document.querySelectorAll("#specs-list >table > tbody")
            const items = Array.from(bodies).map((ph)=> {
                const headerT = ph.querySelector('tr> th').textContent
                const infoSec = ph.querySelector('td.nfo').textContent
                
                return infoSec
                 })
            const name = document.querySelector(".specs-phone-name-title ").innerHTML
          
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
        /*
        await page.click(".article-info-meta li:nth-child(3) > a")

        await page.waitForSelector("#pictures-list")

        let picData = []
        const picHandles = await page.$$("#pictures-list")
        for (const picHandle of picHandles) {
            let phonePic = "Null"
            let photos
            try {
                photos = await page.$$eval('img', imgs => {
                    const noneNullsrc = imgs.filter((x) => x.src.length)
                    return noneNullsrc.map(x => x.src)
                })
                phonePic = await page.evaluate((el) => el.querySelector("img").getAttribute('src'), picHandle)
            } catch (error) {
                console.log(error)
            }

            if (phonePic !== "Null") {

                picData.push(...photos)
            }
        }
        
        
        */
        listPhoneDetails.push(newData)

    }

    testExample(JSON.stringify(listPhoneDetails))

    await browser.close()
})()