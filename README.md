### Project Overview

This project is a Pantry Management application built with Next.js, React, and Firebase. The application allows users to manage their pantry items effectively by providing features such as adding, updating, deleting, and searching for pantry items. Additionally, the app supports sorting items based on various criteria to help users better organize their pantry.

### Key Features

1. **Add Item to Pantry**:
   - Users can add new items to their pantry with details such as name, quantity, expiry date, category, and user ID.
   - Form fields are cleared after an item is successfully added.

2. **Edit Item in Pantry**:
   - Users can update existing pantry items.
   - The input fields are pre-filled with the current item data when editing.
   - Users can cancel editing mode to discard changes.

3. **Delete Item from Pantry**:
   - Users can delete pantry items.
   - If the item's quantity is more than one, deleting an item will decrement the quantity by one instead of removing the entire item.
   - Toast notifications are displayed to confirm the deletion of items.

4. **Search Functionality**:
   - Users can search for pantry items by name, category, or user ID.
   - The search is case-insensitive and displays items if the search input matches at least 50% of the category or user ID.
   - If the search input matches a substring of the item name, the item is displayed regardless of the percentage match.

5. **Sorting Options**:
   - Users can sort pantry items by category, expiry date, date added, or user ID.
   - The display of secondary text for items changes based on the selected sorting option.

6. **Real-time Feedback**:
   - Toast notifications provide immediate feedback for actions such as adding or deleting items.

7. **Responsive Design**:
   - The layout adjusts for different screen sizes, with the inventory list and item form displayed side by side on larger screens and stacked on smaller screens.

### Project Structure

- **`components/`**:
  - `PantryForm.tsx`: Component for adding and editing pantry items.
  - `PantryList.tsx`: Main component for displaying and managing the list of pantry items.

- **`lib/`**:
  - `firebase.ts`: Firebase configuration and functions for interacting with Firestore (adding, updating, deleting, fetching items).
  - `types.ts`: Type definitions for pantry items.

### Technologies Used

- **Next.js**: Framework for server-rendered React applications.
- **React**: JavaScript library for building user interfaces.
- **Firebase**: Backend-as-a-Service providing Firestore for data storage.
- **Material-UI**: React component library for implementing Google's Material Design.
- **Lodash**: Utility library providing functions like debounce for optimization.
- **React Hot Toast**: Library for displaying toast notifications.

### How to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd inventory-management
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Firebase**:
   - Create a Firebase project and configure Firestore.
   - Set up environment variables in a `.env.local` file with your Firebase configuration:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the App in Your Browser**:
   - Navigate to `http://localhost:3000` to view the application.

This project provides a robust solution for managing pantry items with an intuitive user interface and real-time feedback.
