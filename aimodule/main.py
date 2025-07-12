from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.decomposition import TruncatedSVD
from datetime import datetime
from bson import ObjectId

app = FastAPI()
client = MongoClient("mongodb://localhost:27017")
db = client["CollegeLabStockEase"]

origins = ["*"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# ------------ CONFIG ------------
INVENTORY_CLASSES = {
    "Chemicals": "chemistrychemicals",
    "Consumables": "chemistryconsumables",
    "Equipments": "chemistryequipments",
    "Books": "chemistrybooks",
    "Glasswares": "chemistryglasswares",
    "Others": "chemistryothers"
}
RESTOCK_COLLECTIONS = {
    "Chemicals": "chemistrychemicalsrestocks",
    "Consumables": "chemistryconsumablesrestocks",
    "Equipments": "chemistryequipmentsrestocks",
    "Books": "chemistrybooksrestocks",
    "Others": "chemistryothersrestocks"
}
REQUI_COLLECTION = "requisitions"
# --------------------------------


from bson import ObjectId

def get_item_id_by_code(item_code: str):
    collections = [
        "chemistrychemicals",
        "chemistryglasswares",
        "chemistryequipments",
        "chemistryconsumables",
        "chemistrybooks",
        "chemistryothers"
    ]
    for col in collections:
        item = db[col].find_one({"item_code": item_code})
        if item:
            return item["_id"]
    return None


@app.get("/forecast/{item_code}")
@app.get("/forecast/{item_code}")
def forecast_demand(item_code: str):
    item_id = get_item_id_by_code(item_code)
    if not item_id:
        return {"error": "Item not found"}

    requisitions = list(db[REQUI_COLLECTION].find({"items.item": item_id}))
    
    records = []
    for req in requisitions:
        for item in req["items"]:
            if item.get("item") == item_id and "quantity_required" in item:
                records.append({
                    "date": pd.to_datetime(req["date_of_requirement"]),
                    "quantity": item["quantity_required"],
                    "unit_of_measure": item.get("unit_of_measure", "")
                })

    if not records:
        return {"message": "No data available"}
    
    df = pd.DataFrame(records)
    df = df.groupby(df["date"].dt.to_period("M"))["quantity"].sum().reset_index()
    df["date"] = df["date"].dt.to_timestamp()
    df["month_num"] = range(len(df))

    model = LinearRegression()
    model.fit(df[["month_num"]], df["quantity"])
    next_month = len(df)
    forecast = model.predict([[next_month]])

    return {
        "item_code": item_code,
        "forecast_month": (df["date"].max() + pd.DateOffset(months=1)).strftime("%Y-%m"),
        "predicted_quantity": round(float(forecast[0]), 2),
        "unit_of_measure": records[0]["unit_of_measure"]
    }


@app.get("/user-suggestions/{email}")
def user_suggestions(email: str):
    user = db["users"].find_one({"email": email})
    if not user:
        return {"error": "User not found"}
    
    uid = user["_id"]
    requisitions = db[REQUI_COLLECTION].find({"requested_by": uid})
    item_counts = {}

    for r in requisitions:
        for item in r.get("items", []):
            item_id = item.get("item")
            class_name = item.get("class")
            if item_id and class_name:
                key = (str(item_id), class_name)
                item_counts[key] = item_counts.get(key, 0) + 1

    sorted_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)
    suggestions = []

    for (item_id, class_name), count in sorted_items[:5]:
        collection_name = INVENTORY_CLASSES.get(class_name)
        if collection_name:
            record = db[collection_name].find_one({"_id": ObjectId(item_id)})
            if record:
                suggestions.append({
                    "item_name": record.get("item_name", "Unknown"),
                    "class": class_name,
                    "times_requested": count
                })

    return {"user": email, "suggested_items": suggestions}



@app.get("/expiry-risk")
def expiry_risk():
    today = datetime.now()
    risk_data = []
    for cls, col in RESTOCK_COLLECTIONS.items():
        restocks = list(db[col].find({}))
        for r in restocks:
            if "expiration_date" in r:
                exp = r["expiration_date"]
                days_left = (exp - today).days
                if days_left <= 5:
                    r["class"] = cls
                    r["days_to_expiry"] = days_left
                    r["_id"] = str(r["_id"])
                    risk_data.append(r)

    return {"risk_items": risk_data}


@app.get("/reorder-recommendations")
def reorder_recommendations():
    data = []
    for cls, col in INVENTORY_CLASSES.items():
        items = db[col].find({})
        for item in items:
            if item.get("current_quantity", 0) <= item.get("min_stock_level", 0):
                item["class"] = cls
                item["_id"] = str(item["_id"])
                data.append(item)
    return {"reorder_recommendations": data}


import math
import pandas as pd
from fastapi import APIRouter
from bson import ObjectId

@app.get("/risk-items")
def risk_items():
    all_items = []
    for cls, col in INVENTORY_CLASSES.items():
        records = list(db[col].find({}))
        for rec in records:
            rec["class"] = cls
            rec["stock_diff"] = rec.get("min_stock_level", 0) - rec.get("current_quantity", 0)
            rec["_id"] = str(rec["_id"])  # Ensure ObjectId is serializable
            all_items.append(rec)

    df = pd.DataFrame(all_items)
    if df.empty:
        return {"low_stock": [], "anomalies": []}

    # Avoid std = 0 issue
    std_val = df["stock_diff"].std()
    if pd.isna(std_val) or std_val == 0:
        df["anomaly_score"] = 0
    else:
        df["anomaly_score"] = (df["stock_diff"] - df["stock_diff"].mean()) / std_val

    # Replace NaN, inf, -inf with 0 to make JSON serializable
    df.replace([float("inf"), float("-inf")], 0, inplace=True)
    df.fillna(0, inplace=True)

    # Extract anomalies and low stock
    anomalies = df[df["anomaly_score"] > 1.5]
    low_stock = df[df["current_quantity"] <= df["min_stock_level"]]

    # Drop anomaly_score from low_stock to reduce clutter
    return {
        "low_stock": low_stock.drop(columns=["anomaly_score"], errors="ignore").to_dict(orient="records"),
        "anomalies": anomalies.to_dict(orient="records")
    }

