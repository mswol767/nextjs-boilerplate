# Events Management System

## Overview
The Cromwell Fish & Game Club now has a comprehensive events management system that allows administrators to easily add, edit, and remove events from the website.

## Features

### 🎯 **Admin Interface**
- **Easy Event Management**: Add, edit, and delete events through a user-friendly interface
- **Real-time Updates**: Changes are immediately reflected on the public website
- **Form Validation**: Comprehensive validation ensures data integrity
- **Responsive Design**: Works on desktop and mobile devices

### 🔧 **Technical Features**
- **RESTful API**: Full CRUD operations via `/api/events`
- **Data Persistence**: Events stored in `data/events.json`
- **Fallback System**: Gracefully falls back to `public/events.json` if API fails
- **Type Safety**: Full TypeScript coverage with proper interfaces

## How to Use

### 1. Access the Admin Panel
1. Go to `/admin/events` (or click "Manage Events" from the waitlist admin)
2. Sign in with your admin password
3. You'll see the events management interface

### 2. Adding Events
1. Click "Add New Event"
2. Fill in the form:
   - **Title**: Event name (required, min 3 characters)
   - **Description**: Event details (optional)
   - **Start Date/Time**: When the event begins (required)
   - **Duration**: Length in minutes (required, 1-1440 minutes)
3. Click "Add Event"

### 3. Editing Events
1. Find the event you want to edit
2. Click the "Edit" button
3. Modify the fields as needed
4. Click "Update Event"

### 4. Deleting Events
1. Find the event you want to delete
2. Click the "Delete" button
3. Confirm the deletion

## API Endpoints

### GET `/api/events`
Retrieve all events
```json
{
  "ok": true,
  "data": [
    {
      "id": "event-1234567890-abc123",
      "title": "Monthly Meeting",
      "description": "Regular club meeting",
      "start": "2024-01-15T18:30:00.000Z",
      "durationMinutes": 60
    }
  ]
}
```

### POST `/api/events`
Create a new event
```json
{
  "title": "New Event",
  "description": "Event description",
  "start": "2024-01-15T18:30:00.000Z",
  "durationMinutes": 90
}
```

### PUT `/api/events`
Update an existing event
```json
{
  "id": "event-1234567890-abc123",
  "title": "Updated Event Title",
  "description": "Updated description"
}
```

### DELETE `/api/events?id=event-id`
Delete an event

## Data Storage

Events are stored in `data/events.json` with the following structure:
```json
[
  {
    "id": "event-1234567890-abc123",
    "title": "Event Title",
    "description": "Event description",
    "start": "2024-01-15T18:30:00.000Z",
    "durationMinutes": 60
  }
]
```

## Validation Rules

- **Title**: Required, minimum 3 characters
- **Start Date**: Required, valid date format
- **Duration**: Required, between 1 and 1440 minutes (24 hours)
- **Description**: Optional

## Integration

The events management system integrates seamlessly with the existing website:

1. **Public Events Display**: Events automatically appear on the main page
2. **Calendar Integration**: Google Calendar and .ics download links work automatically
3. **Responsive Design**: Events display properly on all devices
4. **Admin Navigation**: Easy access from other admin pages

## Security

- Admin authentication required for all management operations
- Server-side validation prevents invalid data
- Proper error handling and user feedback

## Future Enhancements

Potential improvements for the events system:
- Event categories/tags
- Recurring events
- Event capacity limits
- RSVP functionality
- Event images
- Email notifications for new events
