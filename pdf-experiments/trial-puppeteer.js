/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const handlebars = require('handlebars')
const puppeteer = require('puppeteer')
const PDFMerger = require('pdf-merger-js')
var merger = new PDFMerger()

async function mergePdf (firstFileName, secondFileName) {
  merger.add(firstFileName)
  merger.add(secondFileName)
  await merger.save('final.pdf')
}
function splitOrders(orders, columnsCount) {
  const keys = Object.keys(orders[0])
  const firstPageFields = keys.slice(0,columnsCount)
  const secondPageFields = keys.slice(columnsCount,)
  let firstPageOrders = []
  let secondPageOrders = []
  orders.forEach(order => {
    let partialOrder = {}
    firstPageFields.forEach(field => {
      partialOrder[field] = order[field]
    })
    firstPageOrders.push(partialOrder)

  })
  orders.forEach(order => {
    let partialOrder = {}
    secondPageFields.forEach(field => {
      partialOrder[field] = order[field]
    })
    secondPageOrders.push(partialOrder)
  })
  return { firstPageOrders, secondPageOrders}
}

const totalOrders = JSON.parse(fs.readFileSync('orders.json', 'utf-8'))
const { firstPageOrders, secondPageOrders } = splitOrders(totalOrders, 7)
console.log('first page orders = ', firstPageOrders)
console.log('second page orders = ', secondPageOrders)

const fields = {
  Number: 'Number',
  'Secondary reference': 'Secondary reference',
  Name: 'Name',
  Location: 'Location',
  Status: 'Status',
  'Sites Complete': 'Sites Complete',
  Estimated: 'Estimated',
  Completed: 'Completed'
}
const currentDate = '11/12/2020'
const cidn = '123456'
const companyName = 'Delhi Capitals'
const htmlTemplate = fs.readFileSync('pdf-download-template.html', 'utf-8')
handlebars.registerHelper('ifeq', function(a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
  return options.inverse(this);
});
const orders = firstPageOrders
const firstPage = handlebars.compile(htmlTemplate)({
  orders,
  fields,
  currentDate,
  cidn,
  companyName,
});

async function createPdf () {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = await fs.readFileSync('restpage.html')
    const content = htmlContent.toString()
    console.log(content)
    await page.setContent(firstPage)
    await page.pdf({path: 'firstPage.pdf', format: 'A4'});
    await page.setContent(content)
    await page.pdf({path: 'secondPage.pdf', format: 'A4'});
    await browser.close();
  }catch(error) {
    throw error
  }
  
}
try {
  createPdf()
  mergePdf('firstPage.pdf','secondPage.pdf')
}catch(err) {
  throw err
}
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto('htmlFile.html');
//   await page.pdf({path: 'hn.pdf', format: 'A4'});
 
//   await browser.close();
// })()
