# EGFootball5 ⚽

EGFootball5 is a modern, high-performance web application built to streamline the booking and management of 5-a-side football pitches in Egypt. Designed with both players and pitch owners in mind, it provides a comprehensive platform for finding, booking, and managing football matches.

## ✨ Features

*   **Role-Based Access Control**:
    *   **Players**: Find nearby pitches, book matches, join existing matches, and chat with team members in real-time.
    *   **Admins**: Manage specific pitches, approve/reject bookings, and communicate with players.
    *   **Owners**: Oversee the entire platform, manage all pitches and admins, and view global analytics.
*   **Real-time Collaboration**: Powered by Firebase Realtime Database, allowing users to see who is online and chat instantly within their match lobbies.
*   **Multi-language Support (i18n)**: Fully accessible in both English (en) and Arabic (ar).
*   **Secure Authentication**: Seamless login via Google using Firebase Auth.
*   **Responsive UI/UX**: Built with Tailwind CSS and Shadcn UI to provide a beautiful, glassmorphic, and dynamic user experience across all devices.

## 🛠 Tech Stack

*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Shadcn UI
*   **Backend & Services**: Firebase (Firestore, Realtime Database, Auth, Storage)
*   **Language Support**: next-intl
*   **Deployment**: Firebase Hosting / Vercel

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sirahmed8/EGFootball5.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd EGFootball5
    ```
3.  Install NPM packages:
    ```bash
    npm install
    ```
4.  Set up your Firebase configuration in your environment variables.
5.  Run the development server:
    ```bash
    npm run dev
    ```
6.  Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🛡 Security

Please see the `SECURITY.md` file for details on our security policies and how to report vulnerabilities.
