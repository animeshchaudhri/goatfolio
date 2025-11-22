import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Morning Spam Cleaner',
  description: 'Privacy policy for Morning Spam Cleaner app - A tool to clean unwanted Good Morning images from your device',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-b-2 border-gray-900 pb-6 mb-8">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2">
            PRIVACY POLICY
          </h1>
          <p className="text-xl text-gray-700 font-semibold">
            Morning Spam Cleaner
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mb-8 uppercase tracking-wide">
          Effective Date: November 22, 2025
        </p>

        <div className="space-y-8 text-gray-800 leading-relaxed">
          <section>
            <p className="text-base">
              This Privacy Policy ("Policy") governs the collection, use, and disclosure of information by Morning Spam Cleaner 
              (hereinafter referred to as "the Application", "we", "us", or "our"). By installing, accessing, or using the 
              Application, you ("User", "you", or "your") acknowledge that you have read, understood, and agree to be bound by 
              the terms of this Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              1. Scope and Purpose
            </h2>
            <p className="mb-4">
              The Application is designed to identify and facilitate the removal of unwanted greeting images, commonly referred 
              to as "Good Morning" messages, from the User's mobile device. This Policy outlines the Application's data practices, 
              including what information is accessed, how it is processed, and the measures taken to protect User privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              2. Information Collection and Processing
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.1 Local Processing</h3>
            <p className="mb-4">
              The Application operates exclusively on the User's device. All image scanning, text recognition, and analysis 
              functions are performed locally. The Application does not transmit, upload, or transfer any personal information, 
              images, or data to remote servers, third parties, or external networks.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.2 Data Accessed</h3>
            <p className="mb-2">The Application accesses the following data solely for operational purposes:</p>
            <ul className="list-none space-y-2 ml-6 mb-4">
              <li className="pl-4 border-l-2 border-gray-400">
                <span className="font-semibold">Image Files:</span> The Application scans image files stored on the User's device 
                to identify potential spam or unwanted greeting images.
              </li>
              <li className="pl-4 border-l-2 border-gray-400">
                <span className="font-semibold">Optical Character Recognition (OCR):</span> Text recognition technology is applied 
                locally to detect relevant textual content within images.
              </li>
              <li className="pl-4 border-l-2 border-gray-400">
                <span className="font-semibold">Scan History:</span> Records of scanning activity, file paths, and detection results 
                are stored locally on the device for User reference.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">2.3 Data Not Collected</h3>
            <p className="mb-2">The Application expressly does NOT:</p>
            <ul className="list-none space-y-2 ml-6 mb-4">
              <li className="pl-4 border-l-2 border-gray-400">Collect, store, or transmit personally identifiable information (PII)</li>
              <li className="pl-4 border-l-2 border-gray-400">Upload images or media files to any server or cloud storage</li>
              <li className="pl-4 border-l-2 border-gray-400">Track User behavior, usage patterns, or analytics</li>
              <li className="pl-4 border-l-2 border-gray-400">Display advertisements or implement advertising frameworks</li>
              <li className="pl-4 border-l-2 border-gray-400">Share data with third-party services or analytics platforms</li>
              <li className="pl-4 border-l-2 border-gray-400">Establish network connections for data transmission purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              3. Permissions and Access Rights
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">3.1 Storage and Media Access</h3>
            <p className="mb-4">
              The Application requires permission to access media files and storage on the User's device. This permission is 
              utilized exclusively to read image files for scanning purposes. Access is limited to directories explicitly 
              authorized by the User, and the Application cannot access files outside the scope of granted permissions.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">3.2 Notification Permission</h3>
            <p className="mb-4">
              Notification permission is requested to inform Users of scanning progress, completion status, or background 
              operations. No personal data is transmitted through these notifications.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">3.3 Foreground Service</h3>
            <p className="mb-4">
              The Application may utilize foreground services to ensure that lengthy scanning operations are not interrupted 
              when the Application is moved to the background. Despite the nomenclature, no data synchronization or network 
              activity occurs during foreground service operation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              4. Data Retention and Storage
            </h2>
            <p className="mb-4">
              All data generated by the Application, including scan history, file metadata, and detection logs, is stored 
              locally on the User's device. No data is retained on external servers or transmitted to third parties.
            </p>
            <p className="mb-2">
              Users may delete all locally stored data at any time by:
            </p>
            <ul className="list-none space-y-2 ml-6 mb-4">
              <li className="pl-4 border-l-2 border-gray-400">
                Clearing the Application's cache and data through device settings (Settings → Apps → Morning Spam Cleaner → Storage → Clear Data)
              </li>
              <li className="pl-4 border-l-2 border-gray-400">
                Uninstalling the Application, which will remove all associated data from the device
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              5. Children's Privacy
            </h2>
            <p className="mb-4">
              The Application does not knowingly collect personal information from children or any other Users. The Application 
              is designed to be privacy-preserving and does not require user accounts, profiles, registration, or any form of 
              personal identification. The Application may be used by individuals of all ages in compliance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              6. Data Security
            </h2>
            <p className="mb-4">
              As all data processing occurs locally on the User's device and no data is transmitted externally, the Application's 
              security model relies on the device's native security features. We have implemented technical measures to ensure 
              that no data leaves the device during normal operation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              7. Third-Party Services
            </h2>
            <p className="mb-4">
              The Application does not integrate with, transmit data to, or otherwise interact with any third-party services, 
              analytics platforms, advertising networks, or external APIs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              8. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We reserve the right to modify this Privacy Policy at any time. Changes will be effective immediately upon posting 
              the updated Policy on our website. The "Effective Date" at the beginning of this Policy indicates when it was last 
              revised. Continued use of the Application following any modifications constitutes acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              9. User Rights
            </h2>
            <p className="mb-4">
              Given that the Application does not collect or store personal information on external servers, traditional data 
              subject rights (such as access, rectification, or deletion requests) are not applicable. Users maintain complete 
              control over all data on their devices and may delete Application data at any time through device settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              10. Contact Information
            </h2>
            <p className="mb-4">
              For questions, concerns, or inquiries regarding this Privacy Policy or the Application's data practices, please 
              contact us at:
            </p>
            <p className="ml-6 mb-4">
              Website: <a href="https://animesh.us" className="text-blue-700 underline font-medium">https://animesh.us</a>
            </p>
          </section>

          <section className="mt-12 pt-8 border-t-2 border-gray-300">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase">
              Policy Summary
            </h2>
            <div className="bg-gray-50 border border-gray-300 p-6 rounded">
              <p className="font-semibold mb-3 text-gray-900">Key Points:</p>
              <ul className="list-none space-y-2">
                <li className="flex items-start">
                  <span className="mr-3 text-gray-600">•</span>
                  <span>Zero server-side data collection or transmission</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-600">•</span>
                  <span>No user tracking, analytics, or behavioral monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-600">•</span>
                  <span>No advertisements or third-party integrations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-600">•</span>
                  <span>All processing performed locally on device</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-gray-600">•</span>
                  <span>Complete user control over all application data</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-600">
            <p>
              By using Morning Spam Cleaner, you acknowledge that you have read and understood this Privacy Policy 
              and agree to its terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
