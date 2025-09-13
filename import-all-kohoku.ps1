# import-all-kohoku.ps1
# 港北区データ300件を自動投入

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "港北区データ300件投入開始" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$startTime = Get-Date
$successCount = 0
$errorCount = 0

# 2から300まで（1は既に投入済み）
for ($i = 2; $i -le 300; $i++) {
    $num = $i.ToString("000")
    $posterNum = "kohoku-01-$num"
    
    # ボードタイプを順番に割り当て
    $boardTypes = @("A0", "A1", "A2")
    $board = $boardTypes[$i % 3]
    
    # ステータスを分散
    if ($i -le 200) {
        $status = "notStarted"
    } elseif ($i -le 250) {
        $status = "inProgress"
    } elseif ($i -le 290) {
        $status = "completed"
    } else {
        $status = "removed"
    }
    
    # JSONを作成（エスケープ処理済み）
    $json = "{`\`"pk`\`":{`\`"S`\`":`\`"POSTER`\`"},`\`"sk`\`":{`\`"S`\`":`\`"$posterNum`\`"},`\`"posterNumber`\`":{`\`"S`\`":`\`"$posterNum`\`"},`\`"district`\`":{`\`"S`\`":`\`"港北区`\`"},`\`"address`\`":{`\`"S`\`":`\`"港北区新横浜$i`\`"},`\`"boardType`\`":{`\`"S`\`":`\`"$board`\`"},`\`"area`\`":{`\`"S`\`":`\`"横浜北`\`"},`\`"status`\`":{`\`"S`\`":`\`"$status`\`"},`\`"createdAt`\`":{`\`"S`\`":`\`"2025-08-24`\`"},`\`"location`\`":{`\`"S`\`":`\`"投票区$i`\`"},`\`"number`\`":{`\`"N`\`":`\`"$i`\`"}}"
    
    # CMDコマンドとして実行（エラー出力を抑制）
    $command = "aws dynamodb put-item --table-name yokohama-posters --item `"$json`" --region ap-northeast-1 2>nul"
    
    try {
        cmd /c $command
        $successCount++
        
        # 進捗表示（10件ごと）
        if ($i % 10 -eq 0) {
            $percent = [math]::Round(($i / 300) * 100, 1)
            Write-Host "[$percent%] $i/300件 完了" -ForegroundColor Green
        }
    } catch {
        $errorCount++
        Write-Host "❌ エラー: $posterNum" -ForegroundColor Red
    }
    
    # AWS APIのレート制限を避けるため、少し待機（必要に応じて調整）
    if ($i % 25 -eq 0) {
        Start-Sleep -Milliseconds 500
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 投入完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "成功: $successCount件" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "エラー: $errorCount件" -ForegroundColor Red
}
Write-Host "処理時間: $($duration.TotalSeconds)秒" -ForegroundColor Yellow
Write-Host ""

# 最終確認
Write-Host "データ総数を確認中..." -ForegroundColor Yellow
aws dynamodb scan --table-name yokohama-posters --select COUNT --region ap-northeast-1