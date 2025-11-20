# ===================== Basic Configuration =====================
# Adjust these values to your real case
$tableName   = "metrics-test"
$endpointUrl = "http://localhost:8000"

# Set to $true to save read items to a file (items.json)
$saveItemsToFile = $true 

$keyCondition = "PK = :pk AND begins_with(SK, :skPrefix)"

# Values for the expression 
$values = @{
    ":pk"       = @{ S = "P#34nLQz9slVUWY1lClbloGKQc7ZJ" }
    ":skPrefix" = @{ S = "M" }
} | ConvertTo-Json -Compress

# ===================== Query + RCU + Item Collection =====================

$rcuTotal  = 0
$lastKey   = $null
$allItems  = @()

do {
    $args = @(
        "--table-name", $tableName,
        "--endpoint-url", $endpointUrl,
        "--key-condition-expression", $keyCondition,
        "--expression-attribute-values", $values,
        "--return-consumed-capacity", "TOTAL",
        "--output", "json"
    )

    if ($lastKey) {
        $args += @("--exclusive-start-key", ($lastKey | ConvertTo-Json -Compress))
    }

    # Execute the query
    $page = aws dynamodb query @args | ConvertFrom-Json -AsHashTable

    # Accumulate RCU for this page (if Dynamo returns ConsumedCapacity)
    if ($page.ContainsKey("ConsumedCapacity") -and $page["ConsumedCapacity"]) {
        $rcuPage = $page["ConsumedCapacity"]["CapacityUnits"]
        $rcuTotal += $rcuPage
    }

    # Accumulate items
    if ($page.ContainsKey("Items") -and $page["Items"]) {
        $allItems += $page["Items"]
    }

    # Pagination
    $lastKey = $page["LastEvaluatedKey"]

} while ($lastKey)

"================ READ RESULTS ================"
"Total RCU for the Query: $rcuTotal"
"Total items read: $($allItems.Count)"
""


# ===================== Saving items =====================

if ($saveItemsToFile) {
    $allItems | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 "items.json"
    "items.json saved with $($allItems.Count) items."
    ""
}


# ===================== WCU Calculation per Item =====================

$itemsWcu = @()

foreach ($item in $allItems) {
    # Serialize the item to compact JSON to estimate size
    $json  = $item | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetByteCount($json)

    # Estimated WCU according to the official rule: ceil(bytes / 1024)
    $wcu = [math]::Ceiling($bytes / 1024)

    # Try to extract PK/SK if they exist in Dynamo format { "S": "..." }
    $pkValue = $null
    $skValue = $null

    if ($item.ContainsKey("PK") -and $item["PK"].ContainsKey("S")) {
        $pkValue = $item["PK"]["S"]
    }
    if ($item.ContainsKey("SK") -and $item["SK"].ContainsKey("S")) {
        $skValue = $item["SK"]["S"]
    }

    $itemsWcu += [PSCustomObject]@{
        PK        = $pkValue
        SK        = $skValue
        SizeBytes = $bytes
        WCU       = $wcu
    }
}

# Total estimated WCU to rewrite all items
$totalWCU = ($itemsWcu | Measure-Object -Property WCU -Sum).Sum

"================ WRITE RESULTS (ESTIMATED) ================"
"Estimated total WCU to write all items: $totalWCU"
""

"Top items by WCU (desc):"
$itemsWcu |
    Sort-Object -Property WCU -Descending |
    Format-Table PK, SK, SizeBytes, WCU -AutoSize
