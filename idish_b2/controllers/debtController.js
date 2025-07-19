const Debt = require("../models/Debt");
const Promo = require("../models/Promo");
const Rate = require("../models/usdModel");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Client = require("../models/Client");
const moment = require("moment");

exports.createDebt = async (req, res) => {
  try {
    const {
      clientId,
      partnerId,
      products,
      dueDate,
      paymentHistory = [],
      promokodId,
    } = req.body;

     const storeId = req.user.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Mahsulotlar kerak" });
    }

    const rateObj = await Rate.findOne();
    if (!rateObj) {
      return res.status(400).json({ message: "Valyuta kurslari topilmadi" });
    }

    // Mahsulot zaxirasini kamaytirish
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Mahsulot topilmadi: ${item.productId}` });
      }

      const quantity = item.quantity;

      // Box
      if (product.package_quantity_per_box && product.quantity_per_package) {
        product.box_quantity -= (
          quantity /
          product.package_quantity_per_box /
          product.quantity_per_package
        ).toFixed(2);
      }

      // Package
      if (product.isPackage && product.quantity_per_package) {
        product.package_quantity -= quantity / product.quantity_per_package;
      }

      // Quantity
      product.quantity -= quantity;

      await product.save();
    }

    // USD ga konvertatsiya qilingan umumiy narx va chegirma
    let totalAmount = 0;
    let totalDiscount = 0;

    for (const item of products) {
      const amountUSD =
        item.currency === "SUM"
          ? item.totalAmount / rateObj.rate
          : item.currency === "KYG"
          ? item.totalAmount / rateObj.kyg
          : item.totalAmount;

      const discountUSD =
        item.currency === "SUM"
          ? item.discount / rateObj.rate
          : item.currency === "KYG"
          ? item.discount / rateObj.kyg
          : item.discount;

      totalAmount += amountUSD;
      totalDiscount += discountUSD;
    }

    // To'lovni USD ga aylantirish
    let paid = 0;
    if (paymentHistory.length > 0) {
      const { amount, currency } = paymentHistory[0];
      if (currency === "SUM") paid = amount / rateObj.rate;
      else if (currency === "KYG") paid = amount / rateObj.kyg;
      else paid = amount;
    }

    const remainingAmount = totalAmount - paid;

    // Yangi qarzdorlik hujjati yaratish
    const newDebt = new Debt({
      clientId,
      partnerId,
      products,
      dueDate,
      promokodId: promokodId || null,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      remainingAmount: Number(remainingAmount.toFixed(2)),
      paymentHistory,
      paymentMethod: "credit",
      storeId,
    });

    await newDebt.save();

    res.status(201).json(newDebt);
  } catch (error) {
    console.error("❌ createDebt error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDebtsByClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const debts = await Debt.find({ clientId })
      .populate("products.productId")
      .populate("paymentHistory.storeId");
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payDebt = async (req, res) => {
  const { id } = req.params;
  const storeId = req.user.id;
  let { amount, currency, type } = req.body;

  try {
    const debt = await Debt.findById(id);
    const rateObj = await Rate.findOne();

    if (!debt) return res.status(404).json({ message: "Debt not found" });
    if (!amount || isNaN(amount))
      return res.status(400).json({ message: "Invalid amount" });
    if (!rateObj || isNaN(rateObj.rate))
      return res.status(400).json({ message: "Invalid exchange rate" });

    const { rate, kyg } = rateObj;

    debt.paymentHistory.push({
      amount,
      currency,
      storeId,
      type,
      date: new Date(),
    });

    // Valyutaga qarab convert
    let paidInUSD = 0;
    if (currency === "USD") paidInUSD = amount;
    else if (currency === "SUM") paidInUSD = amount / rate;
    else if (currency === "KYG") paidInUSD = amount / kyg;
    else return res.status(400).json({ message: "Unsupported currency" });

    debt.remainingAmount = Number(
      (debt.remainingAmount - paidInUSD).toFixed(2)
    );

    const client = debt.clientId ? await Client.findById(debt.clientId) : null;

    // Faqat to‘liq to‘langan bo‘lsa sotuv qilinsin
    if (debt.remainingAmount <= 0) {
      debt.status = "paid";
      debt.remainingAmount = 0;

      for (const item of debt.products) {
        await Sale.create({
          clientId: debt.clientId,
          partnerId: debt.partnerId,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          storeId,
          warehouseId: item.warehouseId,
          sellingPrice: item.sellingPrice,
          totalAmount: item.totalAmount,
          discount: item.totalDiscount,
          promokodId: item.promokodId || null,
          currency: item.currency,
          clientAddress: client?.address || "Unknown",
          paymentMethod: debt.paymentMethod,
          payment: {
            usd: debt.paymentHistory
              .filter((p) => p.currency === "USD")
              .reduce((sum, p) => sum + p.amount, 0),
            sum: debt.paymentHistory
              .filter((p) => p.currency === "SUM")
              .reduce((sum, p) => sum + p.amount, 0),
          },
        });
      }
    }

    await debt.save();
    res.status(200).json(debt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDebtors = async (req, res) => {
  try {
    const debtors = await Debt.find({ status: "pending" })
      .populate("clientId")
      .populate("products.productId")
      .populate("paymentHistory.storeId");
    res.status(200).json(debtors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDailyPaymentsByStoreId = async (req, res) => {
  try {
    const { date, storeId } = req.query;

    if (!date || !storeId) {
      return res.status(400).json({ message: "Sana va do'kon talab qilinadi" });
    }

    const targetDate = moment(date, "DD-MM-YYYY");

    const allDebts = await Debt.find({ "paymentHistory.storeId": storeId })
      .populate("productId")
      .populate("clientId");

    const matchedPayments = [];

    allDebts.forEach((debt) => {
      if (Array.isArray(debt.paymentHistory)) {
        debt.paymentHistory.forEach((payment) => {
          const paymentDate = moment(payment.date).utcOffset(5 * 60);

          if (
            paymentDate.format("DD-MM-YYYY") ===
              targetDate.format("DD-MM-YYYY") &&
            payment.storeId.toString() === storeId
          ) {
            matchedPayments.push({
              debtorId: debt._id,
              client: debt.clientId,
              amount: payment.amount,
              currency: payment.currency,
              date: paymentDate.format("YYYY-MM-DD HH:mm"),
              product: debt.productId?.name || null,
            });
          }
        });
      }
    });

    return res.status(200).json(matchedPayments);
  } catch (error) {
    console.error("getDailyPaymentsByStoreId error:", error);
    return res.status(500).json({ message: "Ichki server xatosi" });
  }
};
