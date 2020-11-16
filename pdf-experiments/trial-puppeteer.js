/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const handlebars = require('handlebars')
const puppeteer = require('puppeteer')
const PDFMerger = require('pdf-merger-js')
var merger = new PDFMerger()

const htmlTemplate = fs.readFileSync('trial.html', 'utf-8')
  handlebars.registerHelper('print_person', function () {
    return this.firstname + ' ' + this.lastname
})

const firstPage = handlebars.compile(htmlTemplate)({
    people: [
        {
          firstname: "Nils",
          lastname: "Knappmeier",
        },
        {
          firstname: "Yehuda",
          lastname: "Katz",
        },
      ],
})

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

const orders = JSON.parse(fs.readFileSync('orders.json', 'utf-8'))
const { firstPageOrders, secondPageOrders } = splitOrders(orders, 7)
console.log('first page orders = ', firstPageOrders)
console.log('second page orders = ', secondPageOrders)


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
