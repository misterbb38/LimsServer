# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run server` - Start development server with nodemon
- `npm start` - Start production server
- `npm run dev` - Run both backend server and frontend client concurrently

### Testing
- The project uses Mocha and Chai for testing (see devDependencies)
- Test files should follow standard patterns for API endpoint testing

## Architecture Overview

This is a LIMS (Laboratory Information Management System) built with Node.js, Express, and MongoDB. The system manages medical laboratory analyses, test results, and patient data.

### Core Domain Models

**Analyse (Analysis)**: Central entity representing a medical analysis order
- Contains patient info, selected tests, pricing, and payment status
- Has complex pricing logic based on partner types (assurance, ipm, sococim, clinique)
- Includes automatic calculations for costs, advances, and balances
- References multiple tests and results

**Resultat (Result)**: Stores test results with complex medical calculations
- Contains automated calculations for NFS (blood count), biochemistry parameters
- Has extensive `exceptions` field for specialized medical calculations (PSA ratios, kidney function, etc.)
- Uses Mongoose hooks for automatic calculation of derived values

**User**: Multi-role system supporting patients, medical staff, and partners
- User types: patient, superadmin, medecin, technicien, preleveur, acceuil, partenaire
- Partners have special pricing relationships with analyses

**Test**: Defines available laboratory tests with multiple pricing tiers
- Different prices for different partner types and patient categories

### Key Features

**Medical Calculations**: The system performs automatic medical calculations including:
- Blood count indices (VGM, TCMH, CCMH, IDR-CV)
- Kidney function (creatinine clearance, DFG/eGFR)
- Liver function (bilirubin calculations)
- Lipid profiles (LDL cholesterol via Friedewald formula)
- And many other specialized medical calculations

**Partner Integration**: Complex pricing system with multiple partner types
- Different pricing tiers for insurance companies, medical institutions
- Automatic cost calculations based on partner agreements

**Document Management**: PDF generation and file handling
- Cloudinary integration for file storage
- PDF report generation using PuppeteerJS
- Template-based reporting system

### Technical Architecture

**MVC Pattern**: Standard Express.js structure
- `/models` - Mongoose schemas with business logic
- `/controllers` - Business logic and request handling
- `/routes` - API endpoint definitions
- `/middleware` - Authentication, error handling, file upload

**Database**: MongoDB with Mongoose ODM
- Complex schemas with automated calculations via hooks
- Reference relationships between analyses, tests, results, and users

**Authentication**: JWT-based with role-based access control

**File Handling**: Multer for uploads, Cloudinary for storage

**External Services**:
- SMS integration via smsorange package
- PDF generation with PuppeteerJS
- Cloud storage with Cloudinary

## Important Implementation Notes

- All medical calculations happen automatically via Mongoose pre-save hooks
- The `Resultat` model contains extremely complex calculation logic that should be modified carefully
- Partner pricing logic in `Analyse` model is business-critical and affects billing
- User roles control access to different parts of the system
- File uploads are handled via Cloudinary, check environment variables for configuration