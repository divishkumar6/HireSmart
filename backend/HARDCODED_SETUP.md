# Hardcoded Setup - No Seeding Required

## What Changed

The SmartHire backend now automatically creates default users when the server starts, eliminating the need for manual seeding.

## Default Users Created Automatically

When you start the server for the first time, these users are automatically created:

- **Admin**: admin@smarthire.com / password123
- **Recruiter**: recruiter@smarthire.com / password123

## Available Scripts

- `npm start` - Start production server (creates default users automatically)
- `npm run dev` - Start development server (creates default users automatically)
- `npm run init` - Optional: Create sample drives and candidates
- `npm run verify` - Check if default users exist
- `npm run seed` - Legacy: Full seed with extensive sample data (still available)

## Quick Start

1. Set up your `.env` file with MongoDB connection
2. Run `npm run dev` or `npm start`
3. Default users are created automatically
4. Login with the credentials above

## Optional Sample Data

If you want sample drives and candidates for testing:

```bash
npm run init
```

This creates 2 sample drives with basic structure.

## Verification

To check if default users were created successfully:

```bash
npm run verify
```

## Benefits

- No manual seeding step required
- Faster setup process
- Default users always available
- Still compatible with existing seed data if needed