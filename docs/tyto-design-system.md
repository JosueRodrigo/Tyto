# Tyto Design System

Tyto presents operational data with high density without looking like a generic administration template. The interface should feel calm during normal operation and make abnormal states immediately visible.

## Visual language

- **Midnight navy** anchors navigation and dark surfaces.
- **Telemetry emerald** represents healthy, connected and active states.
- **Incident coral** is reserved for errors, destructive actions and urgent attention.
- **Warm amber** represents degraded states and warnings.
- Borders provide hierarchy; shadows should remain subtle and never replace structure.

All product colors are semantic CSS variables in `resources/css/app.css`. Product code should use tokens such as `background`, `card`, `primary`, `muted`, `border` and `chart-*` rather than embedding color values.

## Shape and spacing

- Base radius: `0.75rem`.
- Controls: compact and readable, with a minimum practical target size.
- Panels: use the `tyto-panel` composition for the standard bordered surface.
- Main content: maximum width of `1600px`, allowing telemetry tables and charts to breathe.

## Navigation

The sidebar is the persistent operational map. Active items use an emerald rail and stronger contrast. Sections should describe user intent rather than backend model names. Collapsed navigation must retain tooltips and the Tyto mark.

## Status semantics

| State | Treatment |
| --- | --- |
| Healthy / live | Emerald |
| Degraded / warning | Amber |
| Incident / failed | Coral-red |
| Informational | Blue |
| Unknown / disabled | Muted neutral |

Never communicate status through color alone. Pair it with a label, icon or both.

## Motion

Motion confirms state changes and establishes hierarchy. Keep transitions between 150–250ms. Continuous animation is limited to genuinely live status indicators and must respect reduced-motion preferences.
