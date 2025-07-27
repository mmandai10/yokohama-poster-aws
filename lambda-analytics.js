import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log('Analytics API Event:', JSON.stringify(event, null, 2));
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    try {
        const path = event.path || event.rawPath;
        const method = event.httpMethod || event.requestContext?.http?.method;

        // CORS プリフライト対応
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }

        // DynamoDBからデータを取得（共通処理）
        const getAllData = async () => {
            const scanCommand = new ScanCommand({
                TableName: 'yokohama-posters'
            });
            const result = await docClient.send(scanCommand);
            return result.Items || [];
        };

        // 健康チェック
        if (path === '/analytics/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    status: 'healthy',
                    service: 'yokohama-poster-analytics',
                    timestamp: new Date().toISOString()
                })
            };
        }

        // 📊 全体統計サマリー
        if (path === '/analytics/summary' && method === 'GET') {
            const items = await getAllData();

            const summary = {
                totalPosters: items.length,
                byDistrict: {},
                byStatus: {},
                byVotingArea: {},
                completionRate: 0,
                lastUpdated: new Date().toISOString()
            };

            // 区別集計
            items.forEach(item => {
                const district = item.district || 'Unknown';
                summary.byDistrict[district] = (summary.byDistrict[district] || 0) + 1;
            });

            // ステータス別集計
            items.forEach(item => {
                const status = item.status || 'Unknown';
                summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
            });

            // 投票区別集計
            items.forEach(item => {
                const area = 区{item.votingArea || 'Unknown'};
                summary.byVotingArea[area] = (summary.byVotingArea[area] || 0) + 1;
            });

            // 完了率計算
            const completedCount = summary.byStatus['完了'] || 0;
            summary.completionRate = items.length > 0 ? 
                Math.round((completedCount / items.length) * 100 * 100) / 100 : 0;

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(summary)
            };
        }

        // 📊 区別詳細統計
        if (path === '/analytics/by-district' && method === 'GET') {
            const items = await getAllData();
            const districtStats = {};

            items.forEach(item => {
                const district = item.district || 'Unknown';
                
                if (!districtStats[district]) {
                    districtStats[district] = {
                        totalPosters: 0,
                        byStatus: {},
                        byVotingArea: {},
                        uniqueAreas: new Set(),
                        sampleLocations: []
                    };
                }

                districtStats[district].totalPosters++;
                
                const status = item.status || 'Unknown';
                districtStats[district].byStatus[status] = 
                    (districtStats[district].byStatus[status] || 0) + 1;

                const area = item.votingArea || 'Unknown';
                districtStats[district].byVotingArea[area] = 
                    (districtStats[district].byVotingArea[area] || 0) + 1;
                
                districtStats[district].uniqueAreas.add(area);

                if (districtStats[district].sampleLocations.length < 3) {
                    districtStats[district].sampleLocations.push({
                        id: item.id,
                        address: item.address,
                        location: item.location,
                        votingArea: item.votingArea
                    });
                }
            });

            Object.keys(districtStats).forEach(district => {
                const stats = districtStats[district];
                stats.uniqueAreas = Array.from(stats.uniqueAreas);
                stats.totalAreas = stats.uniqueAreas.length;
                
                const completed = stats.byStatus['完了'] || 0;
                stats.completionRate = stats.totalPosters > 0 ? 
                    Math.round((completed / stats.totalPosters) * 100 * 100) / 100 : 0;
                
                delete stats.uniqueAreas;
                stats.uniqueAreas = Array.from(new Set(Object.keys(stats.byVotingArea)));
            });

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    districts: districtStats,
                    totalDistricts: Object.keys(districtStats).length,
                    timestamp: new Date().toISOString()
                })
            };
        }

        // 📊 ステータス別統計
        if (path === '/analytics/by-status' && method === 'GET') {
            const items = await getAllData();
            const statusStats = {};

            items.forEach(item => {
                const status = item.status || 'Unknown';
                
                if (!statusStats[status]) {
                    statusStats[status] = {
                        count: 0,
                        percentage: 0,
                        byDistrict: {},
                        recentItems: []
                    };
                }

                statusStats[status].count++;
                
                const district = item.district || 'Unknown';
                statusStats[status].byDistrict[district] = 
                    (statusStats[status].byDistrict[district] || 0) + 1;

                if (statusStats[status].recentItems.length < 5) {
                    statusStats[status].recentItems.push({
                        id: item.id,
                        district: item.district,
                        votingArea: item.votingArea,
                        address: item.address,
                        createdAt: item.createdAt
                    });
                }
            });

            const total = items.length;
            Object.keys(statusStats).forEach(status => {
                statusStats[status].percentage = 
                    total > 0 ? Math.round((statusStats[status].count / total) * 100 * 100) / 100 : 0;
            });

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    statusBreakdown: statusStats,
                    totalItems: total,
                    totalStatuses: Object.keys(statusStats).length,
                    summary: {
                        completed: statusStats['完了']?.count || 0,
                        pending: statusStats['未着手']?.count || 0,
                        inProgress: statusStats['進行中']?.count || 0
                    },
                    timestamp: new Date().toISOString()
                })
            };
        }

        // 📊 投票区別統計
        if (path === '/analytics/by-area' && method === 'GET') {
            const items = await getAllData();
            const areaStats = {};

            items.forEach(item => {
                const area = item.votingArea || 'Unknown';
                
                if (!areaStats[area]) {
                    areaStats[area] = {
                        posterCount: 0,
                        districts: new Set(),
                        byStatus: {},
                        locations: []
                    };
                }

                areaStats[area].posterCount++;
                areaStats[area].districts.add(item.district || 'Unknown');
                
                const status = item.status || 'Unknown';
                areaStats[area].byStatus[status] = 
                    (areaStats[area].byStatus[status] || 0) + 1;

                if (areaStats[area].locations.length < 3) {
                    areaStats[area].locations.push({
                        address: item.address,
                        location: item.location,
                        number: item.number
                    });
                }
            });

            Object.keys(areaStats).forEach(area => {
                const stats = areaStats[area];
                stats.districts = Array.from(stats.districts);
                
                const completed = stats.byStatus['完了'] || 0;
                stats.completionRate = stats.posterCount > 0 ? 
                    Math.round((completed / stats.posterCount) * 100 * 100) / 100 : 0;
            });

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    areas: areaStats,
                    totalAreas: Object.keys(areaStats).length,
                    averagePostersPerArea: Object.keys(areaStats).length > 0 ? 
                        Math.round(items.length / Object.keys(areaStats).length * 100) / 100 : 0,
                    timestamp: new Date().toISOString()
                })
            };
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Analytics endpoint not found',
                availableEndpoints: [
                    'GET /analytics/health',
                    'GET /analytics/summary',
                    'GET /analytics/by-district',
                    'GET /analytics/by-status',
                    'GET /analytics/by-area'
                ],
                requestedPath: path
            })
        };

    } catch (error) {
        console.error('Analytics API Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                service: 'yokohama-poster-analytics'
            })
        };
    }
};
