# How to Fix the "generateStaticParams" Error

The error occurs because the dev server is using a cached version of the old config that had `output: 'export'`.

## Solution

**You need to restart the dev server:**

1. Stop the current dev server (Ctrl+C or kill the process)
2. Clear the cache: `rm -rf .next`
3. Start fresh: `npm run dev`

The dev server should now work correctly with the dynamic routes.

## Verification

After restarting, you should be able to:
- Click on any tile in the catalog
- Navigate to `/reference/[tileId]` without errors
- View the tile details and gallery

---

**Note:** This is a one-time fix. Once the dev server restarts with the correct config, everything will work as expected.
