import { chromium } from "playwright";

const fs = require('fs');
const Fjsondb = require('fjsondb');
const db = new Fjsondb('/path/to/your/storage.json');


const metaTags:any = [];

require('console-stamp')(console, '[HH:MM:ss.l]');
const main = async () => {
  let arr = []
  try {
    // File path to the text file
    const filePath = 'dataurl.txt';

  
    // Read the contents of the text file synchronously
    const data = fs.readFileSync(filePath, 'utf8');
  
    // File contents are stored in 'data'
    console.log('data', data);
    arr = data.trim().split('\r\n')
    console.log('aaaaa', arr);
  } catch (err) {
    // Handle error if any
    console.error(`Failed to read file: ${err}`);
  }

  const whatAlready = async () => {
    let already = []
    const filePath2 = 'metaEntry.txt';
    const data2 = await fs.readFileSync(filePath2, 'utf8');
    console.log('data2', data2);
    already = data2.trim().split('\n')
    console.log('aaaaa2', already);
    return already
  }


  //get browser instance
  const browser = await chromium.launch({ headless: false });
  
  const page = await browser.newPage();
  for (const url of arr) {
    const alreadyData = await whatAlready()
    console.log('alreadyData', alreadyData)
    // Navigate to the current URL
    console.log('url', url)

    const has = alreadyData.includes(url);
    try {
      // if (db.has(url) == true) {
      // continue
      // }
      console.log('hass', has)
      if (has == true) {
        continue
      }


      await page.goto(url);

      const extractedMetaTags = await page.evaluate(() => {
        const metaTags: Array<{ name: any, content: any }> = [];
        const metaTagElements = document.querySelectorAll('meta');
        metaTagElements.forEach(metaTagElement => {
          const metaTag: any = {};
          metaTag.name = metaTagElement.getAttribute('name') || metaTagElement.getAttribute('property') || '';
          metaTag.content = metaTagElement.getAttribute('content') || '';
          metaTags.push(metaTag);
        });
        return metaTags;
      });

      // await browser.close();
      
      metaTags.push({ url, metaTags: extractedMetaTags });
      console.log('metaTags', metaTags);
      console.log('url', url)
      // db.set(url, 'value');
      // fs.writeFileSync('metaEntry.txt', url);
      fs.appendFileSync('metaEntry.txt', url + '\n' , 'utf8');
    
    }
    catch (error) {
      console.log('what');
      // fs.writeFileSync('metaEntry.txt', url);
      fs.appendFileSync('metaEntry.txt', url + '\n', 'utf8');
      fs.appendFileSync('metaEntryNot.txt', url + '\n' , 'utf8');
      // db.set(url, 'value');
      continue
    }
  }
  fs.writeFileSync('metaTags.json', JSON.stringify(metaTags, null, 2));
  console.log('Meta tags saved to metaTags.json');
  await page.close();
}

main()



// import { chromium } from "playwright";
// const fs = require('fs');
// const main = async () => {
  
//   //get browser instance
//   const browser = await chromium.launch({ headless: false, timeout:1000*60*10});
  
//   const page = await browser.newPage();
//   await page.goto('https://www.google.com');
//   await page.locator('.gLFyf').fill('photo');
//   await page.keyboard.press('Enter');
//  // Wait for navigation to complete
//  await Promise.all([
//   page.waitForNavigation(),
//   page.waitForLoadState(), // Add this line to ensure page load state is complete
// ]);
//         const extractedMetaTags = await page.evaluate(() => {
//             const metaTags = [];
//             const metaTagElements = document.querySelectorAll('.yuRUbf > a');
//           metaTagElements.forEach( metaTagElement => {
//             console.log('metaTagElement', metaTagElement)
//             const href = metaTagElement.getAttribute('href')
//             console.log('href',href)
//             metaTags.push(href)
//             //   metaTag.name = metaTagElement.getAttribute('name') || metaTagElement.getAttribute('property') || '';
//             //   metaTag.content = metaTagElement.getAttribute('content') || '';
//             //   metaTags.push(metaTag);
//             // });
            
//           })
//          return metaTags
//         });
//  console.log('extractedMetaTags',extractedMetaTags);
//   for (var i = 0; i < extractedMetaTags.length; i++){
  
//     await page.goto('https://www.similarweb.com')
//     await page.waitForTimeout(3000)
//     await page.locator('.app-search__input').fill(extractedMetaTags[i]);
//     await page.keyboard.press('Enter'); 
//     await Promise.all([
//       page.waitForNavigation(),
//       page.waitForLoadState(), // Add this line to ensure page load state is complete
//     ]);
//     await page.waitForTimeout(10000)
//     const globe = document.querySelectorAll('wa-rank-list__value')
//     var pValue = globe[0].innerHTML;
//     var extractedValue = pValue.split('<small>#</small>')[1];
//     fs.appendFileSync('hello.txt', extractedMetaTags[i] +'-' + extractedValue + '\n' , 'utf8');
//   }
// }

// main(  )