# Color Coding Update - Specification Compliance

## Updated Color Coding System

The system now uses the exact color coding specified in the project requirements:

### Status Colors (Specification Compliant)

| Color | Status | Description |
|-------|--------|-------------|
| **Grey** | `grey` | Not connected to SOSON |
| **Black** | `black` | System not accessible |
| **Green** | `green` | System active with no alarms |
| **Yellow** | `yellow` | System active with warnings |
| **Red** | `red` | System active with errors |

### Changes Made

#### 1. Frontend Updates (`frontend/src/App.js`)

**Color Coding in Markers:**
- Updated `createCustomIcon()` function to use specification-compliant colors
- Added support for both new status values and legacy status mapping
- Updated status panel indicators to show correct colors

**Status Panel:**
- Updated status labels to match specification:
  - "Not Connected" (Grey)
  - "Not Accessible" (Black) 
  - "Active (No Alarms)" (Green)
  - "Active (Warnings)" (Yellow)
  - "Active (Errors)" (Red)

**Filter Options:**
- Updated status filter dropdown to use specification-compliant options
- Updated filter logic to handle status mapping

**Analytics:**
- Updated status counting to use new status values
- Updated uptime calculation to use 'green' status instead of 'online'

#### 2. Backend Updates (`backend/main_specification.py`)

**Status Determination:**
- Integrated with `status_config.py` for configurable status criteria
- Uses specification-compliant status determination logic
- Maps system data to correct status values

**API Responses:**
- Status updates now use specification-compliant status values
- WebSocket broadcasts include correct status information

#### 3. Status Configuration (`backend/status_config.py`)

**Configurable Criteria:**
- Temperature thresholds (warning: 60°C, error: 80°C)
- Pressure thresholds (warning: 3.0 bar, error: 5.0 bar)
- Disk volume thresholds (warning: 85%, error: 95%)
- Connection timeouts (5 minutes timeout, 30 minutes offline)

**Status Logic:**
- `grey`: Not connected to SOSON (no recent data)
- `black`: System not accessible (offline too long)
- `red`: Critical errors (temperature > 80°C, pressure > 5.0 bar, disk > 95%)
- `yellow`: Warnings (temperature > 60°C, pressure > 3.0 bar, disk > 85%)
- `green`: All systems healthy

### Legacy Support

The system maintains backward compatibility with existing data:
- Legacy status values (`online`, `warning`, `offline`, `error`) are automatically mapped to specification-compliant values
- Existing machine data continues to work without modification
- Gradual migration path for existing systems

### Visual Changes

1. **Map Markers**: Now display correct colors based on specification
2. **Status Panel**: Shows specification-compliant status labels and counts
3. **Filter Options**: Updated dropdown with correct status options
4. **Analytics**: Uses new status values for calculations

### Testing

To test the new color coding:

1. **Start the application** with the updated backend
2. **Check map markers** - they should show correct colors based on system status
3. **Verify status panel** - should display specification-compliant labels
4. **Test filtering** - status filter should work with new options
5. **Check analytics** - should use new status values for calculations

### Configuration

Status criteria can be configured through the web interface:
- Navigate to the analytics panel
- Use the status configuration options
- Adjust thresholds as needed for your environment

This update ensures full compliance with the project specification while maintaining backward compatibility and providing a superior user experience.
