#!/bin/bash
# ==============================================================================
# AETHRAVIA - MONGODB ATLAS TO LOCAL MONGODB MIGRATION SCRIPT
# ==============================================================================

# Ensure you have 'mongodatabase-tools' installed on your system.
# On Mac: brew tap mongodb/brew && brew install mongodb-database-tools
# On Ubuntu: sudo apt install mongodb-org-tools

REMOTE_URI="mongodb+srv://heukcare_db_user:D4Jsnep56SHcnK9O@cluster0.bghvakr.mongodb.net/aetheravia?appName=Cluster0"
LOCAL_URI="mongodb://admin:securepassword123@localhost:27018/aetheravia?authSource=admin"
DUMP_DIR="./mongo_dump_temp"

echo "========================================="
echo " Starting Database Migration..."
echo "========================================="

echo "1. Dumping data from MongoDB Atlas..."
mkdir -p $DUMP_DIR
mongodump --uri="$REMOTE_URI" --out="$DUMP_DIR"

if [ $? -eq 0 ]; then
    echo "✓ Dump completed successfully."
else
    echo "❌ Error during mongodump."
    exit 1
fi

echo "2. Restoring data to Local VPS MongoDB container..."
mongorestore --uri="$LOCAL_URI" --drop "$DUMP_DIR/aetheravia"

if [ $? -eq 0 ]; then
    echo "✓ Restore completed successfully."
else
    echo "❌ Error during mongorestore."
    exit 1
fi

echo "3. Cleaning up temporary files..."
rm -rf "$DUMP_DIR"

echo "========================================="
echo " Migration Complete!"
echo " Remember to update MONGODB_URI in your VPS .env file to:"
echo " $LOCAL_URI"
echo "========================================="
