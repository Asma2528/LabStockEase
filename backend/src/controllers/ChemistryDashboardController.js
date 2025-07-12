const StockNotificationService = require("../services/stockNotification.service");
const Chemicals = require("../models/chemicals.models");
const ChemicalsRestock = require("../models/chemicals.restock.models");
const Consumables = require("../models/consumables.models");
const ConsumablesRestock = require("../models/consumables.restock.models");
const Others = require("../models/others.models");
const OthersRestock = require("../models/others.restock.models");
const Equipments = require("../models/equipments.models");
const EquipmentsRestock = require("../models/equipments.restock.models");
const Glasswares = require("../models/glasswares.models");
const Books = require("../models/books.models");

// Helper function to calculate total count and quantity of all items
const getTotalCountAndQuantity = async (model) => {
    const totalCount = await model.countDocuments();
    const totalQuantity = await model.aggregate([
        { $group: { _id: null, total: { $sum: "$current_quantity" } } }
    ]);
    return {
        totalCount,
        totalQuantity: totalQuantity[0] ? totalQuantity[0].total : 0
    };
};

// Helper function to calculate stock summaries
const getStockSummary = async (model) => {
    const lowStock = await model.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { $lt: ["$current_quantity", "$min_stock_level"] },
                        { $ne: ["$current_quantity", 0] }
                    ]
                }
            }
        },
        { $count: "count" }
    ]);

    const zeroStock = await model.countDocuments({ current_quantity: 0 });

    return {
        lowStock,
        zeroStock,
    };
};

// Helper function to get in-stock products count
const getInStockSummary = async (model) => {
    const inStockCountResult = await model.aggregate([
        {
            $match: {
                $expr: { $gt: ["$current_quantity", "$min_stock_level"] }
            }
        },
        { $count: "count" }
    ]);
    return inStockCountResult[0]?.count || 0;
};

// Helper function to get near-expiry and expired counts
const getExpirySummary = async (model) => {
    if (!model) return { nearExpiryCount: 0, expiredCount: 0 }; 

    const nearExpiryCount = await model.countDocuments({
        expiration_alert_date: { $ne: null, $lte: new Date() },
        expiration_date: { $ne: null, $gt: new Date() }
    });

    const expiredCount = await model.countDocuments({
        expiration_date: { $ne: null, $lt: new Date() }
    });

    return { nearExpiryCount, expiredCount };
};


// Helper function to get item details based on a condition
const getItemsDetail = async (model, condition) => {
    return await model.find(condition).exec();
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const [
    chemicalsSummary, consumablesSummary, othersSummary,
    equipmentsSummary, glasswaresSummary, booksSummary
] = await Promise.all([
    getTotalCountAndQuantity(Chemicals),
    getTotalCountAndQuantity(Consumables),
    getTotalCountAndQuantity(Others),
    getTotalCountAndQuantity(Equipments),
    getTotalCountAndQuantity(Glasswares),
    getTotalCountAndQuantity(Books)
]);


        // Get stock summaries
        const chemicalsStock = await getStockSummary(Chemicals);
        const consumablesStock = await getStockSummary(Consumables);
        const othersStock = await getStockSummary(Others);
        const equipmentsStock = await getStockSummary(Equipments);
        const glasswaresStock = await getStockSummary(Glasswares);
        const booksStock = await getStockSummary(Books);

        // Get expiry summaries (only for Chemicals and Consumables)
        const chemicalsExpiry = await getExpirySummary(ChemicalsRestock);
        const consumablesExpiry = await getExpirySummary(ConsumablesRestock);
        const othersExpiry = await getExpirySummary(OthersRestock);
        const equipmentsExpiry = await getExpirySummary(EquipmentsRestock);
        
        // Get in-stock summaries
        const chemicalsInStock = await getInStockSummary(Chemicals);
        const consumablesInStock = await getInStockSummary(Consumables);
        const othersInStock = await getInStockSummary(Others);
        const equipmentsInStock = await getInStockSummary(Equipments);
        const glasswaresInStock = await getInStockSummary(Glasswares);
        const booksInStock = await getInStockSummary(Books);

        // Aggregate total values
        const inStockCount =
            chemicalsInStock + consumablesInStock + othersInStock + equipmentsInStock + glasswaresInStock + booksInStock;

        const lowStockCount =
            (chemicalsStock.lowStock[0]?.count || 0) +
            (consumablesStock.lowStock[0]?.count || 0) +
            (othersStock.lowStock[0]?.count || 0) +
            (equipmentsStock.lowStock[0]?.count || 0) +
            (glasswaresStock.lowStock[0]?.count || 0) +
            (booksStock.lowStock[0]?.count || 0);

            const nearExpiryCount =
            chemicalsExpiry.nearExpiryCount +
            consumablesExpiry.nearExpiryCount +
            othersExpiry.nearExpiryCount +
            equipmentsExpiry.nearExpiryCount;
        
        const expiredItemsCount =
            chemicalsExpiry.expiredCount +
            consumablesExpiry.expiredCount +
            othersExpiry.expiredCount +
            equipmentsExpiry.expiredCount;
        
        const zeroStockCount =
            chemicalsStock.zeroStock +
            consumablesStock.zeroStock +
            othersStock.zeroStock +
            equipmentsStock.zeroStock +
            glasswaresStock.zeroStock +
            booksStock.zeroStock;


        // Fetch detailed low-stock items
        const lowStockItems = [
            ...(await getItemsDetail(Chemicals, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } })),
            ...(await getItemsDetail(Consumables, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } })),
            ...(await getItemsDetail(Others, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } })),
            ...(await getItemsDetail(Equipments, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } })),
            ...(await getItemsDetail(Glasswares, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } })),
            ...(await getItemsDetail(Books, { $expr: { $and: [{ $lt: ["$current_quantity", "$min_stock_level"] }, { $ne: ["$current_quantity", 0] }] } }))
        ];

        // Fetch detailed near-expiry items
        const nearExpiryItems = [
            ...(await ChemicalsRestock.find({ expiration_alert_date: { $lte: new Date() }, expiration_date: { $gt: new Date() } })
                .populate({ path: 'chemical', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await ConsumablesRestock.find({ expiration_alert_date: { $lte: new Date() }, expiration_date: { $gt: new Date() } })
                .populate({ path: 'consumable', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await EquipmentsRestock.find({ expiration_alert_date: { $lte: new Date() }, expiration_date: { $gt: new Date() } })
                .populate({ path: 'equipment', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await OthersRestock.find({ expiration_alert_date: { $lte: new Date() }, expiration_date: { $gt: new Date() } })
                .populate({ path: 'other', select: 'item_name item_code total_quantity current_quantity min_stock_level' }))
        ];
        

        // Fetch detailed out-of-stock items
        const outOfStockItems = [
            ...(await getItemsDetail(Chemicals, { current_quantity: 0 })),
            ...(await getItemsDetail(Consumables, { current_quantity: 0 })),
            ...(await getItemsDetail(Others, { current_quantity: 0 })),
            ...(await getItemsDetail(Equipments, { current_quantity: 0 })),
            ...(await getItemsDetail(Glasswares, { current_quantity: 0 })),
            ...(await getItemsDetail(Books, { current_quantity: 0 }))
        ];

        // Fetch detailed expired items
        const expiredItems = [
            ...(await ChemicalsRestock.find({ expiration_date: { $lt: new Date() } })
                .populate({ path: 'chemical', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await ConsumablesRestock.find({ expiration_date: { $lt: new Date() } })
                .populate({ path: 'consumable', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await OthersRestock.find({ expiration_date: { $lt: new Date() } })
                .populate({ path: 'other', select: 'item_name item_code total_quantity current_quantity min_stock_level' })),
            ...(await EquipmentsRestock.find({ expiration_date: { $lt: new Date() } })
                .populate({ path: 'equipment', select: 'item_name item_code total_quantity current_quantity min_stock_level' }))
        ];
        
        

        // Calculate total items and total quantity across all models
        const totalItemsCount =
            chemicalsSummary.totalCount +
            consumablesSummary.totalCount +
            othersSummary.totalCount +
            equipmentsSummary.totalCount +
            glasswaresSummary.totalCount +
            booksSummary.totalCount;

        const totalItemsQuantity =
            chemicalsSummary.totalQuantity +
            consumablesSummary.totalQuantity +
            othersSummary.totalQuantity +
            equipmentsSummary.totalQuantity +
            glasswaresSummary.totalQuantity +
            booksSummary.totalQuantity;
        

        // Handle expiry notifications for Chemicals and Consumables
        const restocks = [
            ...(await ChemicalsRestock.find().populate('chemical')),
            ...(await ConsumablesRestock.find().populate('consumable')),
            ...(await OthersRestock.find().populate('other')),
            ...(await EquipmentsRestock.find().populate('equipment'))
        ];
        

      await Promise.all(restocks.map(async (restock) => {
  const { expiration_date, expiration_alert_date, _id, current_quantity } = restock;
  const item = restock.chemical || restock.consumable || restock.other || restock.equipment;
  if (!item) return;

  const { item_name, item_code } = item;

  const [nearExpiryNotification, expiredNotification] = await Promise.all([
      StockNotificationService.findOne({ itemId: _id, type: "near_expiry" }),
      StockNotificationService.findOne({ itemId: _id, type: "expired" }),
  ]);

  if (current_quantity === 0) {
      if (nearExpiryNotification) await StockNotificationService.deleteNotification(nearExpiryNotification._id);
      if (expiredNotification) await StockNotificationService.deleteNotification(expiredNotification._id);
      return;
  }

  const now = new Date();

  if (expiration_alert_date <= now && expiration_date > now && !nearExpiryNotification) {
      await StockNotificationService.createNotification({
          itemId: _id,
          title: `Near Expiry Alert: ${item_name} (${item_code})`,
          message: `The stock for ${item_name} is nearing its expiration date.`,
          send_to: ["admin", "lab-assistant"],
          type: "near_expiry",
          expiresAt: expiration_date,
      });
  }

  if (expiration_date <= now && !expiredNotification) {
      await StockNotificationService.createNotification({
          itemId: _id,
          title: `Expired Item Alert: ${item_name} (${item_code})`,
          message: `The stock for ${item_name} has expired.`,
          send_to: ["admin", "lab-assistant"],
          type: "expired",
          expiresAt: expiration_date,
      });
  }
}));

            
        

        // Send final JSON response
        res.status(200).json({
            chemicalsSummary,
            consumablesSummary,
            othersSummary,
            equipmentsSummary,
            glasswaresSummary,
            booksSummary,
            totalItemsCount,
            totalItemsQuantity,
            lowStockCount,
            nearExpiryCount,
            zeroStockCount,
            inStockCount,
            expiredItemsCount,
            outOfStockItemsCount: zeroStockCount,
            lowStockItems,
            nearExpiryItems,
            expiredItems,
            outOfStockItems,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
    }
};
