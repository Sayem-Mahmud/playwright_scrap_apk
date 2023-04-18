import { chromium } from "playwright";

const fs = require('fs');
const Fjsondb = require('fjsondb');
const db = new Fjsondb('/path/to/your/storage.json');


const metaTags:any = [];

require('console-stamp')(console, '[HH:MM:ss.l]');
const main = async () => {
  try {
    //get browser instance
    const browser = await chromium.launch({ headless: false });
  
    // Create a new browser context
  const context = await browser.newContext();

  // Create a new page
  const page = await context.newPage();
    // const page = await browser.newPage();
 
    for (var i = 1; i < 3; i++) {
      await page.goto(`https://www.revdl.com/page/${i}/`);
      const allReadMoreHref = await page.evaluate(() => {
        const metaTags = [];
        const metaTagElements = document.querySelectorAll('.tpcrn-read-more');
        console.log('metaTagElements',metaTagElements);
        metaTagElements.forEach(metaTagElement => {
          const href = metaTagElement.getAttribute('href') || '';
          console.log('href',href)
          metaTags.push(href);
        });
        return metaTags;
      });

      for (var j = 0; j < allReadMoreHref.length; j++){
        var apkObj: any = {}
        

        await page.goto(allReadMoreHref[j])
  
        const title = await page.locator('.post-title h1').innerText() || ''
        const imgSrc = await page.locator('.attachment-featured_image').getAttribute('src') ||''
        const createdAt = await page.locator('.post-date').innerText() || ''

        const categoriesInnerText = await page.$eval('.entry_categories', (element) => {
          const anchors = Array.from(element.querySelectorAll('a'));
          const innerTextArray = anchors.map((anchor) => anchor.innerText ||'');
          const concatenatedText = innerTextArray.join(',');
          console.log('concatenatedText',concatenatedText)
          return concatenatedText;
        });
        
        const fileVersionsSizeDeveloper = await page.$$eval('.dl-size', (elements) => {
          return elements.map(element => {
            const secondSpan = element.querySelector('span:nth-child(2)');
            return secondSpan ? secondSpan.textContent.trim() : '';
          });
        });
      
        const version = fileVersionsSizeDeveloper[0] ||'';
        const fileSize = fileVersionsSizeDeveloper[1] ||'';
        const developer = fileVersionsSizeDeveloper[2] ||'';

        const parentInnerText = await page.$eval('.post_content.entry-content', (element) => {
          // Get all the child elements under the parent element
          const children = Array.from(element.children);
          // Filter out child elements with class "wp-caption" or "hatom-extra"
          const filteredChildren = children.filter((child) => !child.classList.contains('wp-caption') && !child.classList.contains('hatom-extra'));
          // Extract the innerText from the filtered child elements
          const innerTextArray = filteredChildren.map((child) => child.textContent.trim() ||'');
          // Join the innerText values with commas
          return innerTextArray.join(',');
        });
      
        console.log('innerTexts', parentInnerText); // Output the innerTexts to the console
        
      // // megamind
      //  const imgSrcs = await page.$$eval('.post_content.entry-content img', imgs => imgs.map(img => img.getAttribute('src')));

      // // Concatenate the img srcs with commas
      // const imgSrcsString = imgSrcs.join(',');

      // console.log(imgSrcsString);
   
        const downloadButtons = await page.$$('.download_button');
        // Click on the first download button
        if (downloadButtons.length > 0) {
          await downloadButtons[0].click();
          // Wait for navigation to complete with an increased timeout value of 30 seconds
          await page.waitForTimeout(10000); // Add a delay to allow time for new tab to open
    
          // Get the newly opened page
          const pages = await context.pages();
          const newPage = pages[pages.length - 1];
      
          const newPageExtractedMetaTags = await newPage.evaluate(() => {
            const metaTagsArr: any = [];
            const metaTagElements = document.querySelectorAll('.dl a');
            metaTagElements.forEach(metaTagElement => {
              const metaTag: any = {};
              metaTag.href = metaTagElement.getAttribute('href') || '';
              metaTag.innerText = metaTagElement.textContent.trim() || '';
              metaTagsArr.push(metaTag);
            });
            return metaTagsArr;
          });
        apkObj.title = title
        apkObj.imgSrc = imgSrc
        apkObj.createdAt = createdAt
        apkObj.categories= categoriesInnerText
        apkObj.version= version
        apkObj.fileSize= fileSize
        apkObj.developer= developer
        apkObj.allText = parentInnerText
        apkObj.downloadFile =newPageExtractedMetaTags
        metaTags.push(apkObj)
        }
        // page.waitForTimeout(5000)
      }  
    }
  }
  
  catch (error) {
   console.log('eeee', error)
    }
   fs.writeFileSync('metaTags.json', JSON.stringify(metaTags, null, 2));
}

main()
