// Configuration for events storage
export interface EventsConfig {
  useFileSystem: boolean;
  useInMemory: boolean;
  useExternalStorage: boolean;
}

export function getEventsConfig(): EventsConfig {
  const isVercel = process.env.VERCEL === '1';
  const isAWS = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  const isProduction = process.env.NODE_ENV === 'production';
  // Only use serverless mode for actual serverless platforms, not just production
  const isServerless = isVercel || isAWS;

  return {
    useFileSystem: !isServerless,
    useInMemory: isServerless,
    useExternalStorage: false // Can be enabled later for database integration
  };
}

// Default events for serverless environments
export const DEFAULT_EVENTS = [
  {
    id: 'default-1',
    title: 'Monthly Club Meeting',
    description: 'Join us for our monthly club meeting to discuss upcoming events and club business.',
    start: new Date('2024-12-15T19:00:00'),
    durationMinutes: 120
  },
  {
    id: 'default-2',
    title: 'Hunting Season Kickoff',
    description: 'Celebrate the start of hunting season with food, drinks, and planning sessions.',
    start: new Date('2024-12-20T18:00:00'),
    durationMinutes: 180
  },
  {
    id: 'default-3',
    title: 'Annual Club Banquet',
    description: 'Our annual celebration with awards, dinner, and entertainment for all members.',
    start: new Date('2025-01-25T17:00:00'),
    durationMinutes: 240
  }
];
