const Debt = require("../models/Debt");
const Rate = require("../models/usdModel");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Client = require("../models/Client");
const moment = require("moment");

// exports.createDebt = async (req, res) => {
//   const {
//     clientId,
//     partnerId,
//     productId,
//     quantity,
//     currency,
//     totalAmount,
//     paymentMethod,
//     unit,
//     sellingPrice,
//     warehouseId,
//     discount,
//     dueDate,
//     paymentHistory,
//   } = req.body;

//   if (!productId || !quantity || !totalAmount || !warehouseId) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     const rateObj = await Rate.findOne();
//     const product = await Product.findById(productId);
//     product.box_quantity -= (
//       quantity /
//       product.package_quantity_per_box /
//       product.quantity_per_package
//     ).toFixed(2);
//     if (product.isPackage) {
//       product.package_quantity -= quantity / product.quantity_per_package;
//     }
//     product.quantity -= quantity;
//     product.total_kg -= parseFloat(
//       (
//         (unit === "box_quantity"
//           ? quantity /
//             product.package_quantity_per_box /
//             (product.isPackage ? product.quantity_per_package : 1)
//           : unit === "package_quantity"
//           ? product.isPackage
//             ? quantity / product.quantity_per_package
//             : 0
//           : unit === "quantity"
//           ? quantity
//           : 0) *
//         (unit === "quantity"
//           ? product.kg_per_quantity
//           : unit === "package_quantity"
//           ? product.isPackage
//             ? product.kg_per_package
//             : 0
//           : product.kg_per_box)
//       ).toFixed(2)
//     );

//     await product.save();
//     const newDebt = new Debt({
//       clientId,
//       partnerId,
//       productId,
//       quantity,
//       unit,
//       sellingPrice,
//       warehouseId,
//       totalAmount,
//       currency,
//       discount,
//       paymentMethod,
//       dueDate,
//       paymentHistory: paymentHistory || [],
//       remainingAmount: req.body.initialPayment
//         ? totalAmount - req.body.initialPayment
//         : totalAmount,
//     });
//     await newDebt.save();
//     res.status(201).json(newDebt);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.createDebt = async (req, res) => {
//   try {
//     const {
//       clientId,
//       partnerId,
//       products,
//       dueDate,
//       paymentHistory = [],
//     } = req.body;

//     if (!products || !Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: "Mahsulotlar majburiy" });
//     }

//     const rateObj = await Rate.findOne();
//     if (!rateObj) {
//       return res.status(400).json({ message: "Valyuta kurslari topilmadi" });
//     }

//     let totalAmountUSD = 0;

//     for (const item of products) {
//       const {
//         productId,
//         warehouseId,
//         quantity,
//         discount,
//         sellingPrice,
//         unit,
//         currency,
//       } = item;

//       if (
//         !productId ||
//         !quantity ||
//         !sellingPrice ||
//         !warehouseId ||
//         !currency ||
//         !unit
//       ) {
//         return res
//           .status(400)
//           .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
//       }

//       const product = await Product.findById(productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: `Mahsulot topilmadi: ${productId}` });
//       }

//       product.box_quantity -= (
//         quantity /
//         product.package_quantity_per_box /
//         product.quantity_per_package
//       ).toFixed(2);

//       if (product.isPackage) {
//         product.package_quantity -= quantity / product.quantity_per_package;
//       }

//       product.quantity -= quantity;

//       product.total_kg -= parseFloat(
//         (
//           (unit === "box_quantity"
//             ? quantity /
//               product.package_quantity_per_box /
//               (product.isPackage ? product.quantity_per_package : 1)
//             : unit === "package_quantity"
//             ? product.isPackage
//               ? quantity / product.quantity_per_package
//               : 0
//             : unit === "quantity"
//             ? quantity
//             : 0) *
//           (unit === "quantity"
//             ? product.kg_per_quantity
//             : unit === "package_quantity"
//             ? product.isPackage
//               ? product.kg_per_package
//               : 0
//             : product.kg_per_box)
//         ).toFixed(2)
//       );

//       await product.save();

//       let convertedPrice = sellingPrice * quantity;
//       if (currency === "SUM") {
//         convertedPrice = convertedPrice / rateObj.rate;
//       } else if (currency === "KYG") {
//         convertedPrice = convertedPrice / rateObj.kyg;
//       }
//       totalAmountUSD += convertedPrice;
//     }

//     let remainingAmount = totalAmountUSD;

//     if (paymentHistory.length > 0) {
//       const { amount, currency } = paymentHistory[0];

//       let paidUSD = amount;
//       if (currency === "SUM") {
//         paidUSD = amount / rateObj.rate;
//       } else if (currency === "KYG") {
//         paidUSD = amount / rateObj.kyg;
//       }

//       remainingAmount = parseFloat((totalAmountUSD - paidUSD).toFixed(2));
//     }

//     const newDebt = new Debt({
//       clientId,
//       partnerId,
//       products,
//       dueDate,
//       totalAmount: parseFloat(totalAmountUSD.toFixed(2)),
//       remainingAmount,
//       paymentHistory,
//       paymentMethod: "credit",
//     });

//     await newDebt.save();

//     res.status(201).json(newDebt);
//   } catch (error) {
//     console.error("createDebt error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

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

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Mahsulotlar kerak" });
    }

    const rateObj = await Rate.findOne();
    if (!rateObj) {
      return res.status(400).json({ message: "Kurslar topilmadi" });
    }

    let totalAmount = 0;
    let totalDiscount = 0;
    const preparedProducts = [];

    for (const item of products) {
      const {
        productId,
        warehouseId,
        quantity,
        discount,
        sellingPrice,
        unit,
        currency,
        promokodId: productPromoId,
      } = item;

      if (
        !productId ||
        !quantity ||
        !sellingPrice ||
        !warehouseId ||
        !currency ||
        !unit
      ) {
        return res
          .status(400)
          .json({ message: "Barcha maydonlar to‘ldirilishi kerak" });
      }

      const product = await Product.findById(productId);
      if (!product)
        return res
          .status(404)
          .json({ message: `Mahsulot topilmadi: ${productId}` });

      product.box_quantity -= (
        quantity /
        product.package_quantity_per_box /
        product.quantity_per_package
      ).toFixed(2);

      if (product.isPackage) {
        product.package_quantity -= quantity / product.quantity_per_package;
      }

      product.quantity -= quantity;

      product.total_kg -= parseFloat(
        (
          (unit === "box_quantity"
            ? quantity /
              product.package_quantity_per_box /
              (product.isPackage ? product.quantity_per_package : 1)
            : unit === "package_quantity"
            ? product.isPackage
              ? quantity / product.quantity_per_package
              : 0
            : unit === "quantity"
            ? quantity
            : 0) *
          (unit === "quantity"
            ? product.kg_per_quantity
            : unit === "package_quantity"
            ? product.isPackage
              ? product.kg_per_package
              : 0
            : product.kg_per_box)
        ).toFixed(2)
      );

      await product.save();

      let productTotal = quantity * sellingPrice;
      let productDiscount = 0;

      let convertedPrice = productTotal;
      if (currency === "SUM") convertedPrice /= rateObj.rate;
      else if (currency === "KYG") convertedPrice /= rateObj.kyg;

      if (productPromoId) {
        const promo = await Promo.findById(productPromoId);
        if (promo && promo.promo_type === "product") {
          if (promo.type === "percent") {
            productDiscount = (convertedPrice * promo.percent) / 100;
            convertedPrice = convertedPrice - productDiscount;
          } else if (promo.type === "amount") {
            productDiscount = promo.amount;
            convertedPrice = convertedPrice - productDiscount;
          }
        }
      }

      totalAmount += convertedPrice;
      totalDiscount += productDiscount;

      preparedProducts.push({
        productId,
        warehouseId,
        quantity,
        discount,
        unit,
        sellingPrice,
        currency,
        promokodId: productPromoId || null,
        totalAmount: parseFloat(convertedPrice.toFixed(2)),
        totalDiscount: parseFloat(productDiscount.toFixed(2)),
      });
    }

    if (promokodId) {
      const overallPromo = await Promo.findById(promokodId);
      if (overallPromo && overallPromo.promo_type === "overall") {
        if (overallPromo.type === "percent") {
          const promoDiscount = (totalAmount * overallPromo.percent) / 100;
          totalAmount -= promoDiscount;
          totalDiscount += promoDiscount;
        } else if (overallPromo.type === "amount") {
          const promoDiscount =
            overallPromo.currency === "SUM"
              ? overallPromo.amount / rateObj.rate
              : overallPromo.currency === "KYG"
              ? overallPromo.amount / rateObj.kyg
              : overallPromo.amount;
          totalAmount -= promoDiscount;
          totalDiscount += promoDiscount;
        }
      }
    }

    let remainingAmount = totalAmount;
    if (paymentHistory.length > 0) {
      const { amount, currency } = paymentHistory[0];
      let paid = amount;
      if (currency === "SUM") paid /= rateObj.rate;
      else if (currency === "KYG") paid /= rateObj.kyg;
      remainingAmount = totalAmount - paid;
    }

    const newDebt = new Debt({
      clientId,
      partnerId,
      products: preparedProducts,
      dueDate,
      promokodId: promokodId || null,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      remainingAmount: parseFloat(remainingAmount.toFixed(2)),
      paymentHistory,
      paymentMethod: "credit",
    });

    await newDebt.save();

    res.status(201).json(newDebt);
  } catch (error) {
    console.error("createDebt error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDebtsByClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const debts = await Debt.find({ clientId })
      .populate("productId")
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
    const rateObj = await Rate.findOne(); // Valyuta kursini to‘g‘ri olish

    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!rateObj || isNaN(rateObj.rate)) {
      return res.status(400).json({ message: "Invalid exchange rate" });
    }

    const rate = rateObj.rate; // Endi `rate` son bo‘ladi

    debt.paymentHistory.push({ amount, currency, storeId, type });

    if (debt.currency === currency) {
      debt.remainingAmount -= amount;
    } else if (debt.currency === "USD" && currency === "SUM") {
      debt.remainingAmount -= amount / rate;
    } else if (debt.currency === "SUM" && currency === "USD") {
      debt.remainingAmount -= amount * rate;
    } else {
      debt.remainingAmount -= amount;
    }
    const client = debt.clientId ? await Client.findById(debt.clientId) : null;
    if (debt.remainingAmount <= 0) {
      debt.status = "paid";
      debt.remainingAmount = 0;

      await Sale.create({
        clientId: debt.clientId,
        productId: debt.productId,
        quantity: debt.quantity,
        clientAddress: client?.address || "Unknown",
        unit: debt.unit,
        storeId,
        sellingPrice: debt.sellingPrice,
        warehouseId: debt.warehouseId,
        totalAmount: debt.totalAmount,
        currency: debt.currency,
        discount: debt.discount,
        paymentMethod: debt.paymentMethod,
        payment: {
          usd: debt?.paymentHistory
            ?.filter((p) => p.currency === "USD")
            ?.reduce((a, b) => a + b?.amount, 0),
          sum: debt?.paymentHistory
            ?.filter((p) => p.currency === "SUM")
            ?.reduce((a, b) => a + b?.amount, 0),
        },
      });
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
      .populate("productId")
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
