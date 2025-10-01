# Building the Module

This guide explains how to build and package the Companion module for distribution.

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

## Building the Module

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the module:**
   ```bash
   npm run build
   ```

   This command uses `@companion-module/tools` to:
   - Bundle all source files
   - Copy necessary files (manifest.json, HELP.md)
   - Create a compressed package
   - Generate output in `pkg/` directory
   - Create a distributable `.tgz` file

## Build Output

After building, you will have:

- **`pkg/`** - Directory containing the packaged module:
  - `main.js` - Bundled source code
  - `package.json` - Package metadata
  - `companion/` - Module metadata files
    - `manifest.json` - Module manifest
    - `HELP.md` - Help documentation

- **`facebook-apivideo-1.0.0.tgz`** - Compressed package file for distribution

## Using the Built Module

### Development Mode

During development, you don't need to build the module. Simply:

1. Create a `companion-module-dev` folder
2. Clone this repository into it
3. Point Companion's "Developer modules path" to the `companion-module-dev` folder
4. Companion will automatically reload when you save changes

### Production Distribution

To distribute the module:

1. Build the module using `npm run build`
2. The `.tgz` file can be:
   - Imported directly into Companion via the module import feature
   - Submitted to the Companion module repository
   - Shared with other users

## Cleaning Build Artifacts

To remove build artifacts:

```bash
rm -rf pkg/
rm -f *.tgz
```

## Build Scripts

The following scripts are available in `package.json`:

- `npm run build` - Build and package the module

## Troubleshooting

### Build fails with module not found

Ensure all dependencies are installed:
```bash
npm install
```

### Build creates files in wrong location

Make sure you're running the build command from the project root directory.

### Module doesn't load in Companion

1. Check that `companion/manifest.json` is properly formatted
2. Verify that `main.js` is specified correctly in manifest
3. Check Companion logs for specific error messages

## Official Documentation

For more information about Companion module development:
- [Companion Module Wiki](https://github.com/bitfocus/companion-module-base/wiki)
- [Module Packaging](https://github.com/bitfocus/companion-module-base/wiki/Module-packaging)
- [Releasing Your Module](https://github.com/bitfocus/companion-module-base/wiki/Releasing-your-module)

