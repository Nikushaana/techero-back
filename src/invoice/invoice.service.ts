import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';
import * as puppeteerCore from 'puppeteer-core';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) { }

  async createInvoice(data: {
    orderId: number;
    amount: number;
    type: InvoiceType;
  }) {
    const invoice = this.invoiceRepo.create({
      order_id: data.orderId,
      amount: data.amount,
      status: InvoiceStatus.PENDING,
      type: data.type,
    });

    return this.invoiceRepo.save(invoice);
  }

  async markAsPaidById(invoiceId: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paid_at = new Date();

    return this.invoiceRepo.save(invoice);
  }

//   async generateInvoiceFile(id: number): Promise<{ buffer: Buffer; filename: string }> {
//     const invoice = await this.invoiceRepo.findOne({
//       where: { id }, relations: [
//         'order',
//         'order.company',
//         'order.individual',
//         'order.address',
//       ],
//     });
//     if (!invoice) throw new NotFoundException('Invoice not found');

//     const logoPath = path.join(process.cwd(), 'src/assets/logo.webp');
//     const logoBase64 = fs.readFileSync(logoPath, 'base64');

//     const order = invoice.order;

//     const client = order.company || order.individual;

//     const clientName = order.company
//       ? order.company.companyName
//       : `${order.individual?.name || ''} ${order.individual?.lastName || ''}`;

//     const clientPhone = client?.phone || '';

//     const address = order.address
//       ? `${order.address.street} ${order.address.building_number}`
//       : '';

//     const techeroInfo = {
//       name: "Techero",
//       address: "თბილისი, საქართველო",
//       phone: "+995 555 00 00 00",
//       email: "info@techero.ge",
//       taxId: "404123456",
//       bank: "TBC Bank",
//       iban: "GE00TB0000000000000000",
//     };

//     const invoiceTypeLabels: Record<InvoiceType, string> = {
//       [InvoiceType.CREATE_ORDER]: "განცხადების შექმნა",
//       [InvoiceType.REPAIR_ORDER]: "შეკეთება",
//       [InvoiceType.SERVICE_ONSITE]: "ადგილზე მომსახურება",
//     };

//     const html = `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta charset="utf-8" />
//     <style>
//       body {
//         font-family: 'Segoe UI', Tahoma, sans-serif;
//         background: #f6f8fb;
//         padding: 40px;
//         color: #333;
//       }

//       .container {
//         max-width: 800px;
//         margin: auto;
//         background: #fff;
//         border-radius: 12px;
//         padding: 30px;
//         box-shadow: 0 10px 30px rgba(0,0,0,0.08);
//       }

//       .header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         border-bottom: 2px solid #eee;
//         padding-bottom: 20px;
//       }

//       .logo {
//         height: 60px;
//       }

//       .invoice-title {
//         text-align: right;
//       }

//       .invoice-title h1 {
//         margin: 0;
//         font-size: 28px;
//         color: #1e88e5;
//       }

//       .status {
//         margin-top: 10px;
//         font-weight: bold;
//         color: ${invoice.status === 'PAID' ? '#2e7d32' : '#f57c00'};
//       }

//       .section {
//         margin-top: 25px;
//       }

//       .section h3 {
//         margin-bottom: 10px;
//         font-size: 16px;
//         color: #555;
//         border-bottom: 1px solid #eee;
//         padding-bottom: 5px;
//       }

//       .info-grid {
//         display: flex;
//         justify-content: space-between;
//         flex-wrap: wrap;
//       }

//       .info-grid div {
//         width: 48%;
//         margin-bottom: 10px;
//       }

//       .table {
//         width: 100%;
//         margin-top: 20px;
//         border-collapse: collapse;
//       }

//       .table th {
//         background: #1e88e5;
//         color: white;
//         padding: 12px;
//         text-align: left;
//       }

//       .table td {
//         border-bottom: 1px solid #eee;
//         padding: 12px;
//       }

//       .total {
//         margin-top: 20px;
//         text-align: right;
//         font-size: 20px;
//         font-weight: bold;
//         color: #1e88e5;
//       }

//       .footer {
//         margin-top: 40px;
//         text-align: center;
//         font-size: 12px;
//         color: #888;
//       }

//     </style>
//   </head>

//   <body>
//   <div class="container">

//     <!-- HEADER -->
//     <div class="header">
//       <img src="data:image/webp;base64,${logoBase64}" class="logo" />

//       <div class="invoice-title">
//         <h1>${getInvoiceLabel(invoice.type)}</h1>
//         <div>ინვოისი #${invoice.id}</div>
//         <div class="status">
//           ${invoice.status === 'PAID' ? 'გადახდილი' : 'მოლოდინში'}
//         </div>
//       </div>
//     </div>

//     <!-- SELLER + CLIENT -->
//     <div class="section">
//       <h3>მხარეები</h3>

//       <div class="info-grid">
//         <div>
//           <strong>გამყიდველი:</strong><br/>
//           ${techeroInfo.name}<br/>
//           ${techeroInfo.address}<br/>
//           ტელ: ${techeroInfo.phone}<br/>
//           ელ-ფოსტა: ${techeroInfo.email}<br/>
//           საიდენტიფიკაციო: ${techeroInfo.taxId}
//         </div>

//         <div>
//           <strong>მყიდველი:</strong><br/>
//           ${clientName}<br/>
//           ტელ: ${clientPhone}<br/>
//           ელ-ფოსტა: ${clientEmail}<br/>
//           მისამართი: ${address}
//         </div>
//       </div>
//     </div>

//     <!-- INVOICE DETAILS -->
//     <div class="section">
//       <h3>ინვოისის დეტალები</h3>

//       <div class="info-grid">
//         <div><strong>შეკვეთის ID:</strong> ${invoice.order_id}</div>
//         <div><strong>კატეგორია:</strong> ${order.category?.name || ''}</div>
//         <div><strong>მოწყობილობა:</strong> ${order.brand} ${order.model}</div>
//         <div><strong>სერვისის ტიპი:</strong> ${order.service_type}</div>
//         <div><strong>შექმნის თარიღი:</strong> ${new Date(invoice.created_at).toLocaleDateString('ka-GE')}</div>
//         <div><strong>გადახდის თარიღი:</strong> ${invoice.paid_at
//         ? new Date(invoice.paid_at).toLocaleDateString('ka-GE')
//         : 'არ არის გადახდილი'
//       }</div>
//       </div>
//     </div>

//     <!-- DESCRIPTION -->
//     <div class="section">
//       <h3>აღწერა</h3>
//       <p>${order.description}</p>
//     </div>

//     <!-- TABLE -->
//     <div class="section">
//       <h3>ფინანსური ინფორმაცია</h3>

//       <table class="table">
//         <thead>
//           <tr>
//             <th>მომსახურება</th>
//             <th>რაოდენობა</th>
//             <th>ფასი</th>
//             <th>ჯამი</th>
//           </tr>
//         </thead>

//         <tbody>
//           <tr>
//             <td>${getInvoiceLabel(invoice.type)}</td>
//             <td>1</td>
//             <td>${invoice.amount} ${invoice.currency}</td>
//             <td>${invoice.amount} ${invoice.currency}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="total">
//         ჯამი: ${invoice.amount} ${invoice.currency}
//       </div>
//     </div>

//     <!-- PAYMENT INFO -->
//     <div class="section">
//       <h3>გადახდის ინფორმაცია</h3>

//       <p><strong>გადახდის პირობები:</strong> გადახდა უნდა განხორციელდეს 3 სამუშაო დღეში</p>
//       <p><strong>გადახდის ვადა:</strong> ${new Date(invoice.created_at.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ka-GE')}</p>
//       <p><strong>მეთოდები:</strong> საბანკო გადარიცხვა</p>
//       <p><strong>ბანკი:</strong> ${techeroInfo.bank}</p>
//       <p><strong>IBAN:</strong> ${techeroInfo.iban}</p>
//     </div>

//     <!-- NOTES -->
//     <div class="section">
//       <h3>დამატებითი ინფორმაცია</h3>
//       <p>გთხოვთ, გადახდისას მიუთითოთ ინვოისის ნომერი.</p>
//     </div>

//     <!-- FOOTER -->
//     <div class="footer">
//       მადლობა, რომ სარგებლობთ Techero-ს მომსახურებით 🚀
//     </div>

//   </div>
// </body>
//   </html>
//   `;

//     const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

//     const browser = isProduction
//       ? await puppeteerCore.launch({
//         args: chromium.args,
//         executablePath: await chromium.executablePath(),
//         headless: true,
//       })
//       : await puppeteer.launch({
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//       });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'load' });

//     const pdfUint8: Uint8Array = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//     });

//     const buffer: Buffer = Buffer.from(pdfUint8.buffer);

//     await browser.close();

//     return {
//       buffer,
//       filename: `invoice-${invoice.id}.pdf`,
//     };
//   }







  //   async generateInvoiceFile(id: number): Promise<{ buffer: Buffer; filename: string }> {
  //     const invoice = await this.invoiceRepo.findOne({ where: { id }, relations: ['order', 'order.user'], });
  //     if (!invoice) throw new NotFoundException('Invoice not found');

  //     const logoPath = path.join(process.cwd(), 'src/assets/logo.webp');
  //     const logoBase64 = fs.readFileSync(logoPath, 'base64');

  //     const client = invoice.order.user;

  //     const html = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <meta charset="utf-8" />
  //   <style>
  //     body {
  //       font-family: 'Segoe UI', Tahoma, sans-serif;
  //       background: #f6f8fb;
  //       padding: 40px;
  //       color: #333;
  //     }

  //     .container {
  //       max-width: 800px;
  //       margin: auto;
  //       background: #fff;
  //       border-radius: 12px;
  //       padding: 30px;
  //       box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  //     }

  //     .header {
  //       display: flex;
  //       justify-content: space-between;
  //       align-items: center;
  //       border-bottom: 2px solid #eee;
  //       padding-bottom: 20px;
  //     }

  //     .logo {
  //       height: 60px;
  //     }

  //     .invoice-title {
  //       text-align: right;
  //     }

  //     .invoice-title h1 {
  //       margin: 0;
  //       font-size: 28px;
  //       color: #1e88e5;
  //     }

  //     .status {
  //       margin-top: 10px;
  //       font-weight: bold;
  //       color: ${invoice.status === 'PAID' ? '#2e7d32' : '#f57c00'};
  //     }

  //     .section {
  //       margin-top: 25px;
  //     }

  //     .section h3 {
  //       margin-bottom: 10px;
  //       font-size: 16px;
  //       color: #555;
  //       border-bottom: 1px solid #eee;
  //       padding-bottom: 5px;
  //     }

  //     .info-grid {
  //       display: flex;
  //       justify-content: space-between;
  //       flex-wrap: wrap;
  //     }

  //     .info-grid div {
  //       width: 48%;
  //       margin-bottom: 10px;
  //     }

  //     .table {
  //       width: 100%;
  //       margin-top: 20px;
  //       border-collapse: collapse;
  //     }

  //     .table th {
  //       background: #1e88e5;
  //       color: white;
  //       padding: 12px;
  //       text-align: left;
  //     }

  //     .table td {
  //       border-bottom: 1px solid #eee;
  //       padding: 12px;
  //     }

  //     .total {
  //       margin-top: 20px;
  //       text-align: right;
  //       font-size: 20px;
  //       font-weight: bold;
  //       color: #1e88e5;
  //     }

  //     .footer {
  //       margin-top: 40px;
  //       text-align: center;
  //       font-size: 12px;
  //       color: #888;
  //     }

  //   </style>
  // </head>

  // <body>
  //   <div class="container">

  //     <!-- HEADER -->
  //     <div class="header">
  //       <img src="data:image/webp;base64,${logoBase64}" class="logo" />

  //       <div class="invoice-title">
  //         <h1>${getInvoiceLabel(invoice.type)}</h1>
  //         <div>#${invoice.id}</div>
  //         <div class="status">
  //           ${invoice.status === 'PAID'
  //         ? 'გადახდილი'
  //         : 'მოლოდინში'
  //       }
  //         </div>
  //       </div>
  //     </div>

  //     <!-- COMPANY + CLIENT -->
  //     <div class="section">
  //       <h3>ინფორმაცია</h3>

  //       <div class="info-grid">

  //         <div>
  //           <strong>გამყიდველი:</strong><br/>
  //           ${techeroInfo.name}<br/>
  //           ${techeroInfo.address}<br/>
  //           ${techeroInfo.phone}<br/>
  //           ${techeroInfo.email}
  //         </div>

  //         <div>
  //           <strong>მყიდველი:</strong><br/>
  //           ${client?.name || ''}<br/>
  //           ${client?.email || ''}<br/>
  //           ${client?.phone || ''}
  //         </div>

  //       </div>
  //     </div>

  //     <!-- DETAILS -->
  //     <div class="section">
  //       <h3>ინვოისის დეტალები</h3>

  //       <div class="info-grid">
  //         <div><strong>შეკვეთის ID:</strong> ${invoice.order_id}</div>
  //         <div><strong>ტიპი:</strong> ${getInvoiceLabel(invoice.type)}</div>
  //         <div><strong>შექმნის თარიღი:</strong> ${new Date(invoice.created_at).toLocaleDateString('ka-GE')}</div>
  //         <div><strong>გადახდის თარიღი:</strong> ${invoice.paid_at
  //         ? new Date(invoice.paid_at).toLocaleDateString('ka-GE')
  //         : 'არ არის გადახდილი'
  //       }</div>
  //       </div>
  //     </div>

  //     <!-- TABLE -->
  //     <div class="section">
  //       <h3>სერვისი</h3>

  //       <table class="table">
  //         <thead>
  //           <tr>
  //             <th>მომსახურება</th>
  //             <th>სტატუსი</th>
  //             <th>ფასი</th>
  //           </tr>
  //         </thead>

  //         <tbody>
  //           <tr>
  //             <td>${getInvoiceLabel(invoice.type)}</td>
  //             <td>${invoice.status === 'PAID' ? 'გადახდილი' : 'მოლოდინში'}</td>
  //             <td>${invoice.amount} ${invoice.currency}</td>
  //           </tr>
  //         </tbody>
  //       </table>

  //       <div class="total">
  //         ჯამი: ${invoice.amount} ${invoice.currency}
  //       </div>
  //     </div>

  //     <!-- FOOTER -->
  //     <div class="footer">
  //       მადლობა, რომ სარგებლობთ Techero-ს მომსახურებით 🚀
  //     </div>

  //   </div>
  // </body>
  // </html>
  // `;

  //     const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

  //     const browser = isProduction
  //       ? await puppeteerCore.launch({
  //         args: chromium.args,
  //         executablePath: await chromium.executablePath(),
  //         headless: true,
  //       })
  //       : await puppeteer.launch({
  //         headless: true,
  //         args: ['--no-sandbox', '--disable-setuid-sandbox'],
  //       });

  //     const page = await browser.newPage();
  //     await page.setContent(html, { waitUntil: 'load' });

  //     const pdfUint8: Uint8Array = await page.pdf({
  //       format: 'A4',
  //       printBackground: true,
  //     });

  //     const buffer: Buffer = Buffer.from(pdfUint8.buffer);

  //     await browser.close();

  //     return {
  //       buffer,
  //       filename: `invoice-${invoice.id}.pdf`,
  //     };
  //   }
}