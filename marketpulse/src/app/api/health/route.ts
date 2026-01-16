// ============================================
// Health Check API Endpoint
// ============================================
// Used by Docker, load balancers, and monitoring tools
// to verify application health

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Disable caching for health checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
    memory: {
      status: 'ok' | 'warning' | 'error';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  
  // Basic health info
  const healthData: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: 'ok',
      },
      memory: {
        status: 'ok',
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  // Check database connection
  try {
    const dbStartTime = Date.now();
    const client = await clientPromise;
    await client.db().admin().ping();
    
    healthData.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStartTime,
    };
  } catch (error) {
    healthData.status = 'unhealthy';
    healthData.checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal;
  const usedMemory = memUsage.heapUsed;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  healthData.checks.memory = {
    status: memoryPercentage > 90 ? 'error' : memoryPercentage > 75 ? 'warning' : 'ok',
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: memoryPercentage,
  };

  // Determine overall health status
  if (healthData.checks.database.status === 'error' || healthData.checks.memory.status === 'error') {
    healthData.status = 'unhealthy';
  }

  // Return appropriate HTTP status
  const httpStatus = healthData.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthData, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}

// HEAD request for basic health check (faster, no body)
export async function HEAD() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
