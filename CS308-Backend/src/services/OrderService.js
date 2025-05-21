const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const CartService = require('./CartService');
const ProductService = require('./ProductService');
const CustomerInfoService = require('./CustomerInfoService');
const nodemailer = require('nodemailer');
const db = require('../config/database');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
  });

class OrderService {

    static async createOrder(userId, cartId) {
      const cart = await CartService.getCartById(cartId);
      if (!cart || !cart.products) throw new Error('Cart not found or is empty');
  
      const products = cart.products;
      const productList = [];
      let totalPrice = 0;
  
      for (let productId in products) {
        const quantity = products[productId];
        const product = await ProductService.getProductById(productId);
        if (product) {
        // Apply discount if exists
        const discountRate = product.discount || 0;
        const discountedUnitPrice = Number(product.price) * (1 - discountRate / 100);
        const itemTotal = discountedUnitPrice * quantity;

        totalPrice += itemTotal;

        productList.push({
          name: product.name,
          image: product.picture,
          p_id: productId,
          quantity: quantity,
          unit_price: Number(discountedUnitPrice.toFixed(2)),
          total_price: Number(itemTotal.toFixed(2))
        });

          // NEW: Decrease stock
          const updateStockQuery = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
          const [updateResult] = await db.execute(updateStockQuery, [quantity, productId, quantity]);

          if (updateResult.affectedRows === 0) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }

          // ✨ Increase sale_count
          const updateSaleCountQuery = 'UPDATE products SET sale_count = sale_count + ? WHERE id = ?';
          await db.execute(updateSaleCountQuery, [quantity, productId]);

          // Recalculate popularity
          const [ratingRows] = await db.execute('SELECT AVG(rate) AS avg_rating FROM rate WHERE product_id = ?', [productId]);
          const avgRating = ratingRows[0]?.avg_rating || 0;

          // Get updated sale count for this product
          const [saleRows] = await db.execute('SELECT sale_count FROM products WHERE id = ?', [productId]);
          const saleCount = saleRows[0]?.sale_count || 0;

          // Get total sale count for all products
          const [totalSaleRows] = await db.execute('SELECT SUM(sale_count) AS total_sales FROM products');
          const totalSales = totalSaleRows[0]?.total_sales || 1; // prevent divide by zero

          // Calculate popularity
          const normalizedSaleScore = (saleCount / totalSales) * 5; // scale to 0–5
          const popularity = ((0.3 * avgRating) + (0.7 * normalizedSaleScore)) * 20;


          // Update popularity
          await db.execute('UPDATE products SET popularity = ? WHERE id = ?', [popularity, productId]);


        }
      }

      const customerInfo = await CustomerInfoService.getCustomerInfoByUserId(userId);
      const address = customerInfo?.delivery_address || 'No address provided';
      const legalName = customerInfo?.legal_name || 'Valued Customer';      

      const orderStatus = 'processing';
      const date = new Date();
  
      const insertQuery = `
        INSERT INTO orders (user_id, order_status, product_list, total_price, address, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      const [result] = await db.execute(insertQuery, [
        userId,
        orderStatus,
        JSON.stringify(productList),
        totalPrice,
        address,
        date
      ]);
  
      const orderId = result.insertId;

      // Fetch user email
      const userQuery = 'SELECT email FROM users WHERE user_id = ?';
      const [userRows] = await db.execute(userQuery, [userId]);
      const userEmail = userRows[0]?.email;

      // Generate PDF invoice
      const pdfBuffer = await OrderService.generateInvoicePDFBuffer({
        orderId,
        userEmail,
        legalName: legalName,
        productList,
        totalPrice,
        address,
        date
      });
      
      // Convert PDF to Base64 and store it in the order
      const pdfBase64 = pdfBuffer.toString('base64');
      const updateInvoiceQuery = `
        UPDATE orders SET invoice_pdf = ? WHERE order_id = ?
      `;
      await db.execute(updateInvoiceQuery, [pdfBase64, orderId]);

      if (userEmail) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '🧾 Your DriftMoodCoffee Order Confirmation',
            text: `Thank you for your order!\n\nOrder ID: ${result.insertId}\nTotal: $${totalPrice}`,
            html: `
              <h2>☕ DriftMood Coffee</h2>
              <p>Thank you for your order!</p>
              <p><strong>Order ID:</strong> ${result.insertId}</p>
              <p><strong>Total:</strong> $${totalPrice}</p>
              <p>Your order is now being processed and will be on its way soon!</p>
            `,
            attachments: [
              {
                filename: `invoice.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]            
        };
  
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${userEmail}`);
      }
  
      await CartService.clearCart(cartId);
  
      return {
        order: {
          order_id: orderId,
          status: orderStatus,
          total_price: totalPrice,
          products: productList
        },
        invoiceBase64: pdfBuffer.toString('base64')
      };
    }

    static async generateInvoicePDFBuffer(orderData) {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
    
        // Use Unicode-capable font
        const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
        const fontPathBold  = path.join(__dirname, '../fonts/DejaVuSans-Bold.ttf');
        doc.registerFont('Unicode', fontPath);
        doc.registerFont('Unicode-Bold', fontPathBold);
        doc.font('Unicode');

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));
    
        // Document header
        doc.fontSize(20).text('DriftMood Coffee', { align: 'center' });
        doc.fontSize(10).text('www.driftmoodcoffee.com', { align: 'center' });
        doc.moveDown();
    
        doc.fontSize(14).text('INVOICE', { align: 'center' });
        doc.moveDown();
    
        // Customer / Order info
        doc.fontSize(12);
        doc.text(`Invoice Number: ${orderData.orderId}`);
        doc.text(`Date: ${orderData.date.toLocaleDateString()}`);
        doc.text(`Customer Name: ${orderData.legalName}`);
        doc.text(`Customer Email: ${orderData.userEmail}`);
        doc.text(`Delivery Address: ${orderData.address}`);
        doc.moveDown(1.5);
    
        // Table layout constants
        const tableLeftX  = 50;             // left margin for the table
        const colWidths   = [220, 90, 90, 90];  // Product | Unit Price | Quantity | Total
        const colAlign    = ['left', 'right', 'right', 'right'];
    
        // helper: draw a single row, return row height
        function drawRow(y, cells, isHeader = false) {
          if (isHeader) doc.font('Unicode-Bold');
          else          doc.font('Unicode');
    
          let maxHeight = 0;
          let x = tableLeftX;
    
          cells.forEach((cell, idx) => {
            const options = { width: colWidths[idx], align: colAlign[idx] };
            doc.text(cell, x, y, options);
            const h = doc.heightOfString(cell, options);
            maxHeight = Math.max(maxHeight, h);
            x += colWidths[idx];
          });
    
          return maxHeight;
        }
    
        // Table header
        let cursorY = doc.y;
        cursorY += drawRow(cursorY, ['Product', 'Unit Price', 'Quantity', 'Total'], true) + 6;
        doc.moveTo(tableLeftX, cursorY - 2).lineTo(tableLeftX + colWidths.reduce((a, b) => a + b), cursorY - 2).stroke();
    
        // Table rows
        orderData.productList.forEach(item => {
          const cells = [
            item.name,
            `$${item.unit_price.toFixed(2)}`,
            item.quantity.toString(),
            `$${item.total_price.toFixed(2)}`
          ];
    
          const rowHeight = drawRow(cursorY, cells);
          cursorY += rowHeight + 4;          // 4 pt padding between rows
        });
    
        // Total amount
        doc.moveDown();
        doc.font('Unicode').fontSize(14);
        doc.text(`Total Amount Due: $${orderData.totalPrice.toFixed(2)}`, {
          align: 'right'
        });
    
        // Footer
        doc.moveDown();
        doc.font('Helvetica').fontSize(10)
           .text('Thank you for shopping with DriftMood Coffee!', { align: 'center' });
    
        doc.end();
      });
    }    

    static async changeOrderStatus(orderId, newStatus) {
      const validStatuses = ['processing', 'in-transit', 'delivered', 'cancelled'];
    
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid order status');
      }
    
      // Get the current order (and related info)
      const [orderRows] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [orderId]);
      if (orderRows.length === 0) {
        throw new Error('Order not found');
      }
    
      const order = orderRows[0];
    
      // Update the order status in DB
      const updateQuery = 'UPDATE orders SET order_status = ? WHERE order_id = ?';
      await db.execute(updateQuery, [newStatus, orderId]);
    
      // Notify user via email
      const [userRows] = await db.execute('SELECT email FROM users WHERE user_id = ?', [order.user_id]);
      const userEmail = userRows[0]?.email;
    
      if (userEmail) {
        let mailOptions;
        if(newStatus == 'cancelled'){
          mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: '❌ Your Order Has Been Cancelled',
          html:  `
            <h2>📦 Order Update</h2>
            <p>Your order <strong>#${orderId}</strong> has been cancelled.</p>
            <p><strong>Status:</strong> ${newStatus}</p>
            <p>Thank you for shopping with DriftMood Coffee!</p>
          `
        };
        }
        else{
          mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: '📦 Your Order Status Has Been Updated',
          text: `Your order (ID: ${orderId}) status has changed to "${newStatus}".`,
          html: `
            <h2>📦 Order Update</h2>
            <p>Your order <strong>#${orderId}</strong> has been updated.</p>
            <p><strong>Status:</strong> ${newStatus}</p>
            <p>Thank you for shopping with DriftMood Coffee!</p>
          `
        };
        }
        await transporter.sendMail(mailOptions);
        console.log(`📬 Status update email sent to ${userEmail}`);
      }
    
      return {
        order_id: orderId,
        new_status: newStatus
      };
    }

  static async getOrdersByUserId(userId) {
    const query = `
      SELECT order_id, order_status, product_list, total_price, address, date
      FROM orders
      WHERE user_id = ?
      ORDER BY date DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    return rows; // An array of orders
  }

  static async getInvoiceByOrderId(userId, orderId) {
    // Verify order ownership
    const query = 'SELECT invoice_pdf, user_id FROM orders WHERE order_id = ?';
    const [rows] = await db.execute(query, [orderId]);
  
    if (rows.length === 0) {
      throw new Error('Order not found');
    }
  
    const order = rows[0];
    if (order.user_id !== userId) {
      throw new Error('Unauthorized: Order does not belong to this user');
    }
  
    return { invoiceBase64: order.invoice_pdf };
  }

  static async getInvoiceByOrderIdAsPM(orderId) {
    const query = 'SELECT invoice_pdf FROM orders WHERE order_id = ?';
    const [rows] = await db.execute(query, [orderId]);

    if (rows.length === 0) {
      throw new Error('Order not found');
    }

    return rows[0].invoice_pdf;
  }
    
  static async cancelOrderIfAllowed(orderId, userId) {
    // Fetch the order
    const [rows] = await db.execute('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (rows.length === 0) throw new Error('Order not found');
  
    const order = rows[0];
  
    // Check ownership
    if (order.user_id !== userId) {
      throw new Error('Unauthorized: You cannot cancel this order');
    }
  
    // Only allow cancellation if not delivered
    if (order.order_status === 'delivered') {
      throw new Error('Order already delivered, cannot be cancelled');
    }
    // Restore product stock
    let products = [];

    try {
      products = typeof order.product_list === 'string'
        ? JSON.parse(order.product_list)
        : order.product_list;

      for (const item of products) {
        const productId = item.p_id;
        const quantity = item.quantity;

        await db.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [quantity, productId]
        );
      }
    } catch (err) {
      console.error("Failed to restore stock:", err.message);
    }
    // Cancel the order
    await db.execute('UPDATE orders SET order_status = ? WHERE order_id = ?', ['cancelled', orderId]);
  
    // Notify user via email (reusing logic)
    await OrderService.changeOrderStatus(orderId, 'cancelled');
  
    return {
      order_id: orderId,
      new_status: 'cancelled'
    };
  }

  static async getRevenueData(startDate, endDate) {
    const ordersQuery = `
      SELECT order_id, date, product_list, total_price, order_status
      FROM orders
      WHERE date >= ? AND date < DATE_ADD(?, INTERVAL 1 DAY)
      ORDER BY date
    `;
  
    const [orders] = await db.execute(ordersQuery, [startDate, endDate]);
  
    const dailySummary = {};
  
    for (const order of orders) {
      const day = order.date.toISOString().split('T')[0];
      let productList = typeof order.product_list === 'string' ? JSON.parse(order.product_list) : order.product_list;
      const isCancelled = order.order_status === 'cancelled';
  
      let revenue = Number(order.total_price);
      let cost = 0;
  
      for (const item of productList) {
        const [productRows] = await db.execute('SELECT price FROM products WHERE id = ?', [item.p_id]);
        const basePrice = Number(productRows[0]?.price || 0);
        cost += basePrice * item.quantity * 0.5;
      }
  
      if (!dailySummary[day]) {
        dailySummary[day] = { revenue: 0, cost: 0 };
      }
  
      // Subtract if cancelled, add if active
      dailySummary[day].revenue += isCancelled ? -revenue : revenue;
      dailySummary[day].cost += isCancelled ? -cost : cost;
    }
  
    // 🧾 Handle refunds (approved only)
    const refundQuery = `
      SELECT r.amount, r.quantity, r.order_id, r.product_id, o.date, p.price
      FROM refunds r
      JOIN orders o ON r.order_id = o.order_id
      JOIN products p ON r.product_id = p.id
      WHERE r.status = 'approved' AND o.date >= ? AND o.date < DATE_ADD(?, INTERVAL 1 DAY)
    `;
  
    const [refunds] = await db.execute(refundQuery, [startDate, endDate]);
  
    for (const refund of refunds) {
      const day = refund.date.toISOString().split('T')[0];
      const refundRevenue = Number(refund.amount);
      const refundCost = Number(refund.price) * refund.quantity * 0.5;
  
      if (!dailySummary[day]) {
        dailySummary[day] = { revenue: 0, cost: 0 };
      }
  
      dailySummary[day].revenue -= refundRevenue;
      dailySummary[day].cost -= refundCost;
    }
  
    return Object.entries(dailySummary).map(([date, { revenue, cost }]) => ({
      date,
      revenue,
      estimatedCost: cost,
      profit: revenue - cost
    }));
  }
  

  static async getAllOrders() {
    const query = `
    SELECT 
      orders.*, 
      users.email
    FROM orders
    JOIN users ON orders.user_id = users.user_id
  `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getOrderById(orderId) {
    const query = 'SELECT * FROM orders WHERE order_id = ?';
    const [rows] = await db.execute(query, [orderId]);
  
    if (rows.length === 0) {
      throw new Error('Order not found');
    }
  
    const order = rows[0];
    if (typeof order.product_list === 'string') {
      try {
        order.product_list = JSON.parse(order.product_list);
      } catch (err) {
        order.product_list = [];
      }
    }
  
    return order;
  }
  
}

module.exports = OrderService