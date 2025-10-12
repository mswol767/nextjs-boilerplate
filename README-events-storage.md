# Events Storage Solution

## Problem
The original events API was trying to write to the file system using `fs.writeFile()`, which fails in serverless environments (like Vercel, AWS Lambda) because they have read-only file systems. This caused the error:

```
EROFS: read-only file system, open '/var/task/data/events.json'
```

## Solution
Implemented a hybrid storage system that automatically detects the environment and uses the appropriate storage method:

### Local Development
- **Storage**: File system (`data/events.json`)
- **Behavior**: Events are persisted to disk and survive server restarts
- **Detection**: When `NODE_ENV !== 'production'` and not in Vercel/AWS Lambda

### Production/Serverless
- **Storage**: In-memory store
- **Behavior**: Events are stored in memory and reset on each server restart
- **Detection**: When `VERCEL=1`, `AWS_LAMBDA_FUNCTION_NAME` is set, or `NODE_ENV=production`
- **Default Events**: Pre-populated with sample events for immediate functionality

## Files Modified

### `app/api/events/config.ts` (NEW)
- Environment detection logic
- Configuration for storage methods
- Default events for serverless environments

### `app/api/events/route.ts` (UPDATED)
- Hybrid storage implementation
- Automatic fallback from file system to in-memory
- Environment-aware initialization

## How It Works

1. **Environment Detection**: The system checks for serverless environment indicators
2. **Storage Selection**: Chooses file system for local dev, in-memory for production
3. **Fallback**: If file system write fails, automatically falls back to in-memory
4. **Default Data**: Serverless environments get pre-populated with sample events

## Benefits

✅ **Works in all environments** - Local development and production deployment  
✅ **No breaking changes** - Existing functionality preserved  
✅ **Automatic fallback** - Graceful degradation if file system fails  
✅ **Default content** - Users see sample events immediately in production  
✅ **Easy to extend** - Ready for database integration later  

## Future Enhancements

For production use, consider integrating with:
- **Database**: PostgreSQL, MySQL, MongoDB
- **Cloud Storage**: AWS S3, Google Cloud Storage
- **External APIs**: Content management systems
- **Caching**: Redis for better performance

## Testing

### Local Development
```bash
# Events persist to data/events.json
curl http://localhost:3000/api/events
```

### Production Simulation
```bash
# Set environment to simulate production
export NODE_ENV=production
npm run dev
# Events use in-memory store with defaults
```

## Admin Access

The admin interface at `/admin/events` works in both environments:
- **Local**: Changes persist to file system
- **Production**: Changes stored in memory (reset on restart)

**Admin Password**: `CFG2025`
