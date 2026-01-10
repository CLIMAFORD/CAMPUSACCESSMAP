# Smart Campus Access Map - Symbology Guide

## Professional Symbology Updates for Official Presentations

This document outlines the enhanced symbology (visual representation) of all shape file layers in the Smart Campus Access Map, optimized for clear, professional presentations.

---

## Layer Symbology Overview

### 1. **Maseno Town (Layer 1)**
- **Feature Type:** Polygon (Land Area)
- **Stroke Color:** Coral Red `rgba(200, 60, 56, 1.0)`
- **Fill Color:** Light Coral `rgba(220, 100, 90, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners for modern appearance
- **Use Case:** Urban settlement boundaries

### 2. **Forest Areas (Layer 2)**
- **Feature Type:** Polygon (Natural Areas)
- **Stroke Color:** Forest Green `rgba(76, 110, 56, 1.0)`
- **Fill Color:** Medium Green `rgba(110, 160, 75, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 75%
- **Line Style:** Rounded corners
- **Use Case:** Forest/vegetation coverage areas

### 3. **Maseno University Boundary (Layer 3)**
- **Feature Type:** Polygon (Institution Boundary)
- **Stroke Color:** Dark Olive Green `rgba(88, 130, 50, 1.0)`
- **Fill Color:** Light Olive Green `rgba(150, 190, 90, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** University main campus boundary

### 4. **Forest Areas Extended (Layer 4)**
- **Feature Type:** Polygon (Natural Features)
- **Stroke Color:** Dark Orange-Brown `rgba(200, 120, 20, 1.0)`
- **Fill Color:** Light Orange `rgba(240, 160, 40, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 75%
- **Line Style:** Rounded corners
- **Use Case:** Secondary forest or vegetation areas

### 5. **Agricultural Fields (Layer 5)**
- **Feature Type:** Polygon (Land Use)
- **Stroke Color:** Mauve `rgba(180, 100, 120, 1.0)`
- **Fill Color:** Light Mauve `rgba(220, 140, 160, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 75%
- **Line Style:** Rounded corners
- **Use Case:** Agricultural/crop areas

### 6. **Niles Area (Layer 6)**
- **Feature Type:** Polygon (Geographic Area)
- **Stroke Color:** Maroon `rgba(160, 50, 100, 1.0)`
- **Fill Color:** Light Magenta `rgba(210, 90, 140, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** Named geographic region boundaries

### 7. **College Campus (Layer 7)**
- **Feature Type:** Polygon (Campus Area)
- **Stroke Color:** Olive Gold `rgba(160, 140, 40, 1.0)`
- **Fill Color:** Light Gold `rgba(220, 190, 70, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 75%
- **Line Style:** Rounded corners
- **Use Case:** College/academic facility boundaries

### 8. **Siriba Area (Layer 8)**
- **Feature Type:** Polygon (Geographic Area)
- **Stroke Color:** Dark Purple `rgba(100, 50, 120, 1.0)`
- **Fill Color:** Medium Purple `rgba(160, 100, 170, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** Named geographic region boundaries

### 9. **Niles Buildings (Layer 9)**
- **Feature Type:** Polygon (Building Structures)
- **Stroke Color:** Brown-Tan `rgba(140, 130, 100, 1.0)`
- **Fill Color:** Light Tan `rgba(200, 185, 150, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** Building footprints and structures

### 10. **Siriba Buildings (Layer 10)**
- **Feature Type:** Polygon (Building Structures)
- **Stroke Color:** Dark Red `rgba(180, 50, 45, 1.0)`
- **Fill Color:** Light Red `rgba(220, 80, 70, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** Building footprints and structures

### 11. **College Campus Buildings (Layer 11)**
- **Feature Type:** Polygon (Building Structures)
- **Stroke Color:** Deep Purple `rgba(110, 70, 130, 1.0)`
- **Fill Color:** Light Purple `rgba(160, 110, 180, 1.0)`
- **Stroke Weight:** 2.0px
- **Fill Opacity:** 80%
- **Line Style:** Rounded corners
- **Use Case:** Building footprints and structures

### 12. **Maseno Roads (Layer 12)**
- **Feature Type:** LineString (Road Network)
- **Stroke Color:** Olive Green `rgba(80, 110, 50, 1.0)`
- **Stroke Weight:** 5.0px
- **Line Style:** Rounded corners for smooth appearance
- **Fill Opacity:** 0 (No fill for line features)
- **Use Case:** Primary and secondary road networks

---

## Design Principles Applied

### 1. **Visual Hierarchy**
- Buildings and structures use stronger, more saturated colors
- Natural features (forests, fields) use muted, organic tones
- Roads stand out with medium weight and distinctive color

### 2. **Color Accessibility**
- Colors chosen for colorblind-friendly presentation
- Sufficient contrast between stroke and fill colors
- Distinct hues for easy layer differentiation

### 3. **Professional Appearance**
- Rounded line caps and joins for modern, polished look
- Consistent stroke weights (2.0-5.0px) based on feature type
- Opacity levels (75-80%) provide clarity without obscuring base map

### 4. **Interactive Experience**
- All layers remain interactive (hover/click enabled)
- Subtle opacity prevents visual overwhelming
- Balanced color palette supports extended viewing

---

## Color Palette Reference

| Layer | Category | Stroke Color | Fill Color |
|-------|----------|--------------|-----------|
| Maseno Town | Settlement | Coral Red | Light Coral |
| Forest 2 | Natural | Forest Green | Medium Green |
| Maseno University | Institution | Dark Olive | Light Olive |
| Forests 4 | Natural | Dark Orange | Light Orange |
| Fields | Agriculture | Mauve | Light Mauve |
| Niles | Geography | Maroon | Light Magenta |
| College Campus | Institution | Olive Gold | Light Gold |
| Siriba | Geography | Dark Purple | Medium Purple |
| Niles Buildings | Structure | Brown-Tan | Light Tan |
| Siriba Buildings | Structure | Dark Red | Light Red |
| CC Buildings | Structure | Deep Purple | Light Purple |
| Roads | Infrastructure | Olive Green | N/A (Lines) |

---

## Best Practices for Presentations

1. **Use Print Preview** - Test layer visibility and color accuracy before printing
2. **Zoom Appropriately** - Ensure all layers are visible and distinguishable at intended zoom level
3. **Legend Inclusion** - Always include a legend showing layer names and colors
4. **Backdrop Selection** - Use light basemap backgrounds to enhance contrast
5. **Annotation** - Add descriptive labels for key features and boundaries

---

## Technical Implementation

### CSS Properties Modified:
- `lineCap: 'round'` - Smooth line endpoints
- `lineJoin: 'round'` - Smooth line joints
- `weight: 2.0-5.0` - Appropriate visual weight
- `fillOpacity: 0.75-0.80` - Semi-transparent fills for clarity

### File Location:
- Configuration: `index.html` (Lines 618-1670)
- Style Functions: `style_[LayerName]_0()`

---

## Customization Guide

To modify a layer's symbology, edit the corresponding style function in `index.html`:

```javascript
function style_[LayerName]_0() {
    return {
        pane: 'pane_[LayerName]',
        opacity: 1,
        color: 'rgba(R, G, B, 1.0)',           // Stroke color
        weight: 2.0,                            // Stroke width in pixels
        fill: true,
        fillOpacity: 0.8,                       // Fill transparency
        fillColor: 'rgba(R, G, B, 1.0)',       // Fill color
        interactive: true,
    }
}
```

### Color Format: RGBA
- R, G, B: 0-255 (Red, Green, Blue values)
- A: 0-1 (Opacity: 0=transparent, 1=opaque)

Example: `rgba(200, 60, 56, 1.0)` = Fully opaque coral red

---

## Last Updated
January 10, 2026

**Version:** Professional Symbology Update v1.0

---

## Notes for Official Presentations

✓ All layers have been professionally styled for clarity
✓ Colors are distinct and accessible
✓ Consistent visual weight enhances professional appearance
✓ Interactive features preserved for stakeholder engagement
✓ Ready for printing and digital displays
