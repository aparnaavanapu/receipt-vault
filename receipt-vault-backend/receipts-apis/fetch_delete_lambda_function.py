import json
import os
import boto3

from decimal import Decimal
from boto3.dynamodb.conditions import Key
from botocore.config import Config
from datetime import datetime, timezone


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])
session = boto3.session.Session(region_name="ap-south-2")

s3 = session.client(
    "s3",
    endpoint_url="https://s3.ap-south-2.amazonaws.com",
    config=Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual",
            "use_accelerate_endpoint": False
        }
    )
)
print(s3.meta.region_name)
print(s3.meta.endpoint_url)

THUMBNAIL_BUCKET = os.environ["THUMBNAIL_BUCKET"]
STORAGE_BUCKET = os.environ["STORAGE_BUCKET"]


def decimal_default(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    raise TypeError


def lambda_handler(event, context):

    method = event["requestContext"]["http"]["method"]
    user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]

    # ==========================
    # GET /receipts
    # ==========================
    if method == "GET":

        params = event.get("queryStringParameters") or {}

        from_date = params.get("from")
        to_date = params.get("to")

        print("Query Params:", params)
        print("From:", from_date)
        print("To:", to_date)

        response = table.query(
            KeyConditionExpression=Key("userId").eq(user_id)
        )

        items = response.get("Items", [])

        items = [ item for item in items
                if item.get("status") == "COMPLETED"
            ]
        print("Total items before filter:", len(items))

        if from_date or to_date:
            filtered_items = []
            from_dt = datetime.strptime(from_date, "%Y-%m-%d").date() if from_date else None
            to_dt = datetime.strptime(to_date, "%Y-%m-%d").date() if to_date else None

            for item in items:
                print("createdAt:", item["createdAt"])
                created_date = datetime.fromisoformat(item["createdAt"]).date()
                print("created_date:", created_date)
                if from_dt and created_date < from_dt:
                    continue
                if to_dt and created_date > to_dt:
                    continue

                filtered_items.append(item)

            items = filtered_items
            print("Total items after filter:", len(items))

        for item in items:
            if item.get("status") == "COMPLETED":

                item["thumbnailUrl"] = s3.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": THUMBNAIL_BUCKET,
                        "Key": item["thumbnailKey"]
                    },
                    ExpiresIn=3600
                )

                item["originalUrl"] = s3.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": STORAGE_BUCKET,
                        "Key": item["originalKey"]
                    },
                    ExpiresIn=3600
                )
            

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(items, default=decimal_default)
        }

    # ==========================
    # DELETE /receipts/{receiptId}
    # ==========================
    elif method == "DELETE":

        receipt_id = event["pathParameters"]["receiptId"]
        now = datetime.now(timezone.utc)
        deleted_at = now.isoformat()
        expires_at = int(now.timestamp()) + 3600

        table.update_item(
            Key={
                "userId": user_id,
                "receiptId": receipt_id
            },
            UpdateExpression="""
                SET #status = :status,
                deletedAt = :deletedAt,
                expiresAt = :expiresAt
            """,
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": "DELETED",
                ":deletedAt": deleted_at,
                ":expiresAt": expires_at
            },
            ConditionExpression="attribute_exists(receiptId)"
        )

        return {
            "statusCode": 204,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": ""
        }

    # ==========================
    # Unsupported Method
    # ==========================
    else:
        return {
            "statusCode": 405,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "Method Not Allowed"
            })
        }