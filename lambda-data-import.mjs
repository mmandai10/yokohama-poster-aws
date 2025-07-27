// 戸塚区データ投入用Lambda関数
// 修正版：必要なインポートを追加
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, body } = event;
    
    // CORS headers
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // OPTIONS request (CORS preflight)
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    // 既存のヘルスチェック
    if (httpMethod === 'GET' && path === '/health') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.1.0',
                service: 'yokohama-poster-api',
                method: httpMethod,
                path: path
            })
        };
    }
    
    // 新機能：戸塚区データ投入
    if (httpMethod === 'POST' && path === '/data-import') {
        try {
            const requestData = JSON.parse(body);
            const { action, data } = requestData;
            
            console.log(`Action: ${action}, Data count: ${data?.length || 0}`);
            
            if (action === 'import-totsuka-data' && data && Array.isArray(data)) {
                // 戸塚区データをDynamoDBに投入
                const result = await importTotsukData(data);
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        message: '戸塚区データ投入完了',
                        imported: result.count,
                        district: '戸塚区',
                        timestamp: new Date().toISOString(),
                        details: result.details
                    })
                };
            }
            
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Invalid action or data format',
                    expectedAction: 'import-totsuka-data',
                    receivedAction: action
                })
            };
            
        } catch (error) {
            console.error('Error processing request:', error);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Internal server error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                })
            };
        }
    }
    
    // データ確認用エンドポイント
    if (httpMethod === 'GET' && path === '/data-count') {
        try {
            const params = {
                TableName: 'yokohama-posters',
                Select: 'COUNT'
            };
            
            // Note: Scan操作は実際のプロダクションでは推奨されませんが、
            // 開発/テスト環境でのデータ確認用として使用
            const result = await docClient.send(new ScanCommand(params));
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    totalItems: result.Count,
                    timestamp: new Date().toISOString()
                })
            };
        } catch (error) {
            console.error('Error getting data count:', error);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
    
    // ルートが見つからない場合
    return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ 
            error: 'Route not found',
            method: httpMethod,
            path: path,
            availableRoutes: [
                'GET /health',
                'GET /data-count', 
                'POST /data-import'
            ]
        })
    };
};

// 戸塚区データ投入関数
async function importTotsukData(data) {
    const tableName = 'yokohama-posters';
    const batchSize = 25; // DynamoDBバッチ制限
    let totalImported = 0;
    const details = [];
    
    console.log(`Starting import of ${data.length} items to ${tableName}`);
    
    // データをバッチごとに処理
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        try {
            const params = {
                RequestItems: {
                    [tableName]: batch.map(item => ({
                        PutRequest: { Item: item }
                    }))
                }
            };
            
            console.log(`Processing batch ${Math.floor(i/batchSize) + 1}, items: ${batch.length}`);
            
            await docClient.send(new BatchWriteCommand(params));
            totalImported += batch.length;
            
            details.push({
                batch: Math.floor(i/batchSize) + 1,
                items: batch.length,
                status: 'success'
            });
            
            // DynamoDBへの負荷を軽減するため少し待機
            if (i + batchSize < data.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            console.error(`Error in batch ${Math.floor(i/batchSize) + 1}:`, error);
            details.push({
                batch: Math.floor(i/batchSize) + 1,
                items: batch.length,
                status: 'error',
                error: error.message
            });
            // エラーが発生してもその他のバッチは続行
        }
    }
    
    console.log(`Import completed. Total imported: ${totalImported} out of ${data.length}`);
    
    return { 
        count: totalImported,
        total: data.length,
        details: details
    };
}