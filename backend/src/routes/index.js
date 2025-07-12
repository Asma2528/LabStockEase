const router = require("express").Router();

// Routes configuration with paths and corresponding route files
const routes = [
    {
        path: '/auth',
        route: require("./Auth.route")
    },
    {
        path: '/vendor',
        route: require("./Vendors.route")
    },
    {
        path: '/chemistry-dashboard',
        route: require("./Chemistry.dashboard.route")
    },
    {
        path: '/chemicals',
        route: require("./Chemicals.route")
    },   
    {
        path: '/consumables',
        route: require("./Consumables.route")
    },  
    {
        path: '/equipments',
        route: require("./Equipments.route")
    },  
    {
        path: '/glasswares',
        route: require("./Glasswares.route")
    },  
    {
        path: '/others',
        route: require("./Others.route")
    },  
    {
        path: '/books',
        route: require("./Books.route")
    },  
    {
        path: '/requisition', 
        route: require("./Requisition.route")
    },
    {
        path: '/order-request', 
        route: require("./Order.request.route")
    },
    {
        path: '/new-indent', 
        route: require("./New.Indent.route")
    },
    {
        path: '/notification', 
        route: require("./Notification.route")
    },
    {
        path: '/stock-notification', 
        route: require("./StockNotification.route")
    },
    {
        path: '/requisition-notification', 
        route: require("./RequisitionNotification.route")
    },
    {
        path: '/order', 
        route: require("./Order.route")
    },
    {
        path: '/project', 
        route: require("./Project.route")
    },
    {
        path: '/practical', 
        route: require("./Practical.route")
    },
    {
        path: '/general', 
        route: require("./General.route")
    },
    {
        path: '/other', 
        route: require("./Other.route")
    },
    {
        path: '/invoice', 
        route: require("./Invoice.route")
    },
    {
        path: '/inward', 
        route: require("./Inwards.route")
    }

];

// Loop through the routes and use them in the router
routes.forEach((cur) => {
    router.use(cur.path, cur.route);
});

module.exports = router;
