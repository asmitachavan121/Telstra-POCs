/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const handlebars = require('handlebars')
const pdf = require('html-to-pdf-converter')
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
fs.writeFileSync('htmlFile.html', firstPage, 'utf-8')

// async function createPdf(firstPage) {
// const margin = pdf.PrintMargin.ofMillimeters({
//   top: 7.5,
//   right: 15,
//   bottom: 5,
//   left: 17,
// })
// const puppeteerOptions = {
//   puppeteer: {
//     args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
//   },
// }
// const converter = await pdf.initialize(puppeteerOptions)
// const pdfBuffer = converter.mkCompoundPdf([
//   {
//     pdfContent: firstPage,
//     margin,
//     pageSize: pdf.pageSizeInMM.A4.portrait,
//   },
//   {
//     pdfContent: fs.readFileSync('restpage.html', 'utf-8'),
//     margin,
//     pageSize: pdf.pageSizeInMM.A4.portrait,
//   }
// ])
// console.log(pdfBuffer)

// converter.destroy()
// }
// try {
//   createPdf(firstPage)
// }catch(error) {
//   throw(error)
// }
// var options = {
//   format: 'A4',
//   contents: fs.readFileSync('trial.html', 'utf-8'),
//   // phantomPath: './node_modules/phantomjs-prebuilt/bin/phantomjs'
// }
// pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
//   if (err) return console.log(err);
//   console.log(res); // { filename: '/app/businesscard.pdf' }
// });

