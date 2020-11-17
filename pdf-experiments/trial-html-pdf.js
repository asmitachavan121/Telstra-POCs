/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const handlebars = require('handlebars')
const pdf = require('html-pdf')
const PDFMerger = require('pdf-merger-js')
var merger = new PDFMerger()

async function mergePdf (firstFileName, secondFileName) {
  merger.add(firstFileName)
  merger.add(secondFileName)
  if(fs.existsSync('final.pdf')) {
    fs.unlinkSync('final.pdf')
  }
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

function splitFields(fields, columnsCount) {
  const keys = Object.keys(fields)
  const firstPageKeys = keys.slice(0,columnsCount)
  const secondPageKeys = keys.slice(columnsCount,)
  const firstPageFields = {}
  const secondPageFields = {}
  firstPageKeys.forEach(key => {
    firstPageFields[key] = fields[key]
  })
  secondPageKeys.forEach(key => {
    secondPageFields[key] = fields[key]
  })
  return { firstPageFields, secondPageFields}
}

const totalOrders = JSON.parse(fs.readFileSync('orders.json', 'utf-8'))
const { firstPageOrders, secondPageOrders } = splitOrders(totalOrders, 5)
console.log('first page orders = ', firstPageOrders)
console.log('second page orders = ', secondPageOrders)

const Totalfields = {
  Number: 'Number',
  'Secondary reference': 'Secondary reference',
  Name: 'Name',
  Location: 'Location',
  Status: 'Status',
  'Sites Complete': 'Sites Complete',
  Estimated: 'Estimated',
  Completed: 'Completed'
}
const splitedFields = splitFields(Totalfields, 5)
const secondPageFields = splitedFields.secondPageFields
const firstPageFields = splitedFields.firstPageFields
console.log('first page fields = ', firstPageFields)
console.log('second page fields = ', secondPageFields)
const currentDate = '11/12/2020'
const cidn = '123456'
const companyName = 'Delhi Capitals'
const contentTemplate = fs.readFileSync('pdf-download-template.html', 'utf-8')
const headerTemplate = fs.readFileSync('pdf-download-template-header.html', 'utf-8')
handlebars.registerHelper('ifeq', function(a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
  return options.inverse(this);
});
let orders = firstPageOrders
let fields = firstPageFields
const firstPage = handlebars.compile(contentTemplate)({
  orders,
  fields,
  currentDate,
  cidn,
  companyName,
});
const firstPageHeader = handlebars.compile(headerTemplate)({
  fields,
  currentDate,
  cidn,
  companyName
})
fs.writeFileSync('firstheader.html',firstPageHeader,'utf-8')
orders = secondPageOrders
fields = secondPageFields
const secondPage = handlebars.compile(contentTemplate)({
  orders,
  fields,
  currentDate,
  cidn,
  companyName,
});
const secondPageHeader = handlebars.compile(headerTemplate)({
  fields,
  currentDate,
  cidn,
  companyName
})
fs.writeFile('header.html',firstPageHeader,error => {
  console.log('header file writing done..')
})
async function createPdf (firstPage, secondPage, firstPageHeader, secondPageHeader) {
  const pdfOptions = {
    "type" : 'pdf',
    "header" : {
      "contents": firstPageHeader
    },
    "footer":{
      "contents":  '<p>A4-Landscape</>',
    },
    "orientation" : "landscape",
    "format" : 'A4',
    printBackground : true,
    margin : {
      top : '250px',
      bottom : '100px'
    }
  }
  const firstPageOptions = {
    path : 'firstpage.pdf',
    "header" : {
      "contents": firstPageHeader
    }
  }
  const secondPageOptions = {
    path : 'secondpage.pdf',
    "header" : {
      "contents" : secondPageHeader
    }
  }
 
 pdf.create(firstPage,{...pdfOptions,...firstPageOptions}).toFile('firstpage.pdf',(err, res) => {
   if(err) 
    throw err
  console.log(res.filename)
 })
 pdf.create(secondPage,{...pdfOptions,...secondPageOptions}).toFile('secondpage.pdf', (err, res) => {
   console.log(res.filename)
 })
}
try {
  createPdf(firstPage, secondPage, firstPageHeader, secondPageHeader)
  setTimeout(() => {
    mergePdf('firstpage.pdf','secondpage.pdf')

  }, 5000)
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
