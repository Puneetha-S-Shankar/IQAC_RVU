# IQAC Portal - RV University

This project is a comprehensive web application for the Internal Quality Assurance Cell (IQAC) at RV University. It provides a centralized platform for managing curriculum documents, tracking academic progress, and ensuring quality standards are met across all programs.

## Features

-   **Secure Authentication**: Role-based access control for administrators, users, and viewers.
-   **Document Management**: Upload, view, and manage academic documents (e.g., syllabi, reports) using MongoDB GridFS for scalable file storage.
-   **Dynamic Previews**: A custom-built, in-app file viewer that securely previews PDFs, images, and text files directly from the database.
-   **Program-Specific Dashboards**: Intuitive UI for navigating curriculum development documents by year, batch, and program.
-   **Modern Tech Stack**: Built with the MERN stack (MongoDB, Express.js, React, Node.js) for a robust and scalable solution.

---

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   Node.js and npm (or yarn) installed on your machine.
-   A MongoDB Atlas account (or a local MongoDB instance).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd IQAC_RVU
    ```

2.  **Install Frontend Dependencies:**
    Navigate to the root of the React application and install the required npm packages.
    ```sh
    # From the IQAC_RVU directory
    npm install
    ```

3.  **Install Backend Dependencies:**
    Navigate to the server directory and install its dependencies.
    ```sh
    cd server
    npm install
    ```

### Environment Configuration

The backend server requires a set of environment variables to connect to the database and configure its settings.

1.  **Create a `.env` file** in the `IQAC_RVU/server/` directory.

2.  **Copy and paste the following template** into your new `.env` file and replace the placeholder values with your actual configuration.

    ```env
    # .env.example

    # MongoDB Atlas Connection String
    # Replace with your own Atlas connection string. Make sure to specify the database name (e.g., /IQAC).
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

    # JSON Web Token Secret
    # A long, random string used for signing authentication tokens.
    JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random

    # Server Port
    # The port the backend Express server will run on.
    PORT=5000

    # Optional: File Upload Configuration
    MAX_FILE_SIZE=10485760 # Maximum file size in bytes (e.g., 10MB)
    UPLOAD_PATH=./uploads # The directory to store temporary files if not using GridFS directly
    CORS_ORIGIN=http://localhost:5173 # The frontend URL for CORS policy
    ```

---

## Running the Application

You will need to run the frontend and backend servers in separate terminals.

1.  **Start the Backend Server:**
    Navigate to the server directory and run the start command.
    ```sh
    cd server
    npm start
    # The server will start on the port specified in your .env file (e.g., http://localhost:5000)
    ```

2.  **Start the Frontend Development Server:**
    In a new terminal, navigate to the root `IQAC_RVU` directory and run the dev command.
    ```sh
    # From the IQAC_RVU directory
    npm run dev
    # The React application will be available at http://localhost:5173
    ```

Once both servers are running, you can access the application by navigating to `http://localhost:5173` in your web browser.

---

## Recent Changes

### Major Workflow Enhancement - January 2025
**Updated by: IamSamk**

#### 🚀 Complete Assignment Workflow System
Implemented a comprehensive document management workflow with the following key features:

**1. Assignment Creation & Management**
- Admin users can create assignments with designated initiators and reviewers
- Course-specific document assignments with customizable deadlines
- Assignment editing capabilities in the Admin Roles → Records section
- Validation to prevent same person from being both initiator and reviewer

**2. Document Upload & Review Process**
- **Initiator Workflow**: Upload course documents with file validation
- **Review Workflow**: Professional comment modals (replaced browser prompts)
- **Document Preview**: Full-screen document viewing with download options
- **Approval Chain**: Reviewer approval → Admin final approval → Publication

**3. Enhanced Notification System**
- Real-time notifications for all workflow stages
- Clickable notifications that navigate directly to assignments
- Comprehensive notification types:
  - File submission alerts for reviewers
  - Approval/rejection notifications for initiators
  - Admin notifications for final approval requests
  - Assignment change notifications

**4. Security & Authentication Improvements**
- Implemented bcrypt password encryption across all users
- Fixed login issues for test accounts (test3@iqac.com resolved)
- Role-based access control with proper validation
- Secure file serving through GridFS

**5. User Interface Enhancements**
- Professional modal interfaces for comments and document preview
- Responsive design improvements
- Status badges with color coding for assignment progress
- Clean notification center with read/unread states
- Course-specific document visibility

**6. Data Management & Cleanup**
- Removed duplicate assignments where same user was initiator and reviewer
- Database optimization and proper indexing
- Temporary file cleanup and project organization
- Enhanced error handling and validation

#### 🔧 Technical Improvements
- **Frontend**: React context management, modal systems, notification handling
- **Backend**: RESTful API endpoints, GridFS file management, MongoDB aggregation
- **Database**: Enhanced schemas with proper enums and validation
- **File System**: GridFS integration for scalable document storage

#### 📋 Workflow Summary
1. **Admin creates assignment** → Users receive notifications
2. **Initiator uploads document** → Reviewer gets notification
3. **Reviewer approves/rejects** → Initiator and Admin notified
4. **Admin final approval** → Document published and accessible
5. **All notifications clickable** → Direct navigation to assignments

The system now provides a complete, production-ready document workflow management solution for IQAC operations.

---