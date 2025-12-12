# Migration Instructions - Updated

## The Problem

The migration script failed because:
1. One vendor is missing the `userId` field
2. The new security rules prevent the script from accessing data

## Solution: Use Admin Migration Script

I've created an admin version that bypasses security rules.

### Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `studio-2143552053-ccbad`
3. Click the gear icon → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file as `service-account-key.json` in your project root folder

### Step 2: Add to .gitignore

Make sure `service-account-key.json` is in your `.gitignore`:

```bash
echo "service-account-key.json" >> .gitignore
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install `firebase-admin` which is needed for the admin script.

### Step 4: Fix the Vendor Missing userId

Before running migration, you need to add the `userId` field to the vendor that's missing it:

1. Go to Firebase Console → Firestore Database
2. Find vendor with ID: `5vHwovN6jnaQcohGEiWKNcHM0bL2`
3. Click on it to edit
4. Add a new field:
   - Field name: `userId`
   - Type: `string`
   - Value: The Firebase Auth UID of the vendor owner

**How to find the vendor's Firebase Auth UID:**
- Go to Firebase Console → Authentication
- Find the vendor's email in the users list
- Copy their UID
- Paste it as the `userId` value

### Step 5: Run Admin Migration

```bash
npm run migrate:admin
```

This will:
- Use admin privileges to bypass security rules
- Update all products and orders
- Show detailed progress

## Alternative: Manual Fix

If you don't want to use the migration script, you can manually update the data in Firestore Console:

1. For each product:
   - Change `vendorId` from vendor document ID to vendor's `userId`

2. For each order:
   - Change `vendorId` from vendor document ID to vendor's `userId`

## Checking the Login Page

Since the browser extension isn't set up, you can manually check the login page:

1. Open your browser
2. Go to: `http://localhost:3000/auth`
3. You should see the login/signup page

The dev server is already running on port 3000.
