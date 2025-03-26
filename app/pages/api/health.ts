import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
};

/**
 * Health Check API Endpoint
 * Simple endpoint to check if the API is running and its current status
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Basic application info
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const environment = process.env.NODE_ENV || 'development';
  const uptime = process.uptime();
  
  // Return health status
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
    environment,
    uptime,
  });
}
